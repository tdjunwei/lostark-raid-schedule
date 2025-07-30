import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

export interface ExcelCharacter {
  nickname: string;
  itemLevel: number;
}

export interface ExcelSchedule {
  nickname: string;
  dayOfWeek: number;
  timeRange: string;
}

export interface ExcelRaidData {
  type: string;
  participants: string[];
  scheduledTime?: Date;
}

export class ExcelImporter {
  constructor(private _prisma: PrismaClient) {}

  async importFromFile(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    
    const sheets = {
      nicknames: workbook.Sheets['暱稱'],
      itemLevels: workbook.Sheets['裝等表'],
      celestial: workbook.Sheets['天界'],
      dream: workbook.Sheets['夢幻'],
      ivoryTower: workbook.Sheets['象牙塔'],
      plague: workbook.Sheets['瘟疫'],
      revenue: workbook.Sheets['收益金'],
      rewards: workbook.Sheets['副本獎勵表'],
    };

    if (!sheets.nicknames || !sheets.itemLevels) {
      throw new Error('Required sheets (暱稱, 裝等表) not found');
    }

    const results = {
      characters: await this.importCharacters(sheets.nicknames, sheets.itemLevels),
      schedules: await this.importSchedules(sheets.nicknames),
      raids: await this.importRaids(sheets),
    };

    return results;
  }

  private async importCharacters(nicknameSheet: XLSX.WorkSheet, itemLevelSheet: XLSX.WorkSheet) {
    const nicknameData = XLSX.utils.sheet_to_json(nicknameSheet, { header: 1 }) as unknown[][];
    const itemLevelData = XLSX.utils.sheet_to_json(itemLevelSheet, { header: 1 }) as unknown[][];
    
    const characters: ExcelCharacter[] = [];
    
    // Parse nickname sheet to get character names and their schedules
    for (let row = 1; row < nicknameData.length; row++) {
      const rowData = nicknameData[row];
      if (!rowData || rowData.length === 0) continue;
      
      const nickname = rowData[0];
      if (nickname && typeof nickname === 'string') {
        // Find corresponding item level
        let itemLevel = 1540; // Default item level
        
        for (let i = 1; i < itemLevelData.length; i++) {
          const itemRow = itemLevelData[i];
          if (itemRow && itemRow[0] === nickname && typeof itemRow[1] === 'number') {
            itemLevel = itemRow[1] || 1540;
            break;
          }
        }
        
        characters.push({ nickname, itemLevel });
      }
    }
    
    return characters;
  }

  private async importSchedules(nicknameSheet: XLSX.WorkSheet) {
    const data = XLSX.utils.sheet_to_json(nicknameSheet, { header: 1 }) as unknown[][];
    const schedules: ExcelSchedule[] = [];
    
    // Column mapping: 1=Monday, 2=Tuesday, etc.
    const dayColumns: Record<number, number> = {
      1: 1, // Monday
      2: 2, // Tuesday
      3: 3, // Wednesday
      4: 4, // Thursday
      5: 5, // Friday
      6: 6, // Saturday
      7: 0, // Sunday
    };
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData || rowData.length === 0) continue;
      
      const nickname = rowData[0];
      if (nickname && typeof nickname === 'string') {
        // Check columns 1-7 for schedule data
        for (let col = 1; col <= 7; col++) {
          const timeRange = rowData[col];
          if (timeRange && typeof timeRange === 'string') {
            const dayOfWeek = dayColumns[col];
            if (dayOfWeek !== undefined) {
              schedules.push({
                nickname,
                dayOfWeek,
                timeRange,
              });
            }
          }
        }
      }
    }
    
    return schedules;
  }

  private async importRaids(sheets: Record<string, XLSX.WorkSheet | undefined>) {
    const raids: ExcelRaidData[] = [];
    
    const raidTypes: Record<string, string> = {
      '天界': 'CELESTIAL',
      '夢幻': 'DREAM',
      '象牙塔': 'IVORY_TOWER',
      '瘟疫': 'PLAGUE',
    };
    
    for (const [sheetName, raidType] of Object.entries(raidTypes)) {
      const sheet = sheets[sheetName === '天界' ? 'celestial' : 
                          sheetName === '夢幻' ? 'dream' : 
                          sheetName === '象牙塔' ? 'ivoryTower' : 'plague'];
      
      if (sheet) {
        // Parse raid participation data
        // This would need more sophisticated parsing based on actual Excel structure
        const raidData: ExcelRaidData = {
          type: raidType,
          participants: [],
        };
        
        raids.push(raidData);
      }
    }
    
    return raids;
  }

  // Helper method to parse time ranges like "20-24" or "19-03"
  parseTimeRange(timeRange: string): { startTime: string; endTime: string } {
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

  // Convert Excel date serial number to JS Date
  excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
}