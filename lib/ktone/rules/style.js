export const styleRules = {
    style: {
        1: {
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
        2: {
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
        3: {
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
        4: {
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
        5: {
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
