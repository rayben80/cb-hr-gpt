
export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'on_leave' | 'resigned' | 'intern';
  hireDate: string;
  email: string;
  teamName?: string;
  partName?: string; 
  teamId?: string;
  partId?: string;
}

export interface Part {
  id: string;
  title: string;
  members: Member[];
  originalMemberCount?: number;
}

export interface Team {
  id: string;
  name: string;
  lead: string;
  parts: Part[];
  originalTotalMemberCount?: number;
  headquarterId?: string;
}



export interface Headquarter {
  id: string;
  name: string;
  leader: {
    name: string;
    role: string;
    avatar: string;
    email: string;
  };
  description?: string;
}

export interface Evaluation {
  id: number | string;
  name: string;
  type: string;
  period: string;
  status: '완료' | '진행중' | '예정';
  subject: string;
  startDate: string;
  endDate: string;
  progress: number;
  score: number | null;
}

export interface EvaluationTemplate {
  id: number | string;
  name: string;
  type: string;
  category: string;
  tags?: string[];
  version?: number;
  favorite?: boolean;
  archived?: boolean;
  questions?: number;
  items?: EvaluationItem[];
  lastUpdated: string;
  author: string;
}

export interface EvaluationItem {
  id: number;
  type: '정량' | '정성';
  title: string;
  weight: number;
  details: {
    metric?: string;
    target?: string;
    calculation?: string;
    description?: string;
  };
  scoring: { grade: string; description: string }[];
}

export const TEMPLATE_TYPE_OPTIONS = [
  '역량 평가',
  '다면 평가',
  '리더십 평가',
  '수습 평가',
] as const;


export const ICONS = {
    dashboard: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l1 1.5m0 0l.5 1.5m-1.5-1.5l-1.5-1.5m1.5 1.5l1.5-1.5m6.75-12v1.5m0 0l-1.5-1.5m1.5 1.5l1.5-1.5",
    // 조직 관리 - 개선된 직관적 아이콘들
    users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    userCheck: "M16.5 3.75a1.75 1.75 0 113.5 0 1.75 1.75 0 01-3.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zM12 15a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm6.44-7.44a.75.75 0 00-1.06-1.06L15 8.88l-1.06-1.06a.75.75 0 00-1.061 1.06l1.06 1.061-1.06 1.06a.75.75 0 001.06 1.061L15 10.061l1.38 1.38a.75.75 0 001.06-1.06L16.38 9.32l1.06-1.06z",
    userGraduate: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15",
    userPause: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zM6 10.5h12v3H6v-3z",
    userExit: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75",
    
    // 기존 아이콘들 유지
    // 기존 아이콘 개선
    team: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    evaluations: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    library: "M11.25 4.5l7.5 3.75-7.5 3.75-7.5-3.75 7.5-3.75zM2.25 8.25l7.5 3.75v7.5l-7.5-3.75v-7.5zM20.25 8.25l-7.5 3.75v7.5l7.5-3.75v-7.5z",
    
    // 새로운 개선된 아이콘들
    organizationChart: "M3 7V5a1 1 0 011-1h4a1 1 0 011 1v2m0 0V9a1 1 0 001 1h2a1 1 0 001-1V7m0 0V5a1 1 0 011-1h4a1 1 0 011 1v2m0 0v12a1 1 0 01-1 1H4a1 1 0 01-1-1V7m16 0H3",
    database: "M4 7v10c0 2 4.477 4 10 4s10-2 10-4V7M4 7c0 2 4.477 4 10 4s10-2 10-4M4 7c0-2 4.477-4 10-4s10 2 10 4m0 5c0 2-4.477 4-10 4S4 14 4 12",
    selfEvaluation: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    multiEvaluation: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    leadershipEvaluation: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    settingsModern: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
    // 전체 UI 아이콘 개선
    settings: "M9.594 3.94c.09-.542.56-1.007 1.11-1.11.55-.104 1.15-.104 1.7 0 .55.104 1.02.568 1.11 1.11.09.542.09 1.128 0 1.67-.09.542-.56 1.007-1.11 1.11-.55.104-1.15-.104-1.7 0-.55-.104-1.02-.568-1.11-1.11-.09-.542-.09-1.128 0-1.67zM14.25 10.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 12.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12 15a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z",
    bell: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    
    // 드롭다운 및 내비게이션
    chevronDown: "M19.5 8.25l-7.5 7.5-7.5-7.5",
    chevronUp: "M4.5 15.75l7.5-7.5 7.5 7.5",
    
    // 액션 버튼 - 개선된 아이콘들
    plus: "M12 4.5v15m7.5-7.5h-15",
    edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    delete: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    save: "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z",
    
    // 오류 및 경고
    warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    // 기본 상태 및 탐색 아이콘
    moreHorizontal: "M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
    arrowUp: "M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75",
    arrowDown: "M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75",
    arrowLeft: "M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75",
    
    // 사용자 및 직무 관련 아이콘
    briefcase: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.007v.008H12v-.008z",
    checkCircle: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    userCircle: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
    shieldCheck: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z",
    documentText: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    pencil: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    arrowLeftBack: "M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75",
    xMark: "M6 18L18 6M6 6l12 12",
    minus: "M18 12H6",
    userMinus: "M15 12H9m12 4.5a9 9 0 11-18 0 9 9 0 0118 0z",
    userPlus: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    buildingOffice2: "M12 21V10.875M12 21H4.5a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 014.5 3h15a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25H12M12 21v-2.625M12 18.375L15.75 15l-3.75-3.375L8.25 15l3.75 3.375z",
    calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18",
    cog: "M10.343 3.94c.09-.542.56-1.007 1.11-1.11.55-.104 1.15-.104 1.7 0 .55.104 1.02.568 1.11 1.11.09.542.09 1.128 0 1.67-.09.542-.56 1.007-1.11 1.11-.55.104-1.15-.104-1.7 0-.55-.104-1.02-.568-1.11-1.11-.09-.542-.09-1.128 0-1.67zM12 21a9 9 0 100-18 9 9 0 000 18zM12 15a3 3 0 100-6 3 3 0 000 6z",
    xCircle: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    warningAlert: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    gripVertical: "M9 3.75H6.75a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5zM9 12.75H6.75a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5zM9 21.75H6.75a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5zM17.25 3.75h-2.25a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5zM17.25 12.75h-2.25a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5zM17.25 21.75h-2.25a.75.75 0 110-1.5h2.25a.75.75 0 110 1.5z",
    arrowUpDown: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    cursor: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5",
    hand: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
    move3d: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
    star: "M11.48 3.499a.75.75 0 011.04 0l2.347 2.334 3.247.47a.75.75 0 01.416 1.279l-2.347 2.334.554 3.227a.75.75 0 01-1.088.791L12 12.347l-2.999 1.577a.75.75 0 01-1.088-.79l.554-3.228L6.12 7.582a.75.75 0 01.416-1.279l3.247-.47 2.347-2.334z",
    copy: "M16.5 8.25H8.25A2.25 2.25 0 006 10.5v8.25A2.25 2.25 0 008.25 21h8.25A2.25 2.25 0 0018.75 18.75V10.5A2.25 2.25 0 0016.5 8.25zM6 3.75A2.25 2.25 0 018.25 1.5h8.25A2.25 2.25 0 0118.75 3.75V6H9.75A3.75 3.75 0 006 9.75V3.75z",
};

const DEFAULT_HEADQUARTER_LEADER: Headquarter['leader'] = {
  name: '장주휘',
  role: '본부장',
  avatar: 'https://ui-avatars.com/api/?name=장주휘&background=0D8ABC&color=fff',
  email: 'juwhijang@forcs.com'
} as const;

export const initialHeadquarters: Headquarter[] = [
  {
    id: 'hq-cloud',
    name: '클라우드사업본부',
    leader: { ...DEFAULT_HEADQUARTER_LEADER },
    description: '클라우드 기반 서비스 전략과 영업을 총괄합니다.'
  }
];

export const currentUser = { ...initialHeadquarters[0].leader };

export const HQ_UNASSIGNED_ID = 'hq-unassigned';

export const initialTeamsData: Team[] = [
  {
    id: 'team_sales',
    headquarterId: 'hq-cloud',
    name: 'Sales팀',
    lead: '장주휘',
    parts: [
      {
        id: 'part_sales_manage',
        title: '영업관리파트',
        members: [
          { id: 'mem_chobyungchul', name: '조병철', role: '영업관리', avatar: 'https://ui-avatars.com/api/?name=조병철&background=random&color=fff', status: 'active', hireDate: '2022-03-15', email: 'rayben@forcs.com' }
        ]
      },
      {
        id: 'part_sales',
        title: 'Sales파트',
        members: [
          { id: 'mem_choimin', name: '최민', role: 'Sales', avatar: 'https://ui-avatars.com/api/?name=최민&background=random&color=fff', status: 'active', hireDate: '2021-08-01', email: 'minchoi@forcs.com' },
          { id: 'mem_kimdamin', name: '김다민', role: 'Sales', avatar: 'https://ui-avatars.com/api/?name=김다민&background=random&color=fff', status: 'active', hireDate: '2024-06-01', email: 'manypeople@forcs.com' },
          { id: 'mem_parkjinhee', name: '박진희', role: 'Sales', avatar: 'https://ui-avatars.com/api/?name=박진희&background=random&color=fff', status: 'on_leave', hireDate: '2022-11-20', email: 'jinhee@forcs.com' },
          { id: 'mem_parkjiwoo', name: '박지우', role: 'Sales', avatar: 'https://ui-avatars.com/api/?name=박지우&background=random&color=fff', status: 'resigned', hireDate: '2022-05-10', email: 'jiwoo@forcs.com' },
        ]
      }
    ]
  },
  {
    id: 'team_cx',
    headquarterId: 'hq-cloud',
    name: 'CX팀',
    lead: '정현옥',
    parts: [
      {
        id: 'part_tech_support',
        title: '기술지원파트',
        members: [
          { id: 'mem_kimsohyun', name: '김소현', role: '기술지원', avatar: 'https://ui-avatars.com/api/?name=김소현&background=random&color=fff', status: 'active', hireDate: '2023-01-10', email: 'kimsohyeon@forcs.com' },
          { id: 'mem_leejaehyuk', name: '이재혁', role: '기술지원', avatar: 'https://ui-avatars.com/api/?name=이재혁&background=random&color=fff', status: 'active', hireDate: '2023-05-22', email: 'encrabell@forcs.com' },
          { id: 'mem_leeseojun', name: '이서준', role: '기술지원', avatar: 'https://ui-avatars.com/api/?name=이서준&background=random&color=fff', status: 'on_leave', hireDate: '2023-08-01', email: 'seojun@forcs.com' },
        ]
      },
      {
        id: 'part_tech_writing',
        title: '테크니컬라이팅파트',
        members: [
          { id: 'mem_choichulhwan', name: '최철환', role: 'Technical Writing', avatar: 'https://ui-avatars.com/api/?name=최철환&background=random&color=fff', status: 'active', hireDate: '2020-02-18', email: 'davidchoi@forcs.com' }
        ]
      },
      {
        id: 'part_tech_marketing',
        title: '테크니컬마케팅파트',
        members: [
          { id: 'mem_jangnayoung', name: '장나영', role: 'Technical Marketing', avatar: 'https://ui-avatars.com/api/?name=장나영&background=random&color=fff', status: 'active', hireDate: '2021-09-01', email: 'nayoungj@forcs.com' }
        ]
      },
      {
        id: 'part_biz_ops',
        title: '사업운영파트',
        members: [
          { id: 'mem_junghyunok', name: '정현옥', role: 'CX팀 팀장', avatar: 'https://ui-avatars.com/api/?name=정현옥&background=random&color=fff', status: 'active', hireDate: '2019-07-15', email: 'hyunok@forcs.com' },
          { id: 'mem_leedahee', name: '이다희', role: '사업운영', avatar: 'https://ui-avatars.com/api/?name=이다희&background=random&color=fff', status: 'active', hireDate: '2022-10-03', email: 'dhlee@forcs.com' },
          { id: 'mem_kimdabin', name: '김다빈', role: '사업운영', avatar: 'https://ui-avatars.com/api/?name=김다빈&background=random&color=fff', status: 'active', hireDate: '2023-09-11', email: 'oed1223@forcs.com' }
        ]
      },
      {
        id: 'part_customer_service',
        title: '고객서비스파트',
        members: [
          { id: 'mem_parksarang', name: '박사랑', role: '고객서비스', avatar: 'https://ui-avatars.com/api/?name=박사랑&background=random&color=fff', status: 'active', hireDate: '2022-04-04', email: 'sarang@forcs.com' },
          { id: 'mem_heoahyoung', name: '허아영', role: '고객서비스', avatar: 'https://ui-avatars.com/api/?name=허아영&background=random&color=fff', status: 'active', hireDate: '2023-02-20', email: 'heoayoung@forcs.com' },
          { id: 'mem_kimtaeeun', name: '김태은', role: '고객서비스', avatar: 'https://ui-avatars.com/api/?name=김태은&background=random&color=fff', status: 'active', hireDate: '2023-11-06', email: 'kte0701@forcs.com' },
          { id: 'mem_choitaehyun', name: '최현', role: 'CX팀 인턴', avatar: 'https://ui-avatars.com/api/?name=최현&background=random&color=fff', status: 'intern', hireDate: '2024-08-01', email: 'choinhwan@forcs.com' },
          { id: 'mem_leejunsu', name: '이준수', role: 'CX팀 인턴', avatar: 'https://ui-avatars.com/api/?name=이준수&background=random&color=fff', status: 'intern', hireDate: '2024-08-01', email: 'js@forcs.com' },
          { id: 'mem_limjaeeon', name: '임재언', role: 'CX팀 인턴', avatar: 'https://ui-avatars.com/api/?name=임재언&background=random&color=fff', status: 'intern', hireDate: '2024-08-01', email: 'lim063033@gmail.com' },
          { id: 'mem_kimseoeun', name: '김서은', role: 'CX팀 인턴', avatar: 'https://ui-avatars.com/api/?name=김서은&background=random&color=fff', status: 'intern', hireDate: '2024-08-01', email: 'seoeun@forcs.com' },
          { id: 'mem_leenaeun', name: '이나은', role: 'CX팀 인턴', avatar: 'https://ui-avatars.com/api/?name=이나은&background=random&color=fff', status: 'intern', hireDate: '2024-08-01', email: 'naeunlee@forcs.com' }
        ]
      }
    ]
  }
];

export const initialEvaluationsData: Evaluation[] = [
  { id: 1, name: '2024년 상반기 성과 평가', type: '본인평가', period: '상반기', status: '완료', subject: '전사', startDate: '2024-04-01', endDate: '2024-04-15', progress: 100, score: 95 },
  { id: 2, name: '2024년 하반기 성과 평가', type: '본인평가', period: '하반기', status: '진행중', subject: '전사', startDate: '2024-10-01', endDate: '2024-10-15', progress: 10, score: null },
  { id: 3, name: '신규 입사자 수습 평가', type: '본인평가', period: '수시', status: '진행중', subject: '김다민', startDate: '2024-06-20', endDate: '2024-07-05', progress: 50, score: null },
  { id: 4, name: '리더십 역량 진단', type: '다면평가', period: '연간', status: '완료', subject: '팀장 그룹', startDate: '2024-05-10', endDate: '2024-05-25', progress: 100, score: 88 },
  { id: 5, name: '2024년 동료 피드백', type: '다면평가', period: '연간', status: '완료', subject: 'CX팀', startDate: '2024-06-01', endDate: '2024-06-10', progress: 100, score: 92 },
  { id: 6, name: '2025년 상반기 성과 평가', type: '본인평가', period: '상반기', status: '예정', subject: '전사', startDate: '2025-04-01', endDate: '2025-04-15', progress: 0, score: null },
];

export const initialLibraryData: EvaluationTemplate[] = [
  { id: 1, name: '역량 평가 (공통)', type: '역량 평가', category: '공통', tags: ['공통', '역량'], version: 1, questions: 12, lastUpdated: '2024-05-10', author: '장주휘' },
  { id: 2, name: '프로젝트 동료 피드백', type: '다면 평가', category: '개발', tags: ['프로젝트', '협업'], version: 1, questions: 8, lastUpdated: '2024-06-15', author: '정현옥' },
  { id: 3, name: '신규 입사자 수습 평가', type: '수습 평가', category: '공통', tags: ['온보딩'], version: 1, questions: 15, lastUpdated: '2024-04-20', author: '장주휘' },
  { id: 4, name: '리더십 역량 진단', type: '리더십 평가', category: '리더십', tags: ['리더십'], version: 1, questions: 20, lastUpdated: '2024-03-01', author: '시스템' },
  { id: 5, name: 'Sales 직군 역량 평가', type: '역량 평가', category: '영업', tags: ['영업'], version: 1, questions: 10, lastUpdated: '2024-07-01', author: '장주휘' },
];

export const evaluationResultData = {
  evaluationId: 1,
  subject: {
    name: '장주휘',
    role: '본부장',
    avatar: 'https://ui-avatars.com/api/?name=장주휘&background=0D8ABC&color=fff',
  },
  evaluationName: '2024년 상반기 성과 평가',
  period: '2024-04-01 ~ 2024-04-15',
  finalScore: 95,
  finalGrade: 'S',
  summary: '전반적으로 모든 역량에서 뛰어난 성과를 보여주셨습니다. 특히 리더십과 문제 해결 능력에서 높은 평가를 받았습니다. 동료들과의 협업 능력 또한 탁월하며, 팀에 긍정적인 영향을 미치고 있습니다.',
  competencies: [
    { name: '리더십', selfScore: 90, peerScore: 98, finalScore: 96 },
    { name: '문제 해결 능력', selfScore: 95, peerScore: 92, finalScore: 93 },
    { name: '커뮤니케이션', selfScore: 85, peerScore: 95, finalScore: 92 },
    { name: '팀워크', selfScore: 92, peerScore: 96, finalScore: 95 },
    { name: '업무 전문성', selfScore: 88, peerScore: 90, finalScore: 89 },
  ],
  strengths: [
    '강력한 리더십으로 팀의 목표 달성을 이끌었습니다.',
    '복잡한 문제에 대한 창의적인 해결책을 제시했습니다.',
    '항상 긍정적인 태도로 동료들에게 동기를 부여합니다.'
  ],
  areasForImprovement: [
    '업무 위임 시 조금 더 명확한 가이드라인을 제공하면 좋겠습니다.',
    '다양한 직무의 동료들과의 소통을 더욱 활성화할 필요가 있습니다.'
  ],
  peerFeedback: [
    { from: '동료 1', comment: '장주휘님은 항상 팀의 방향성을 명확하게 제시해주어 업무에 집중하기 좋습니다. 어려운 문제가 발생했을 때 함께 고민하고 해결해나가는 과정에서 많이 배우고 있습니다.' },
    { from: '동료 2', comment: '프로젝트 진행 상황을 투명하게 공유하고, 동료들의 의견을 적극적으로 경청하는 모습이 인상적이었습니다. 덕분에 팀 전체가 시너지를 낼 수 있었습니다.' },
    { from: '동료 3', comment: '가끔 업무 지시가 조금 더 구체적이었으면 하는 아쉬움이 있습니다. 하지만 언제나 피드백에 열려있어 소통하는 데 어려움은 없습니다.' },
  ]
};
