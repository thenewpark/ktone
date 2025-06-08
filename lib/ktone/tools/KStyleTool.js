import { MCPTool } from "mcp-framework";
import { z } from "zod";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); // 환경 변수에서 API 키 불러오기
const styleRules = {
  style: {
    "1점": {
      label: "극히 과업지향적",
      nng_mapping: {
        funny_serious: "Serious",
        enthusiastic_fact: "Matter-of-fact",
      },
      description: "건조하고 설명적이며 감정 표현이 없음. 기능 전달에만 집중.",
      features: ["명령형 표현", "감정 표현 없음", "기술적 어휘", "딱딱한 종결어미"],
      examples: ["시스템 점검으로 인해 접속이 제한됩니다.", "앱을 종료한 후 다시 실행해 주세요."],
      context: ["학술 논문", "연구 보고서", "행정 문서", "기능 설명서", "매뉴얼"],
    },
    "2점": {
      label: "과업지향적",
      nng_mapping: {
        funny_serious: "Serious",
        enthusiastic_fact: "Slightly matter-of-fact",
      },
      description: "정중하지만 감정은 절제된 표현. 기능 전달 + 배려 요소 소량 포함.",
      features: ["설명 중심", "격식 있는 표현", "감정어 절제", "완곡어법"],
      examples: [
        "일시적으로 접속이 원활하지 않을 수 있습니다. 이용에 참고 부탁드립니다.",
        "요청하신 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      ],
      context: ["공식 이메일", "업무 보고서", "시스템 메시지"],
    },
    "3점": {
      label: "중립",
      nng_mapping: {
        funny_serious: "Neutral",
        enthusiastic_fact: "Neutral",
      },
      description: "공감과 과업이 균형잡힌 중립적인 스타일. 안내성과 배려의 균형.",
      features: ["배려 표현 포함", "너무 딱딱하지 않음", "설명과 감정의 균형"],
      examples: [
        "잠시 접속이 어려울 수 있어요. 불편을 드려 죄송합니다.",
        "조금만 기다려 주세요. 데이터를 불러오고 있어요.",
      ],
      context: ["자기소개서", "정보성 블로그", "교육 콘텐츠"],
    },
    "4점": {
      label: "사회정서적",
      nng_mapping: {
        funny_serious: "Slightly funny",
        enthusiastic_fact: "Slightly enthusiastic",
      },
      description: "공감 표현이 두드러지고, 정서적으로 부드러운 표현 사용.",
      features: ["부드러운 말투", "공감 문구 포함", "유연한 종결 어미"],
      examples: [
        "접속이 잠시 원활하지 않을 수 있어요. 조금만 기다려 주세요!",
        "앗, 연결이 끊겼네요. 잠시 후 다시 시도해 주세요 :)",
      ],
      context: ["브랜드 소셜미디어", "온라인 커뮤니티 글", "친근한 고객 응대", "개인 이메일"],
    },
    "5점": {
      label: "극히 사회정서적",
      nng_mapping: {
        funny_serious: "Funny",
        enthusiastic_fact: "Enthusiastic",
      },
      description: "친근하고 감성적이며, 유쾌함과 따뜻함을 강조하는 스타일.",
      features: ["감탄사", "이모지", "친근한 말투", "감정 강조 표현"],
      examples: [
        "헉 😢 접속이 잠시 안 될 수 있어요~ 조금만 기다려 주세요~!",
        "앗! 문제가 생겼네요 💦 금방 해결해드릴게요 :)",
      ],
      context: ["개인 SNS 포스트", "친구 간 메시지", "일상 블로그"],
    },
  },
};
function buildStyleRewritePrompt(style, input) {
  const rule = styleRules.style[style];
  return `
    [지침]
    [원본 텍스트]을 아래 스타일의 말투와 분위기로 바꾸되, **의미는 절대 변경하지 마세요**.
    즉, 정보, 주어, 메시지의 핵심 내용은 그대로 유지하고 **문체(톤과 스타일)만 바꿔 주세요**.

    - 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장을 주어진 스타일 점수 (${style})에 맞게 수정해 주세요.
    - 단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    - 전체 글이 스타일상 자연스럽고 일관성 있게 읽히도록 조정하세요.
    - 가능한 한 **최소한의 수정**으로 최대한 스타일 변화를 유도하세요.

    [Style ${style} 톤 변환 요청]
    - 톤 이름: ${rule.label}
    - 설명: ${rule.description}
    - 스타일 기준 (NNG): Funny–Serious: ${rule.nng_mapping.funny_serious}, Enthusiastic–Fact: ${
    rule.nng_mapping.enthusiastic_fact
  }
    - 특징: ${rule.features.join(", ")}
    - 예시 문장: "${rule.examples[0]}"

    [원본 텍스트]
    "${input}"

    [출력 형식]
    수정된 전체 텍스트를 자연스럽게 이어서 출력하세요.
    `;
}
function buildStyleDiagnosisPrompt(input) {
  return `
    [지침]
    아래 텍스트가 어떤 style 점수에 가까운지 1~5점으로 판단하고, 그 이유를 설명해 주세요.

    - 아래 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장이 1~5점 중 어떤 스타일 점수에 가까운지 진단해 주세요.
    - 점수 기준: 1 (극히 과업지향적) ~ 5 (극히 사회정서적)
    - 전체 텍스트의 평균 점수와 이유를 요약해 주세요.

    Style 기준은 다음과 같습니다.
    ${["1점", "2점", "3점", "4점", "5점"]
      .map((style) => {
        const s = styleRules.style[style];
        return `
          [Style ${style}]
          - 이름: ${s.label}
          - 설명: ${s.description}
          - Tone 기준: Funny–Serious: ${s.nng_mapping.funny_serious}, Enthusiastic–Fact: ${
          s.nng_mapping.enthusiastic_fact
        }
          - 특징: ${s.features.join(", ")}
          - 예시: "${s.examples[0]}"
          `;
      })
      .join("\n")}

    [텍스트]
    "${input}"

    [출력 형식]
    - 예측 점수: N
    - 예측 이름: 스타일 이름
    - 이유: {내용}
    `;
}
export class KStyleTool extends MCPTool {
  constructor() {
    super(...arguments);
    this.name = "kstyle";
    this.description = "텍스트의 사회정서적-과업지향적 스타일 톤을 분석하거나, 지정한 스타일 점수로 리라이팅합니다.";
    this.schema = {
      text: {
        type: z.string(),
        description: "분석할 한국어 문장",
      },
      mode: {
        type: z.enum(["diagnose", "rewrite"]),
        description: "모드: diagnose 또는 rewrite",
      },
      style: {
        type: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4"), z.literal("5")]).optional(),
        description: "목표 스타일 점수 (1~5)",
      },
    };
  }
  async execute({ text, style, mode }) {
    if (mode === "diagnose") {
      const messages = [
        {
          role: "system",
          content:
            "당신은 한국어 문장의 스타일을 1~5점의 스펙트럼(사회정서적 ↔ 과업지향적)으로 평가하는 전문가입니다. 각 점수의 기준은 사용자 프롬프트에 포함되어 있습니다.",
        },
        {
          role: "user",
          content: buildStyleDiagnosisPrompt(text),
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
      if (!style) throw new Error("rewrite 모드에서는 style 값이 필요합니다.");
      const styleKey = `${style}점`;
      if (!["1점", "2점", "3점", "4점", "5점"].includes(styleKey)) {
        throw new Error("유효한 style 값이 아닙니다.");
      }
      const messages = [
        {
          role: "system",
          content:
            "당신은 한국어 문장을 지정된 스타일 점수(1~5점 스펙트럼: 사회정서적 ↔ 과업지향적)에 맞게 '문체만' 재작성하는 전문가입니다. 점수의 기준은 사용자 프롬프트에 포함되어 있습니다. 사용자가 제공한 문장을 스타일 점수 기준에 따라 **말투, 어투, 표현 방식만 변경**하세요.  **의미 변형은 금지입니다.** 문장의 정보 구조(주어, 목적어, 동사)는 반드시 유지되어야 하며, 감정이나 뉘앙스, 어미/형식만 변경하세요.",
        },
        {
          role: "user",
          content: buildStyleRewritePrompt(styleKey, text), // style는 1~5 값이어야 함
        },
      ];
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages,
      });
      return response.choices[0].message.content;
    }
    throw new Error("알 수 없는 모드입니다. 'diagnose' 또는 'rewrite' 중 하나를 선택하세요.");
  }
}
export default KStyleTool;
