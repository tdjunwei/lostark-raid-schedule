// 基於 Prisma schema 的 TypeScript 類型定義

export type UserRole = 'ADMIN' | 'SCHEDULER' | 'PLAYER';
export type JobRole = 'DPS' | 'SUPPORT' | 'TANK';
export type RaidType = 'CELESTIAL' | 'DREAM' | 'IVORY_TOWER' | 'PLAGUE';
export type RaidMode = 'SOLO' | 'NORMAL' | 'HARD';
export type RaidStatus = 'PLANNED' | 'RECRUITING' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ParticipantStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
export type GateStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// Excel 匯入相關類型
export interface ExcelCharacter {
  nickname: string;
  itemLevel: number;
  job: string;
  // 副本參與標記
  dreamParticipation?: boolean;
  celestialParticipation?: boolean;
  plagueParticipation?: boolean;
  ivoryTowerParticipation?: boolean;
}

export interface ExcelSchedule {
  nickname: string;
  dayOfWeek: number;
  timeRange: string;
}

export interface ExcelRaidData {
  type: string;
  mode: string;
  gate?: string;
  participants: string[];
  scheduledTime?: Date;
  // 經濟數據
  phase1Cost?: number;
  phase2Cost?: number;
  phase3Cost?: number;
  phase4Cost?: number;
  activeGoldReward?: number;
  boundGoldReward?: number;
}

export interface ExcelEconomicsData {
  nickname: string;
  raidName: string;
  totalCost: number;
  activeGold: number;
  boundGold: number;
  totalRevenue: number;
  profitRatio: number;
}

// UI 相關類型
export interface CharacterWithJob {
  id: string;
  nickname: string;
  itemLevel: number;
  isMain: boolean;
  job: {
    id: string;
    name: string;
    role: JobRole;
    category: {
      name: string;
      color: string;
      icon: string;
    };
  };
}

export interface RaidWithDetails {
  id: string;
  name: string;
  type: RaidType;
  mode: RaidMode;
  gate?: string;
  scheduledTime: Date;
  status: RaidStatus;
  maxPlayers: number;
  requiredDps: number;
  requiredSupport: number;
  minItemLevel: number;
  // 經濟數據
  phase1Cost?: number;
  phase2Cost?: number;
  phase3Cost?: number;
  phase4Cost?: number;
  activeGoldReward?: number;
  boundGoldReward?: number;
  // 關聯數據
  participants: RaidParticipantWithCharacter[];
  timeline: RaidTimelineEntry[];
  economics: RaidEconomicsEntry[];
}

export interface RaidParticipantWithCharacter {
  id: string;
  status: ParticipantStatus;
  position?: string;
  character: CharacterWithJob;
}

export interface RaidTimelineEntry {
  id: string;
  gate: string;
  status: GateStatus;
  startTime?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface RaidEconomicsEntry {
  id: string;
  totalCost: number;
  activeGold: number;
  boundGold: number;
  totalRevenue: number;
  profitRatio: number;
  character: CharacterWithJob;
}

// 搜尋和過濾類型
export interface RaidFilters {
  type?: RaidType[];
  mode?: RaidMode[];
  status?: RaidStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minItemLevel?: number;
  search?: string;
}

export interface CharacterFilters {
  job?: string[];
  minItemLevel?: number;
  maxItemLevel?: number;
  isMain?: boolean;
  search?: string;
}

// 統計數據類型
export interface RaidStatistics {
  totalRaids: number;
  completedRaids: number;
  totalRevenue: number;
  totalCost: number;
  averageProfitRatio: number;
  participationByType: Record<RaidType, number>;
  topPerformingCharacters: Array<{
    character: CharacterWithJob;
    totalRevenue: number;
    raidCount: number;
  }>;
}

// 排程相關類型
export interface WeeklySchedule {
  userId: string;
  schedules: Array<{
    dayOfWeek: number;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      note?: string;
    }>;
  }>;
}

// WebSocket 事件類型
export interface SocketEvents {
  'raid:updated': RaidWithDetails;
  'raid:participant:joined': { raidId: string; participant: RaidParticipantWithCharacter };
  'raid:participant:left': { raidId: string; participantId: string };
  'raid:timeline:updated': { raidId: string; timeline: RaidTimelineEntry };
  'user:presence': { userId: string; online: boolean };
}

// 表單類型
export interface CreateRaidForm {
  name: string;
  type: RaidType;
  mode: RaidMode;
  gate?: string;
  scheduledTime: Date;
  maxPlayers: number;
  requiredDps: number;
  requiredSupport: number;
  minItemLevel: number;
  phase1Cost?: number;
  phase2Cost?: number;
  phase3Cost?: number;
  phase4Cost?: number;
  activeGoldReward?: number;
  boundGoldReward?: number;
  notes?: string;
}

export interface CreateCharacterForm {
  nickname: string;
  itemLevel: number;
  jobId: string;
  isMain: boolean;
}