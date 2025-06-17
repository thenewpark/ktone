import { MCPTool } from "mcp-framework";
import { z } from "zod";
import OpenAI from "openai";

const styleRules = {
  style: {
    "5점": {
      label: "극히 사회정서적",
      nng_mapping: {
        funny_serious: "Funny",
        enthusiastic_fact: "Enthusiastic",
      },
      description: "친근하고 감성적이며, 유쾌함과 따뜻함을 강조하는 스타일",
      features: ["감탄사", "이모지", "친근한 말투", "감정 강조 표현"],
      examples: ["주방 전등 무슨 색이야~?", "이번 학기 기말고사 언제야? 😅"],
    },
    "4점": {
      label: "사회정서적",
      nng_mapping: {
        funny_serious: "Slightly funny",
        enthusiastic_fact: "Slightly enthusiastic",
      },
      description: "공감 표현이 두드러지고, 정서적으로 부드러운 표현을 사용하는 스타일",
      features: ["부드러운 말투", "공감 문구 포함", "유연한 종결 어미"],
      examples: ["주방 전등 무슨 색이에요?", "혹시 이번 학기 기말고사 기간이 언제인지 알려주실 수 있나요?"],
    },
    "3점": {
      label: "중립",
      nng_mapping: {
        funny_serious: "Neutral",
        enthusiastic_fact: "Neutral",
      },
      description: "공감과 과업이 균형잡힌 중립적인 스타일",
      features: ["배려 표현 포함", "너무 딱딱하지 않음", "설명과 감정의 균형"],
      examples: ["주방 전등이 무슨 색인가요? ", "이번 학기 기말고사 기간이 어떻게 되나요?"],
    },
    "2점": {
      label: "과업지향적",
      nng_mapping: {
        funny_serious: "Serious",
        enthusiastic_fact: "Slightly matter-of-fact",
      },
      description: "정중하지만 감정은 절제된 표현을 사용하는 기능 전달 중심적 스타일",
      features: ["설명 중심", "격식 있는 표현", "감정어 절제", "완곡어법"],
      examples: ["주방 전등이 무슨 색인지 알려주시기 바랍니다.", "이번 학기 기말고사 기간을 알려주실 수 있나요?"],
    },
    "1점": {
      label: "극히 과업지향적",
      nng_mapping: {
        funny_serious: "Serious",
        enthusiastic_fact: "Matter-of-fact",
      },
      description: "건조하고 설명적이며 감정 표현 없이 기능 전달에만 집중하는 스타일",
      features: ["명령형 표현", "감정 표현 없음", "기술적 어휘", "딱딱한 종결어미"],
      examples: ["주방 전등 색상 확인 바랍니다.", "이번 학기 기말고사 기간 확인 바랍니다."],
    },
  },
};

const formalityRules = {
  formality: {
    "5점": {
      label: "매우 비격식",
      description: "반말 어미와 자유로운 표현 사용. 축약 및 이모티콘 허용.",
      features: ["-아, -어, -니, -냐 등의 반말 어미 사용", "주체 생략, 축약 많음", "주어 생략", "인터넷체"],
      examples: ["주방 전등 무슨 색이야?", "기말 언제야?"],
    },
    "4점": {
      label: "비격식",
      description: "친근한 해요체 중심. 구어적 표현을 포함.",
      features: ["-해요, -죠, -했어요 등 친근한 해요체", "구어적 표현 유지", "직접 호칭 포함 가능"],
      examples: ["주방 전등 무슨 색이에요?", "기말고사 언제예요?"],
    },
    "3점": {
      label: "중립적 격식",
      description: "일상적 존대 표현 사용. 서비스 UI 등에서 활용.",
      features: ["-해요 등 기본 해요체", "일상적 존대 표현 유지", "사용자 중심 안내 문장에서 사용할 수 있는 표현"],
      examples: ["주방 전등이 무슨 색인가요?", "기말고사 일정이 어떻게 되나요?"],
    },
    "2점": {
      label: "격식",
      description: "공손한 하십시오체 중심. 정중하고 명확한 어조.",
      features: [
        "-하십시오, -주시기 바랍니다 등 공손한 하십시오체",
        "높은 격식을 유지하는 정중한 표현",
        "간결하고 공식적인 안내 문장 표현",
      ],
      examples: ["주방 전등의 색상 확인 부탁드립니다.", "기말고사 일정 확인 부탁드립니다."],
    },
    "1점": {
      label: "매우 격식",
      description: "관료적 표현 및 극존칭. 명사형 서술 강조.",
      features: ["공식 서면용 표현", "관료적 표현 및 극존칭 표현 사용", "주어 생략 및 명사형 서술 강조"],
      examples: ["주방 전등 색상 확인 바랍니다.", "기말고사 일정 확인 후 회신 바랍니다."],
    },
  },
};

function buildStyleDiagnosisPrompt(input) {
  return `
    [지침]
    아래 텍스트가 어떤 style 점수에 가까운지 1~5점으로 판단하고, 그 이유를 설명해 주세요.

    - 아래 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장이 1~5점 중 어떤 스타일 점수에 가까운지 진단해 주세요.
    - 점수 기준: 1 (극히 과업지향적) ~ 5 (극히 사회정서적)
    - Tone 기준은 닐슨노먼그룹의 톤 앤 보이스 차트 중 Funny<–>Serious, Enthusiastic<–>Matter-of-fact 2개 축을 기준으로 진단합니다.
    - 전체 텍스트의 평균 점수와 이유를 요약해 주세요.

    Style 기준은 다음과 같습니다.
    ${["1점", "2점", "3점", "4점", "5점"]
      .map((style) => {
        const s = styleRules.style[style];
        return `
          [Style ${style}]
          - 이름: ${s.label}
          - 설명: ${s.description}
          - Tone 기준: Funny<–>Serious- ${s.nng_mapping.funny_serious}, Enthusiastic<–>Matter-of-fact- ${
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
    전체 텍스트의 평균 점수와 이유만 간결하게 출력해주세요. 
    - 예측 점수: N
    - 예측 이름: 스타일 이름
    - 이유: {내용}
    `;
}
function buildFormalityDiagnosisPrompt(input) {
  return `
    [지침]
    아래 텍스트의 격식 수준이 어떤 단계(1~5)에 가까운지 판단하고, 그 이유를 설명해 주세요.

    - 아래 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장이 1~5점 중 어떤 격식 점수에 가까운지 진단해 주세요.
    - 점수 기준: 1 (매우 격식) ~ 5 (매우 비격식)
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
    전체 텍스트의 평균 점수와 이유만 간결하게 출력해주세요. 
    - 예측 점수: N
    - 예측 이름: 격식 수준 이름
    - 이유: {내용}
  `.trim();
}
function buildFormalityRewritePrompt(formalityScore, input) {
  const formalityRule = formalityRules.formality[formalityScore];

  return `
    [지침]
    [원본 텍스트]을 아래 격식 수준으로 바꿔주세요.
    **단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    즉, 정보, 주어, 메시지의 핵심 내용은 그대로 유지하고 **문체(톤과 스타일)만 바꿔 주세요**.

    - 각 문장을 주어진 격식 점수 (${formalityScore})에 맞게 수정해 주세요.
    - 단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    - 전체 글이 스타일상 자연스럽고 일관성 있게 읽히도록 조정하세요.
    - 가능한 한 **최소한의 수정**으로 최대한의 격식 변화만 유도하세요.

    [Formality ${formalityScore}번 톤 변환 요청]
    - 톤 이름: ${formalityRule.label}
    - 설명: ${formalityRule.description}
    - 특징: ${formalityRule.features.join(", ")}
    - 예시 문장: "${formalityRule.examples.join(", ")}"

    [원본 텍스트]
    "${input}"

    [출력 형식]
    수정된 전체 텍스트를 자연스럽게 이어서 출력하세요.
    수정한 부분에 대한 구체적인 이유를 덧붙여 주세요.
  `.trim();
}

function buildStyleRewritePrompt(style, input) {
  const rule = styleRules.style[style];
  return `
    [지침]
    [원본 텍스트]을 아래 스타일의 말투와 분위기로 바꿔주세요. 
    **단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    즉, 정보, 주어, 메시지의 핵심 내용은 그대로 유지하고 **문체(톤과 스타일)만 바꿔 주세요**.
    문장의 격식 수준도 그대로 유지해 주세요. 

    - 텍스트를 문장 단위로 분리해 주세요.
    - 각 문장을 주어진 스타일 점수 (${rule.label}, ${rule.description})에 맞게 수정해 주세요. 
    - 주어진 스타일의 특징 (${rule.features.join(", ")})을 잘 살려주세요. 단, 문장의 격식 수준을 그대로 유지해 주세요. 
    - Tone 기준은 닐슨노먼그룹의 톤 앤 보이스 차트 중 Funny<–>Serious, Enthusiastic<–>Matter-of-fact 2개 축을 기준으로 진단합니다. 
      주어진 스타일의 ${rule.nng_mapping} 을 참고해 주세요.
    - 단, 문장의 **핵심 의미나 정보 구조는 절대 바꾸지 마세요**.
    - 전체 글이 스타일상 자연스럽고 일관성 있게 읽히도록 조정하세요.

    [Style ${style}번 톤 변환 요청]
    - 톤 이름: ${rule.label}
    - 설명: ${rule.description}
    - 스타일 기준 (NNG): Funny<–>Serious- ${rule.nng_mapping.funny_serious}, Enthusiastic<–>Matter-of-fact- ${
    rule.nng_mapping.enthusiastic_fact
  }
    - 특징: ${rule.features.join(", ")}
    - 예시 문장: "${rule.examples[0]}"

    [원본 텍스트]
    "${input}"

    [출력 형식]
    수정된 전체 텍스트를 자연스럽게 이어서 출력하세요.
    수정한 부분에 대한 구체적인 이유를 덧붙여 주세요.
    `;
}
export class KToneTool extends MCPTool {
  constructor() {
    super(...arguments);
    this.name = "ktone";
    this.description = "텍스트의 톤을 분석하거나, 지정한 톤으로 리라이팅합니다.";
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
      formality: {
        type: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4"), z.literal("5")]).optional(),
        description: "목표 격식 점수 (1~5)",
      },
    };
  }
  async execute({ text, style, mode, formality, apiKey }) {
    const openai = new OpenAI({
      apiKey,
    }); // 환경 변수에서 API 키 불러오기

    if (mode === "diagnose") {
      // 1 격식 톤 분석
      const formalityMessages = [
        {
          role: "system",
          content: `
          당신은 한국어 문장의 비격식-격식 수준을 분석하는 전문가입니다. 
          각 점수의 기준은 사용자 프롬프트에 포함되어 있습니다.
          `,
        },
        {
          role: "user",
          content: buildFormalityDiagnosisPrompt(text),
        },
      ];
      const formalityResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages: formalityMessages,
      });
      const formalityResult = formalityResponse.choices[0].message.content ?? "";

      // 2 스타일 톤 분석
      const styleMessages = [
        {
          role: "system",
          content: `
          당신은 한국어 문장의 스타일을 1~5점의 스펙트럼(과업지향적 ↔ 사회정서적)으로 평가하는 전문가입니다. 
          각 점수의 기준은 사용자 프롬프트에 포함되어 있습니다. 
          `,
        },
        {
          role: "user",
          content: buildStyleDiagnosisPrompt(formalityResult),
        },
      ];
      const styleResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages: styleMessages,
      });
      const styleResult = styleResponse.choices[0].message.content ?? "";
      return `격식 수준 진단 결과 \n ${formalityResult}\n\n 스타일 진단 결과 \n ${styleResult}`;
    }
    if (mode === "rewrite") {
      // 1 격식 톤 변환
      if (!formality) throw new Error("rewrite 모드에서는 formality 값이 필요합니다.");

      const formalityKey = `${formality}점`;
      if (!["1점", "2점", "3점", "4점", "5점"].includes(formalityKey)) {
        throw new Error("유효한 formality 값이 아닙니다.");
      }

      if (!style) throw new Error("rewrite 모드에서는 style 값이 필요합니다.");

      const styleKey = `${style}점`;
      if (!["1점", "2점", "3점", "4점", "5점"].includes(styleKey)) {
        throw new Error("유효한 style 값이 아닙니다.");
      }

      const formalityMessages = [
        {
          role: "system",
          content: `
          당신은 한국어 문장을 지정된 격식 점수(1~5점 스펙트럼: 비격식 ↔ 격식)에 맞게 '문체만' 재작성하는 전문가입니다. 
          점수의 기준은 사용자 프롬프트에 포함되어 있습니다. 
          사용자가 제공한 문장을 격식 점수, 스타일 점수 기준에 따라 **말투, 어투, 표현 방식만 변경**하세요. 
          **의미 변형은 금지입니다.** 문장의 정보 구조(주어, 목적어, 동사)는 반드시 유지되어야 하며, 감정이나 뉘앙스, 어미/형식만 변경하세요. 
          `,
        },
        {
          role: "user",
          content: buildFormalityRewritePrompt(formalityKey, text),
        },
      ];
      const formalityResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages: formalityMessages,
      });
      const formalityResult = formalityResponse.choices[0].message.content ?? "";

      const styleMessages = [
        {
          role: "system",
          content: `당신은 한국어 문장을 지정된 스타일 점수(1~5점 스펙트럼: 사회정서적 ↔ 과업지향적)에 맞게 '문체만' 재작성하는 전문가입니다.
          점수의 기준은 사용자 프롬프트에 포함되어 있습니다. 
          사용자가 제공한 문장을 스타일 점수 기준에 따라 **말투, 어투, 표현 방식만 변경**하세요.
          **의미 변형은 금지입니다.** 문장의 정보 구조(주어, 목적어, 동사)는 반드시 유지되어야 하며, 감정이나 뉘앙스, 어미/형식만 변경하세요.
          **격식 수준 변형은 금지입니다.**`,
        },
        {
          role: "user",
          content: buildStyleRewritePrompt(styleKey, formalityResult), // style는 1~5 값이어야 함
        },
      ];
      const styleResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages: styleMessages,
      });
      const styleResult = styleResponse.choices[0].message.content ?? "";
      return `격식 수준 반영 결과 \n ${formalityResult}\n\n 스타일까지 반영한 최종 결과 \n ${styleResult}`;
    }
    throw new Error("알 수 없는 모드입니다. 'diagnose' 또는 'rewrite' 중 하나를 선택하세요.");
  }
}
export default KToneTool;
