import { MCPTool } from "mcp-framework";
import { z } from "zod";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); // 환경 변수에서 API 키 불러오기
const formalityRules = {
  formality: {
    "1점": {
      label: "매우 비격식",
      description: "반말 어미와 자유로운 표현 사용. 축약 및 이모티콘 허용.",
      features: ["-아, -어 어미", "이모지, 의성어", "주어 생략", "인터넷체"],
      examples: ["이거 해", "밥 먹었어?", "고마워요😻", "봐봐요ㅎㅎ"],
      context: ["친구 대화", "SNS 댓글", "캐주얼 커뮤니티"],
    },
    "2점": {
      label: "비격식",
      description: "친근한 해요체 중심. 구어적 표현을 포함.",
      features: ["-해요", "-죠", "감탄 표현", "직접 호칭"],
      examples: ["이거 해봐요", "괜찮아요?", "어디 가요?", "이거 어때요?"],
      context: ["커뮤니티", "개인 블로그", "친근한 고객 응대"],
    },
    "3점": {
      label: "중립적 격식",
      description: "일상적 존대 표현 사용. 서비스 UI 등에서 활용.",
      features: ["기본 해요체", "-해요 / -하시겠어요", "사용자 중심 안내"],
      examples: ["안내 도와드릴게요", "확인해 주세요", "도움이 필요하신가요?"],
      context: ["공식 블로그", "정보성 콘텐츠", "앱/웹 인터페이스"],
    },
    "4점": {
      label: "격식",
      description: "공손한 하십시오체 중심. 정중하고 명확한 어조.",
      features: ["-십시오", "-주시기 바랍니다", "간결/명확한 안내", "격식 높음"],
      examples: ["등록해 주시기 바랍니다", "확인 부탁드립니다", "문의 주십시오"],
      context: ["공공기관", "공식 공지", "기업 고객센터"],
    },
    "5점": {
      label: "매우 격식",
      description: "관료적 표현 및 극존칭. 명사형 서술 강조.",
      features: ["명사화", "체언형 표현", "주어 생략", "강조된 객관성"],
      examples: ["확인 요망", "회신 바랍니다", "조치 바랍니다"],
      context: ["보고서", "공문", "행정 문서", "정책 문서"],
    },
  },
};
function buildFormalityDiagnosisPrompt(input) {
  return `
    [지침]
    아래 텍스트의 격식 수준이 어떤 단계(1~5)에 가까운지 판단하고, 그 이유를 설명해 주세요.

    - 아래 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장이 1~5점 중 어떤 격식 점수에 가까운지 진단해 주세요.
    - 점수 기준: 1 (매우 비격식) ~ 5 (매우 격식)
    - 전체 텍스트의 평균 점수와 이유를 요약해 주세요.

    Formality 기준은 다음과 같습니다.
    ${["1점", "2점", "3점", "4점", "5점"]
      .map((score) => {
        const f = formalityRules.formality[score];
        return `
          [Formality ${score}]
          - 이름: ${f.label}
          - 설명: ${f.description}
          - 특징: ${f.features.join(", ")}
          - 예시: "${f.examples[0]}"`;
      })
      .join("\n\n")}

    [텍스트]
    "${input}"

    [출력 형식]
    - 예측 점수: N
    - 예측 이름: 격식 수준 이름
    - 이유: {내용}
  `.trim();
}
function buildFormalityRewritePrompt(score, input) {
  const rule = formalityRules.formality[score];
  return `
    [지침]
    [원본 텍스트]를 아래 격식 수준으로 바꾸되, **의미는 절대 변경하지 마세요**.
    즉, 정보, 주어, 메시지의 핵심 내용은 그대로 유지하고 **문체(톤과 스타일)만 바꿔 주세요**.

    - 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장을 주어진 격식 점수 (${score})에 맞게 수정해 주세요.
    - 단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    - 전체 글이 격식상 자연스럽고 일관성 있게 읽히도록 조정하세요.
    - 가능한 한 **최소한의 수정**으로 격식 변화를 유도하세요.

    [Formality ${score}번 톤 변환 요청]
    - 톤 이름: ${rule.label}
    - 설명: ${rule.description}
    - 특징: ${rule.features.join(", ")}
    - 예시 문장: "${rule.examples.join(", ")}"

    [원본 텍스트]
    "${input}"

    [출력 형식]
    수정된 전체 텍스트를 자연스럽게 이어서 출력하세요.
  `.trim();
}
export class KFormalityTool extends MCPTool {
  constructor() {
    super(...arguments);
    this.name = "kformality";
    this.description = "한국어 문장의 비격식-격식 수준을 분석하거나, 지정된 점수 수준으로 리라이팅합니다.";
    this.schema = {
      text: {
        type: z.string(),
        description: "분석할 한국어 문장",
      },
      mode: {
        type: z.enum(["diagnose", "rewrite"]),
        description: "모드: diagnose 또는 rewrite",
      },
      formality: {
        type: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4"), z.literal("5")]).optional(),
        description: "목표 격식 점수 (1~5)",
      },
    };
  }
  async execute({ text, mode, formality }) {
    if (mode === "diagnose") {
      const messages = [
        {
          role: "system",
          content:
            "당신은 한국어 문장의 비격식-격식 수준을 분석하는 전문가입니다. 각 점수의 기준은 사용자 프롬프트에 포함되어 있습니다.",
        },
        {
          role: "user",
          content: buildFormalityDiagnosisPrompt(text),
        },
      ];
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages,
      });
      return response.choices[0].message.content;
    }
    if (mode === "rewrite") {
      if (!formality) throw new Error("rewrite 모드에서는 formality 값이 필요합니다.");
      const formalityKey = `${formality}점`;
      if (!["1점", "2점", "3점", "4점", "5점"].includes(formalityKey)) {
        throw new Error("유효한 formality 값이 아닙니다.");
      }
      const messages = [
        {
          role: "system",
          content:
            "당신은 한국어 문장을 지정된 격식 점수(1~5점 스펙트럼: 비격식 ↔ 격식)에 맞게 '문체만' 재작성하는 전문가입니다. 점수의 기준은 사용자 프롬프트에 포함되어 있습니다. 사용자가 제공한 문장을 격식 점수 기준에 따라 **말투, 어투, 표현 방식만 변경**하세요. **의미 변형은 금지입니다.** 문장의 정보 구조(주어, 목적어, 동사)는 반드시 유지되어야 하며, 어미/형식만 변경하세요.",
        },
        {
          role: "user",
          content: buildFormalityRewritePrompt(formalityKey, text),
        },
      ];
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages,
      });
      return response.choices[0].message.content;
    }
    throw new Error("알 수 없는 모드입니다. diagnose 또는 rewrite 중 하나를 선택하세요.");
  }
}
export default KFormalityTool;
