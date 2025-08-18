-- 插入職業分類數據 (基於 Excel 分析)
INSERT INTO public.job_categories (name, color, icon) VALUES
  ('男戰士', '#FF6B6B', '/icons/categories/male-warrior.png'),
  ('女戰士', '#FF8E8E', '/icons/categories/female-warrior.png'),
  ('魔法師', '#4ECDC4', '/icons/categories/mage.png'),
  ('男格鬥', '#45B7D1', '/icons/categories/male-martial-artist.png'),
  ('女格鬥', '#96CEB4', '/icons/categories/female-martial-artist.png'),
  ('射手', '#FFEAA7', '/icons/categories/gunner.png'),
  ('女槍', '#DDA0DD', '/icons/categories/female-gunner.png'),
  ('蘿莉', '#FFB6C1', '/icons/categories/specialist.png'),
  ('暗殺者', '#696969', '/icons/categories/assassin.png')
ON CONFLICT (name) DO NOTHING;

-- 插入具體職業數據 (基於 Excel 發現的實際職業)
WITH category_ids AS (
  SELECT name, id FROM public.job_categories
)
INSERT INTO public.jobs (name, category_id, role, logo, description) VALUES
  -- 男戰士職業
  ('毀滅者', (SELECT id FROM category_ids WHERE name = '男戰士'), 'DPS', '/icons/jobs/destroyer.png', '重型武器專家，擁有強大的破壞力'),
  ('督軍', (SELECT id FROM category_ids WHERE name = '男戰士'), 'DPS', '/icons/jobs/berserker.png', '狂暴戰士，以生命力換取攻擊力'),
  ('狂戰士', (SELECT id FROM category_ids WHERE name = '男戰士'), 'DPS', '/icons/jobs/berserker.png', '進入狂暴狀態的強力戰士'),
  ('聖騎士', (SELECT id FROM category_ids WHERE name = '男戰士'), 'SUPPORT', '/icons/jobs/paladin.png', '神聖力量的支援型戰士'),
  
  -- 女戰士職業
  ('屠殺者', (SELECT id FROM category_ids WHERE name = '女戰士'), 'DPS', '/icons/jobs/slayer.png', '快速且致命的近戰戰士'),
  
  -- 男格鬥職業
  ('鬥士', (SELECT id FROM category_ids WHERE name = '男格鬥'), 'DPS', '/icons/jobs/striker.png', '拳法大師，擅長連擊'),
  
  -- 女格鬥職業
  ('格鬥大師', (SELECT id FROM category_ids WHERE name = '女格鬥'), 'DPS', '/icons/jobs/wardancer.png', '元素拳法的大師'),
  ('拳霸', (SELECT id FROM category_ids WHERE name = '女格鬥'), 'DPS', '/icons/jobs/scrapper.png', '重拳出擊的格鬥家'),
  ('氣功師', (SELECT id FROM category_ids WHERE name = '女格鬥'), 'DPS', '/icons/jobs/soulfist.png', '氣功波動的專家'),
  ('槍術士', (SELECT id FROM category_ids WHERE name = '女格鬥'), 'DPS', '/icons/jobs/glaivier.png', '槍與劍的雙重大師'),
  
  -- 魔法師職業
  ('卡牌魔術師', (SELECT id FROM category_ids WHERE name = '魔法師'), 'DPS', '/icons/jobs/arcanist.png', '卡牌魔法的操控者'),
  ('吟遊詩人', (SELECT id FROM category_ids WHERE name = '魔法師'), 'SUPPORT', '/icons/jobs/bard.png', '音樂治療的支援者'),
  ('女巫', (SELECT id FROM category_ids WHERE name = '魔法師'), 'DPS', '/icons/jobs/sorceress.png', '元素魔法的專家'),
  ('召喚師', (SELECT id FROM category_ids WHERE name = '魔法師'), 'DPS', '/icons/jobs/summoner.png', '召喚獸的指揮官'),
  
  -- 射手職業
  ('惡魔獵手', (SELECT id FROM category_ids WHERE name = '射手'), 'DPS', '/icons/jobs/deathblade.png', '惡魔力量的獵手'),
  ('槍炮大師', (SELECT id FROM category_ids WHERE name = '射手'), 'DPS', '/icons/jobs/artillerist.png', '重火器專家'),
  ('鷹眼', (SELECT id FROM category_ids WHERE name = '射手'), 'DPS', '/icons/jobs/sharpshooter.png', '精準射擊的大師'),
  ('偵查士', (SELECT id FROM category_ids WHERE name = '射手'), 'DPS', '/icons/jobs/scout.png', '偵查與射擊的專家'),
  
  -- 女槍職業
  ('神槍手', (SELECT id FROM category_ids WHERE name = '女槍'), 'DPS', '/icons/jobs/gunslinger.png', '三重武器的專家'),
  
  -- 蘿莉職業
  ('畫師', (SELECT id FROM category_ids WHERE name = '蘿莉'), 'SUPPORT', '/icons/jobs/artist.png', '繪畫魔法的藝術家'),
  ('氣象術士', (SELECT id FROM category_ids WHERE name = '蘿莉'), 'DPS', '/icons/jobs/aeromancer.png', '天氣操控的專家'),
  
  -- 暗殺者職業
  ('刀鋒', (SELECT id FROM category_ids WHERE name = '暗殺者'), 'DPS', '/icons/jobs/deathblade.png', '影之刀刃的大師'),
  ('半魔人', (SELECT id FROM category_ids WHERE name = '暗殺者'), 'DPS', '/icons/jobs/shadowhunter.png', '魔化變身的暗殺者'),
  ('噬魂者', (SELECT id FROM category_ids WHERE name = '暗殺者'), 'DPS', '/icons/jobs/reaper.png', '死亡鐮刀的使者'),
  ('影殺者', (SELECT id FROM category_ids WHERE name = '暗殺者'), 'DPS', '/icons/jobs/shadowhunter.png', '影子操控的殺手')
ON CONFLICT (name) DO NOTHING;