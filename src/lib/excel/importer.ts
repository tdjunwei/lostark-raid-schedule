import * as XLSX from 'xlsx';
import { createServerSupabaseClient } from '@/lib/supabase';
import { ExcelCharacter, ExcelSchedule, ExcelRaidData, ExcelEconomicsData } from '@/types';
import { parseTimeRange, excelDateToJSDate } from '@/lib/utils';
import type { Database } from '@/types/supabase';

export class ExcelImporter {
  private supabase = createServerSupabaseClient();
  
  constructor() {}

  async importFromFile(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    
    // 記錄所有可用的工作表
    const availableSheets = workbook.SheetNames;
    // Debug: console.log('Available sheets:', availableSheets);
    
    // 驗證核心工作表存在
    const coreSheets = ['暱稱', '裝等表'];
    const missingSheets = coreSheets.filter(sheet => !workbook.Sheets[sheet]);
    if (missingSheets.length > 0) {
      console.warn(`Missing core sheets: ${missingSheets.join(', ')}`);
    }

    const results = {
      characters: await this.importCharacters(workbook),
      schedules: await this.importSchedules(workbook),
      raids: await this.importRaids(workbook),
      economics: await this.importEconomics(workbook),
      rewards: await this.importRewards(workbook),
      achievements: await this.importAchievements(workbook),
      gems: await this.importGemPrices(workbook),
      guides: await this.importGuides(workbook),
      missions: await this.importMissions(workbook),
    };

    return results;
  }

  private async importCharacters(workbook: XLSX.WorkBook): Promise<ExcelCharacter[]> {
    const itemLevelSheet = workbook.Sheets['裝等表'];
    const data = XLSX.utils.sheet_to_json(itemLevelSheet, { header: 1, defval: '' }) as unknown[][];
    
    const characters: ExcelCharacter[] = [];
    
    // 解析標題行以確定列位置
    const headerRow = data[1] as string[];
    const nameColIndex = headerRow.findIndex(h => h === '名稱');
    const jobColIndex = headerRow.findIndex(h => h === '職業');
    const itemLevelColIndex = headerRow.findIndex(h => h === '裝等');
    const dreamColIndex = headerRow.findIndex(h => h === '夢幻');
    const celestialColIndex = headerRow.findIndex(h => h === '天界');
    const plagueColIndex = headerRow.findIndex(h => h === '瘟疫');
    const ivoryTowerColIndex = headerRow.findIndex(h => h === '象牙塔');

    // 從第三行開始解析數據
    for (let row = 2; row < data.length; row++) {
      const rowData = data[row] as (string | number | boolean)[];
      if (!rowData || rowData.length === 0) continue;
      
      const nickname = rowData[nameColIndex];
      const job = rowData[jobColIndex];
      const itemLevel = rowData[itemLevelColIndex];
      
      if (nickname && typeof nickname === 'string' && 
          job && typeof job === 'string' && 
          itemLevel && typeof itemLevel === 'number') {
        
        characters.push({
          nickname,
          job,
          itemLevel,
          dreamParticipation: Boolean(rowData[dreamColIndex]),
          celestialParticipation: Boolean(rowData[celestialColIndex]),
          plagueParticipation: Boolean(rowData[plagueColIndex]),
          ivoryTowerParticipation: Boolean(rowData[ivoryTowerColIndex]),
        });
      }
    }
    
    return characters;
  }

  private async importSchedules(workbook: XLSX.WorkBook): Promise<ExcelSchedule[]> {
    const nicknameSheet = workbook.Sheets['暱稱'];
    if (!nicknameSheet) return [];
    
    const data = XLSX.utils.sheet_to_json(nicknameSheet, { header: 1, defval: '' }) as unknown[][];
    const schedules: ExcelSchedule[] = [];
    
    // 日期列映射 (假設從第二列開始是週一到週日)
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
      const rowData = data[row] as (string | number)[];
      if (!rowData || rowData.length === 0) continue;
      
      const nickname = rowData[0];
      if (nickname && typeof nickname === 'string') {
        // 檢查列 1-7 的時間範圍數據
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

  private async importRaids(workbook: XLSX.WorkBook): Promise<ExcelRaidData[]> {
    const raids: ExcelRaidData[] = [];
    
    const raidSheets: Record<string, { type: string, mode: string }> = {
      '天界': { type: 'CELESTIAL', mode: 'NORMAL' },
      '夢幻': { type: 'DREAM', mode: 'NORMAL' },
      '象牙塔': { type: 'IVORY_TOWER', mode: 'NORMAL' },
      '瘟疫': { type: 'PLAGUE', mode: 'NORMAL' },
    };
    
    for (const [sheetName, config] of Object.entries(raidSheets)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
      
      // 解析副本數據
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row] as (string | number)[];
        if (!rowData || rowData.length === 0) continue;
        
        // 查找日期和時間信息
        const dateIndex = rowData.findIndex(cell => 
          typeof cell === 'number' && cell > 40000 && cell < 50000 // Excel 日期序列號範圍
        );
        
        if (dateIndex !== -1) {
          const dateSerial = rowData[dateIndex] as number;
          const scheduledTime = excelDateToJSDate(dateSerial);
          
          // 查找參與者列表
          const participants: string[] = [];
          for (let col = 0; col < rowData.length; col++) {
            const cell = rowData[col];
            if (typeof cell === 'string' && cell.length > 0 && 
                !cell.includes('日期') && !cell.includes('時間') && 
                !cell.includes('定位') && !cell.includes('裝分') && 
                !cell.includes('暱稱') && !cell.includes('職業')) {
              // 可能是玩家暱稱
              participants.push(cell);
            }
          }
          
          if (participants.length > 0) {
            raids.push({
              type: config.type,
              mode: config.mode,
              participants,
              scheduledTime,
            });
          }
        }
      }
    }
    
    return raids;
  }

  private async importEconomics(workbook: XLSX.WorkBook): Promise<ExcelEconomicsData[]> {
    const economicsSheet = workbook.Sheets['收益金'];
    if (!economicsSheet) return [];
    
    const data = XLSX.utils.sheet_to_json(economicsSheet, { header: 1, defval: '' }) as unknown[][];
    const economics: ExcelEconomicsData[] = [];
    
    // 解析標題行
    const headerRow = data[1] as string[];
    const raidColIndex = headerRow.findIndex(h => h === '副本');
    const p1ColIndex = headerRow.findIndex(h => h === 'P1');
    const p2ColIndex = headerRow.findIndex(h => h === 'P2');
    const p3ColIndex = headerRow.findIndex(h => h === 'P3');
    const p4ColIndex = headerRow.findIndex(h => h === 'P4');
    const totalCostIndex = headerRow.findIndex(h => h === '總共');
    const activeGoldIndex = headerRow.findIndex(h => h === '活金');
    const boundGoldIndex = headerRow.findIndex(h => h === '綁金');
    const totalRevenueIndex = headerRow.findIndex(h => h === '總收益');
    
    // 從第三行開始解析數據
    for (let row = 2; row < data.length; row++) {
      const rowData = data[row] as (string | number)[];
      if (!rowData || rowData.length === 0) continue;
      
      const raidName = rowData[raidColIndex];
      const activeGold = rowData[activeGoldIndex];
      const boundGold = rowData[boundGoldIndex];
      const totalRevenue = rowData[totalRevenueIndex];
      const totalCost = Math.abs(rowData[totalCostIndex] as number || 0);
      
      if (raidName && typeof raidName === 'string' &&
          typeof activeGold === 'number' && 
          typeof boundGold === 'number') {
        
        const revenue = (totalRevenue as number) || (activeGold + boundGold);
        const profitRatio = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
        
        economics.push({
          nickname: '', // 需要從其他地方關聯
          raidName,
          totalCost,
          activeGold,
          boundGold,
          totalRevenue: revenue,
          profitRatio,
        });
      }
    }
    
    return economics;
  }

  // 輔助方法：創建缺失的職業
  async createJobIfNotExists(jobName: string): Promise<string> {
    // 職業分類映射
    const jobCategoryMap: Record<string, { category: string, role: Database['public']['Enums']['job_role'] }> = {
      '槍術士': { category: '女格鬥', role: 'DPS' },
      '格鬥大師': { category: '女格鬥', role: 'DPS' },
      '聖騎士': { category: '男戰士', role: 'SUPPORT' },
      '畫家': { category: '蘿莉', role: 'DPS' },
      '氣象術士': { category: '蘿莉', role: 'DPS' },
      '影殺者': { category: '暗殺者', role: 'DPS' },
      '拳霸': { category: '女格鬥', role: 'DPS' },
      '刀鋒': { category: '暗殺者', role: 'DPS' },
      '氣功師': { category: '女格鬥', role: 'DPS' },
      '斗士': { category: '男格鬥', role: 'DPS' },
      '毀滅者': { category: '男戰士', role: 'DPS' },
      '督軍': { category: '男戰士', role: 'DPS' },
      '狂戰士': { category: '男戰士', role: 'DPS' },
      '屠殺者': { category: '女戰士', role: 'DPS' },
      // 可以繼續添加更多職業
    };
    
    const jobInfo = jobCategoryMap[jobName];
    if (!jobInfo) {
      throw new Error(`Unknown job: ${jobName}`);
    }
    
    // 查找或創建職業分類
    let { data: category } = await this.supabase
      .from('job_categories')
      .select('*')
      .eq('name', jobInfo.category)
      .single();
    
    if (!category) {
      const { data: newCategory } = await this.supabase
        .from('job_categories')
        .insert({
          name: jobInfo.category,
          color: this.getCategoryColor(jobInfo.category),
          icon: `/icons/categories/${jobInfo.category}.png`,
        })
        .select()
        .single();
      
      category = newCategory!;
    }
    
    // 查找或創建職業
    let { data: job } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('name', jobName)
      .single();
    
    if (!job) {
      const { data: newJob } = await this.supabase
        .from('jobs')
        .insert({
          name: jobName,
          category_id: category.id,
          role: jobInfo.role,
          logo: `/icons/jobs/${jobName}.png`,
        })
        .select()
        .single();
      
      job = newJob!;
    }
    
    return job.id;
  }
  
  private getCategoryColor(categoryName: string): string {
    const colorMap: Record<string, string> = {
      '男戰士': '#FF6B6B',
      '女戰士': '#FF8E8E', 
      '魔法師': '#4ECDC4',
      '男格鬥': '#45B7D1',
      '女格鬥': '#96CEB4',
      '射手': '#FFEAA7',
      '女槍': '#DDA0DD',
      '蘿莉': '#FFB6C1',
      '暗殺者': '#696969',
    };
    
    return colorMap[categoryName] || '#808080';
  }

  // 導入獎勵數據
  private async importRewards(workbook: XLSX.WorkBook): Promise<any[]> {
    const rewardsSheet = workbook.Sheets['副本獎勵表'];
    if (!rewardsSheet) return [];
    
    const data = XLSX.utils.sheet_to_json(rewardsSheet, { header: 1, defval: '' }) as unknown[][];
    const rewards: any[] = [];
    
    // 解析標題行
    const headerRow = data[0] as string[];
    const raidColIndex = headerRow.findIndex(h => h?.includes('副本') || h?.includes('raid'));
    const itemColIndex = headerRow.findIndex(h => h?.includes('道具') || h?.includes('item'));
    const goldValueColIndex = headerRow.findIndex(h => h?.includes('金值') || h?.includes('gold'));
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row] as (string | number)[];
      if (!rowData || rowData.length === 0) continue;
      
      const raidName = rowData[raidColIndex];
      const itemName = rowData[itemColIndex];
      const goldValue = rowData[goldValueColIndex];
      
      if (raidName && itemName && typeof raidName === 'string' && typeof itemName === 'string') {
        rewards.push({
          raidName,
          itemName,
          goldValue: typeof goldValue === 'number' ? goldValue : 0,
          quantity: 1,
        });
      }
    }
    
    return rewards;
  }

  // 導入成就數據
  private async importAchievements(workbook: XLSX.WorkBook): Promise<any[]> {
    const achievementSheets = ['島之心', '巨人之心', '奧菲斯之星'];
    const achievements: any[] = [];
    
    for (const sheetName of achievementSheets) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
      
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row] as (string | number | boolean)[];
        if (!rowData || rowData.length === 0) continue;
        
        // 假設第一列是名稱，第二列是完成狀態
        const name = rowData[0];
        const completed = Boolean(rowData[1]);
        
        if (name && typeof name === 'string') {
          achievements.push({
            category: sheetName,
            name,
            completed,
          });
        }
      }
    }
    
    return achievements;
  }

  // 導入寶石價格數據
  private async importGemPrices(workbook: XLSX.WorkBook): Promise<any[]> {
    const gemSheets = ['寶石比價系統', '寶石價格'];
    const gemPrices: any[] = [];
    
    for (const sheetName of gemSheets) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
      
      // 解析標題行
      const headerRow = data[0] as string[];
      const levelColIndex = headerRow.findIndex(h => h?.includes('等級') || h?.includes('level'));
      const priceColIndex = headerRow.findIndex(h => h?.includes('價格') || h?.includes('price'));
      const typeColIndex = headerRow.findIndex(h => h?.includes('類型') || h?.includes('type'));
      
      for (let row = 1; row < data.length; row++) {
        const rowData = data[row] as (string | number)[];
        if (!rowData || rowData.length === 0) continue;
        
        const level = rowData[levelColIndex];
        const price = rowData[priceColIndex];
        const type = rowData[typeColIndex];
        
        if (typeof level === 'number' && typeof price === 'number') {
          gemPrices.push({
            level,
            price,
            type: type || 'unknown',
            category: sheetName,
          });
        }
      }
    }
    
    return gemPrices;
  }

  // 導入攻略指南數據
  private async importGuides(workbook: XLSX.WorkBook): Promise<any[]> {
    const guideSheets = workbook.SheetNames.filter(name => 
      name.includes('攻略') || name.includes('指南') || name.includes('guide')
    );
    
    const guides: any[] = [];
    
    for (const sheetName of guideSheets) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
      
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row] as (string | number)[];
        if (!rowData || rowData.length === 0) continue;
        
        // 簡單的文字內容提取
        const content = rowData.filter(cell => 
          typeof cell === 'string' && cell.length > 3
        ).join(' | ');
        
        if (content) {
          guides.push({
            category: sheetName,
            content,
            row: row + 1,
          });
        }
      }
    }
    
    return guides;
  }

  // 導入艾波娜委託數據
  private async importMissions(workbook: XLSX.WorkBook): Promise<any[]> {
    const missionSheet = workbook.Sheets['艾波娜委託'];
    if (!missionSheet) return [];
    
    const data = XLSX.utils.sheet_to_json(missionSheet, { header: 1, defval: '' }) as unknown[][];
    const missions: any[] = [];
    
    // 解析標題行
    const headerRow = data[0] as string[];
    const nameColIndex = headerRow.findIndex(h => h?.includes('委託') || h?.includes('任務') || h?.includes('name'));
    const reputationColIndex = headerRow.findIndex(h => h?.includes('聲望') || h?.includes('reputation'));
    const rewardColIndex = headerRow.findIndex(h => h?.includes('獎勵') || h?.includes('reward'));
    const statusColIndex = headerRow.findIndex(h => h?.includes('狀態') || h?.includes('status'));
    
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row] as (string | number | boolean)[];
      if (!rowData || rowData.length === 0) continue;
      
      const name = rowData[nameColIndex];
      const reputation = rowData[reputationColIndex];
      const reward = rowData[rewardColIndex];
      const status = rowData[statusColIndex];
      
      if (name && typeof name === 'string') {
        missions.push({
          name,
          reputation: typeof reputation === 'number' ? reputation : 0,
          reward: reward || '',
          completed: Boolean(status),
        });
      }
    }
    
    return missions;
  }

  // 批量導入數據到數據庫
  async importToDatabase(results: any): Promise<any> {
    const importSummary = {
      characters: 0,
      schedules: 0,
      raids: 0,
      economics: 0,
      rewards: 0,
      achievements: 0,
      gems: 0,
      guides: 0,
      missions: 0,
      errors: [] as string[],
    };

    try {
      // 1. 導入角色數據
      if (results.characters?.length > 0) {
        for (const char of results.characters) {
          try {
            const jobId = await this.createJobIfNotExists(char.job);
            
            const { error } = await this.supabase
              .from('characters')
              .upsert({
                nickname: char.nickname,
                item_level: char.itemLevel,
                job_id: jobId,
                notes: `夢幻:${char.dreamParticipation}, 天界:${char.celestialParticipation}, 瘟疫:${char.plagueParticipation}, 象牙塔:${char.ivoryTowerParticipation}`,
              }, { onConflict: 'user_id,nickname' });
            
            if (!error) importSummary.characters++;
          } catch (error) {
            importSummary.errors.push(`Character ${char.nickname}: ${error}`);
          }
        }
      }

      // 2. 導入日程數據
      if (results.schedules?.length > 0) {
        for (const schedule of results.schedules) {
          try {
            const timeRange = parseTimeRange(schedule.timeRange);
            
            const { error } = await this.supabase
              .from('schedules')
              .upsert({
                day_of_week: schedule.dayOfWeek,
                start_time: timeRange.startTime,
                end_time: timeRange.endTime,
                available: true,
                note: `來自Excel: ${schedule.nickname}`,
              }, { onConflict: 'user_id,day_of_week,start_time' });
            
            if (!error) importSummary.schedules++;
          } catch (error) {
            importSummary.errors.push(`Schedule ${schedule.nickname}: ${error}`);
          }
        }
      }

      return importSummary;
    } catch (error) {
      importSummary.errors.push(`Database import error: ${error}`);
      return importSummary;
    }
  }
}