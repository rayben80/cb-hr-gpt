import type { EvaluationItem } from './types';

export const TEMPLATE_TYPE_OPTIONS = ['성과 평가', '역량 평가', '다면 평가', '리더십 평가', '수습 평가'] as const;

// 평가 유형별 아이콘 매핑 (Phosphor Icons 이름)
export const TEMPLATE_TYPE_ICONS: Record<string, string> = {
    '성과 평가': 'UserCheck',
    '역량 평가': 'UserCheck',
    '다면 평가': 'Users',
    '리더십 평가': 'Crown',
    '수습 평가': 'GraduationCap',
};

// 평가 유형별 추천 항목 프리셋
export const TEMPLATE_ITEM_PRESETS: Record<string, Omit<EvaluationItem, 'id' | 'scoring'>[]> = {
    '역량 평가': [
        {
            type: '정성',
            title: '업무 전문성',
            weight: 20,
            details: { description: '담당 업무에 대한 전문 지식과 기술 수준' },
        },
        {
            type: '정성',
            title: '문제 해결 능력',
            weight: 20,
            details: { description: '업무 중 발생하는 문제를 분석하고 해결하는 능력' },
        },
        {
            type: '정성',
            title: '협업 및 커뮤니케이션',
            weight: 20,
            details: { description: '팀원 및 유관 부서와의 원활한 소통과 협력' },
        },
        {
            type: '정성',
            title: '자기 개발',
            weight: 20,
            details: { description: '지속적인 학습과 역량 향상을 위한 노력' },
        },
        {
            type: '정성',
            title: '책임감',
            weight: 20,
            details: { description: '맡은 업무에 대한 주인의식과 완수 의지' },
        },
    ],
    '다면 평가': [
        {
            type: '정성',
            title: '리더십/팔로워십',
            weight: 20,
            details: { description: '리더로서 팀을 이끌거나 팔로워로서 협력하는 능력' },
        },
        { type: '정성', title: '팀워크', weight: 20, details: { description: '팀 목표 달성을 위한 협력과 기여도' } },
        {
            type: '정성',
            title: '의사소통 능력',
            weight: 20,
            details: { description: '명확하고 효과적인 의사 전달 및 경청 능력' },
        },
        {
            type: '정성',
            title: '긍정적 영향력',
            weight: 20,
            details: { description: '동료에게 미치는 긍정적인 영향과 동기부여' },
        },
        {
            type: '정성',
            title: '전문성 공유',
            weight: 20,
            details: { description: '보유한 지식과 경험을 동료와 나누는 자세' },
        },
    ],
    '리더십 평가': [
        {
            type: '정성',
            title: '비전 제시',
            weight: 15,
            details: { description: '명확한 방향과 목표를 설정하고 전달하는 능력' },
        },
        { type: '정성', title: '팀 관리', weight: 20, details: { description: '팀원 역량 파악 및 적절한 업무 배분' } },
        {
            type: '정성',
            title: '코칭 및 육성',
            weight: 20,
            details: { description: '팀원의 성장을 위한 피드백과 지원' },
        },
        { type: '정성', title: '의사결정', weight: 15, details: { description: '신속하고 합리적인 의사결정 능력' } },
        { type: '정성', title: '성과 관리', weight: 15, details: { description: '목표 설정 및 성과 모니터링' } },
        {
            type: '정성',
            title: '조직 문화 형성',
            weight: 15,
            details: { description: '건강한 조직 문화 조성을 위한 노력' },
        },
    ],
    '수습 평가': [
        {
            type: '정성',
            title: '업무 이해도',
            weight: 20,
            details: { description: '담당 업무와 조직에 대한 이해 수준' },
        },
        {
            type: '정성',
            title: '학습 속도',
            weight: 20,
            details: { description: '새로운 업무와 지식을 습득하는 속도' },
        },
        {
            type: '정성',
            title: '적응력',
            weight: 20,
            details: { description: '새로운 환경과 조직 문화에 적응하는 능력' },
        },
        {
            type: '정성',
            title: '업무 태도',
            weight: 20,
            details: { description: '성실성, 적극성, 책임감 등 기본 업무 자세' },
        },
        {
            type: '정성',
            title: '협업 능력',
            weight: 20,
            details: { description: '동료 및 선배와의 원활한 소통과 협력' },
        },
    ],
};

// 등급 기준 자동 완성 프리셋
export const GRADE_CRITERIA_PRESETS = {
    정량: [
        { grade: 'S', description: '목표 달성률 120% 이상' },
        { grade: 'A', description: '목표 달성률 100% 이상 120% 미만' },
        { grade: 'B', description: '목표 달성률 80% 이상 100% 미만' },
        { grade: 'C', description: '목표 달성률 60% 이상 80% 미만' },
        { grade: 'D', description: '목표 달성률 60% 미만' },
    ],
    정성: [
        { grade: 'S', description: '기대를 월등히 초과하는 탁월한 성과' },
        { grade: 'A', description: '기대를 상회하는 우수한 성과' },
        { grade: 'B', description: '기대에 부합하는 양호한 성과' },
        { grade: 'C', description: '기대에 다소 미흡한 성과' },
        { grade: 'D', description: '기대에 크게 미달하는 성과' },
    ],
};

// 채점 방식 옵션
export const SCORING_TYPES = [
    { id: '5grade', label: '5등급제 (S/A/B/C/D)', grades: ['S', 'A', 'B', 'C', 'D'] },
    { id: '5point', label: '5점제 (1~5점)', grades: ['5점', '4점', '3점', '2점', '1점'] },
    {
        id: '10point',
        label: '10점제 (1~10점)',
        grades: ['10점', '9점', '8점', '7점', '6점', '5점', '4점', '3점', '2점', '1점'],
    },
    { id: '100point', label: '100점제 (구간별)', grades: ['90점 이상', '80~89점', '70~79점', '60~69점', '60점 미만'] },
    { id: '3level', label: '3단계제 (상/중/하)', grades: ['상', '중', '하'] },
    { id: 'likert5', label: '리커트 5점 (만족도)', grades: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] },
] as const;

// 채점 방식별 기본 프리셋
export const SCORING_TYPE_PRESETS: Record<
    string,
    Record<string, { grade: string; description: string; score: number }[]>
> = {
    '5grade': {
        정량: [
            { grade: 'S', description: '목표 달성률 120% 이상', score: 100 },
            { grade: 'A', description: '목표 달성률 100% 이상 120% 미만', score: 90 },
            { grade: 'B', description: '목표 달성률 80% 이상 100% 미만', score: 80 },
            { grade: 'C', description: '목표 달성률 60% 이상 80% 미만', score: 70 },
            { grade: 'D', description: '목표 달성률 60% 미만', score: 60 },
        ],
        정성: [
            { grade: 'S', description: '기대를 월등히 초과하는 탁월한 성과', score: 100 },
            { grade: 'A', description: '기대를 상회하는 우수한 성과', score: 90 },
            { grade: 'B', description: '기대에 부합하는 양호한 성과', score: 80 },
            { grade: 'C', description: '기대에 다소 미흡한 성과', score: 70 },
            { grade: 'D', description: '기대에 크게 미달하는 성과', score: 60 },
        ],
    },
    '5point': {
        정량: [
            { grade: '5점', description: '목표 초과 달성 (110% 이상)', score: 100 },
            { grade: '4점', description: '목표 달성 (100% 이상)', score: 80 },
            { grade: '3점', description: '목표 근접 (80% 이상)', score: 60 },
            { grade: '2점', description: '부분 달성 (60% 이상)', score: 40 },
            { grade: '1점', description: '미달성 (60% 미만)', score: 20 },
        ],
        정성: [
            { grade: '5점', description: '탁월함 - 기대를 크게 상회', score: 100 },
            { grade: '4점', description: '우수함 - 기대 이상의 성과', score: 80 },
            { grade: '3점', description: '양호함 - 기대 수준 충족', score: 60 },
            { grade: '2점', description: '개선 필요 - 기대에 미흡', score: 40 },
            { grade: '1점', description: '부적합 - 기대에 크게 미달', score: 20 },
        ],
    },
    '10point': {
        정량: [
            { grade: '10점', description: '완벽한 달성 (120% 이상)', score: 100 },
            { grade: '9점', description: '탁월한 달성 (110~120%)', score: 90 },
            { grade: '8점', description: '우수한 달성 (100~110%)', score: 80 },
            { grade: '7점', description: '양호한 달성 (90~100%)', score: 70 },
            { grade: '6점', description: '보통 달성 (80~90%)', score: 60 },
            { grade: '5점', description: '평균 수준 (70~80%)', score: 50 },
            { grade: '4점', description: '개선 필요 (60~70%)', score: 40 },
            { grade: '3점', description: '미흡 (50~60%)', score: 30 },
            { grade: '2점', description: '부족 (40~50%)', score: 20 },
            { grade: '1점', description: '매우 부족 (40% 미만)', score: 10 },
        ],
        정성: [
            { grade: '10점', description: '탁월함 - 기대를 월등히 초과', score: 100 },
            { grade: '9점', description: '우수함 - 기대를 크게 상회', score: 90 },
            { grade: '8점', description: '좋음 - 기대를 상회', score: 80 },
            { grade: '7점', description: '양호함 - 기대 충족', score: 70 },
            { grade: '6점', description: '보통 - 기대에 근접', score: 60 },
            { grade: '5점', description: '평균 - 기본 수준', score: 50 },
            { grade: '4점', description: '미흡 - 기대에 다소 미달', score: 40 },
            { grade: '3점', description: '부족 - 기대에 미달', score: 30 },
            { grade: '2점', description: '매우 부족 - 기대에 크게 미달', score: 20 },
            { grade: '1점', description: '부적합 - 전면 개선 필요', score: 10 },
        ],
    },
    '100point': {
        정량: [
            { grade: '90점 이상', description: '목표 초과 달성', score: 95 },
            { grade: '80~89점', description: '목표 달성', score: 85 },
            { grade: '70~79점', description: '목표 근접', score: 75 },
            { grade: '60~69점', description: '부분 달성', score: 65 },
            { grade: '60점 미만', description: '미달성', score: 50 },
        ],
        정성: [
            { grade: '90점 이상', description: '탁월한 성과', score: 95 },
            { grade: '80~89점', description: '우수한 성과', score: 85 },
            { grade: '70~79점', description: '양호한 성과', score: 75 },
            { grade: '60~69점', description: '보통 성과', score: 65 },
            { grade: '60점 미만', description: '개선 필요', score: 50 },
        ],
    },
    '3level': {
        정량: [
            { grade: '상', description: '목표 100% 이상 달성', score: 100 },
            { grade: '중', description: '목표 70~100% 달성', score: 80 },
            { grade: '하', description: '목표 70% 미만 달성', score: 60 },
        ],
        정성: [
            { grade: '상', description: '기대 이상의 성과', score: 100 },
            { grade: '중', description: '기대 수준의 성과', score: 80 },
            { grade: '하', description: '기대 미만의 성과', score: 60 },
        ],
    },
    likert5: {
        정량: [
            { grade: '매우 만족', description: '기대를 크게 초과', score: 100 },
            { grade: '만족', description: '기대를 충족', score: 80 },
            { grade: '보통', description: '기대에 근접', score: 60 },
            { grade: '불만족', description: '기대에 미흡', score: 40 },
            { grade: '매우 불만족', description: '전혀 기대에 못 미침', score: 20 },
        ],
        정성: [
            { grade: '매우 만족', description: '매우 우수한 수행', score: 100 },
            { grade: '만족', description: '우수한 수행', score: 80 },
            { grade: '보통', description: '보통 수준의 수행', score: 60 },
            { grade: '불만족', description: '미흡한 수행', score: 40 },
            { grade: '매우 불만족', description: '매우 미흡한 수행', score: 20 },
        ],
    },
};
