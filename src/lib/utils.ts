import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Excel 時間序列號轉 JavaScript Date
export function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

// 解析時間範圍字串 "20-24" or "19-03"
export function parseTimeRange(timeRange: string): { startTime: string; endTime: string } {
  const parts = timeRange.split('-');
  if (parts.length !== 2) {
    return { startTime: '00:00', endTime: '23:59' };
  }
  
  const startHour = parseInt(parts[0] || '0');
  const endHour = parseInt(parts[1] || '23');
  
  return {
    startTime: `${startHour.toString().padStart(2, '0')}:00`,
    endTime: `${endHour.toString().padStart(2, '0')}:00`,
  };
}

// 計算收益率
export function calculateProfitRatio(revenue: number, cost: number): number {
  if (cost === 0) return revenue > 0 ? 100 : 0;
  return ((revenue - cost) / cost) * 100;
}

// 格式化金幣數字
export function formatGold(amount: number): string {
  return new Intl.NumberFormat('zh-TW').format(amount);
}

// 獲取裝等顏色類別
export function getItemLevelColorClass(itemLevel: number): string {
  if (itemLevel >= 1600) return 'item-level-1600';
  if (itemLevel >= 1580) return 'item-level-1580';
  if (itemLevel >= 1540) return 'item-level-1540';
  if (itemLevel >= 1490) return 'item-level-1490';
  return '';
}

// 獲取副本類型顏色類別
export function getRaidTypeColorClass(raidType: string): string {
  switch (raidType.toLowerCase()) {
    case 'celestial':
    case '天界':
      return 'raid-celestial';
    case 'dream':
    case '夢幻':
      return 'raid-dream';
    case 'ivory_tower':
    case '象牙塔':
      return 'raid-ivory-tower';
    case 'plague':
    case '瘟疫':
      return 'raid-plague';
    default:
      return '';
  }
}

// 獲取職業角色顏色類別
export function getJobRoleColorClass(role: string): string {
  switch (role.toLowerCase()) {
    case 'dps':
      return 'role-dps';
    case 'support':
      return 'role-support';
    case 'tank':
      return 'role-tank';
    default:
      return '';
  }
}