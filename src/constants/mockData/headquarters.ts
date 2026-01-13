import { getAvatarUrl } from '../../utils/avatarUtils';
import type { Headquarter, LeaderHistory } from '../types';

export const HQ_UNASSIGNED_ID = 'hq-unassigned';

export const initialLeaderHistory: LeaderHistory[] = [
    {
        id: 'hist_1',
        headquarterId: 'hq-cloud',
        leaderName: '장주휘',
        action: 'appointed',
        timestamp: '2022-01-01',
    },
];

const DEFAULT_HEADQUARTER_LEADER: Headquarter['leader'] = {
    name: '장주휘',
    role: '본부장',
    avatar: getAvatarUrl('장주휘'),
    email: 'juwhijang@forcs.com',
} as const;

export const initialHeadquarters: Headquarter[] = [
    {
        id: 'hq-cloud',
        name: '클라우드사업본부',
        leader: { ...DEFAULT_HEADQUARTER_LEADER },
        description: '클라우드 기반 서비스 전략과 영업을 총괄합니다.',
    },
];
