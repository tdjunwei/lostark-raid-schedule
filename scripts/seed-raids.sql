-- Lost Ark Raids Seed Data
-- 擴展raid_type枚舉來包含所有raid類型

-- 首先，我們需要修改raid_type枚舉來支持更多類型
-- 注意：Supabase/PostgreSQL不允許直接修改枚舉，需要重建

-- 創建新的raid_types表來替代枚舉
CREATE TABLE IF NOT EXISTS raid_types (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  category TEXT NOT NULL, -- 'LEGION', 'KAZEROS', 'EPIC'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建raid_gates表來存儲每個raid的關卡信息
CREATE TABLE IF NOT EXISTS raid_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id UUID NOT NULL REFERENCES raids(id) ON DELETE CASCADE,
  gate_number INTEGER NOT NULL,
  mode TEXT NOT NULL, -- 'SOLO', 'NORMAL', 'HARD'
  min_item_level INTEGER NOT NULL,
  active_gold INTEGER DEFAULT 0,
  bound_gold INTEGER DEFAULT 0,
  solo_coin INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(raid_id, gate_number, mode)
);

-- 添加raid的基本信息表
CREATE TABLE IF NOT EXISTS raid_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_type_id TEXT NOT NULL REFERENCES raid_types(id),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  required_support INTEGER NOT NULL,
  required_dps INTEGER NOT NULL,
  total_gates INTEGER NOT NULL,
  gold_cap_item_level INTEGER, -- 獲取金幣裝分限制
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入raid類型
INSERT INTO raid_types (id, name_en, name_zh, category) VALUES
('valtan', 'Valtan', '佛坦', 'LEGION'),
('vykas', 'Vykas', '魅魔', 'LEGION'),
('kakul-saydon', 'Kakul-Saydon', '小丑', 'LEGION'),
('brelshaza', 'Brelshaza', '夢幻', 'LEGION'),
('kayangel', 'Kayangel', '天界', 'KAZEROS'),
('akkan', 'Akkan', '瘟疫', 'KAZEROS'),
('ivory-tower', 'Ivory Tower', '象牙塔', 'KAZEROS'),
('thaemine', 'Thaemine', '卡門', 'KAZEROS'),
('echidna', 'Echidna', '初魅', 'EPIC'),
('bahemoth', 'Bahemoth', '黑龍', 'EPIC'),
('aegir', 'Aegir', '埃吉爾', 'EPIC'),
('brelshaza-solo', 'Brelshaza (Solo Mode)', '冰阿布', 'EPIC')
ON CONFLICT (id) DO NOTHING;

-- 插入raid基本信息
INSERT INTO raid_info (raid_type_id, name_zh, name_en, max_players, required_support, required_dps, total_gates, gold_cap_item_level) VALUES
-- Valtan 佛坦
('valtan', '佛坦', 'Valtan', 8, 2, 6, 2, 1600),
-- Vykas 魅魔
('vykas', '魅魔', 'Vykas', 8, 2, 6, 2, 1600),
-- Kakul-Saydon 小丑
('kakul-saydon', '小丑', 'Kakul-Saydon', 4, 1, 3, 3, 1610),
-- Brelshaza 夢幻
('brelshaza', '夢幻', 'Brelshaza', 8, 2, 6, 4, 1620),
-- Kayangel 天界
('kayangel', '天界', 'Kayangel', 4, 1, 3, 3, 1640),
-- Akkan 瘟疫
('akkan', '瘟疫', 'Akkan', 8, 2, 6, 3, 1680),
-- Ivory Tower 象牙塔
('ivory-tower', '象牙塔', 'Ivory Tower', 4, 1, 3, 3, 1660),
-- Thaemine 卡門
('thaemine', '卡門', 'Thaemine', 8, 2, 6, 4, 1620),
-- Echidna 初魅
('echidna', '初魅', 'Echidna', 8, 2, 6, 2, NULL),
-- Bahemoth 黑龍
('bahemoth', '黑龍', 'Bahemoth', 16, 4, 12, NULL, NULL),
-- Aegir 埃吉爾
('aegir', '埃吉爾', 'Aegir', 8, 2, 6, NULL, NULL),
-- Brelshaza Solo 冰阿布
('brelshaza-solo', '冰阿布', 'Brelshaza (Solo Mode)', 8, 2, 6, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 注意：以下INSERT需要先從raid_info獲取raid_id
-- 為了簡化，我們將創建一個臨時函數來插入gate數據

-- Valtan 佛坦 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'valtan' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1415, 0, 450, 50),
  (v_raid_id, 2, 'SOLO', 1415, 0, 800, 70);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1415, 150, 450, 0),
  (v_raid_id, 2, 'NORMAL', 1415, 200, 800, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1445, 200, 700, 0),
  (v_raid_id, 2, 'HARD', 1445, 350, 1450, 0);
END $$;

-- Vykas 魅魔 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'vykas' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1430, 0, 550, 60),
  (v_raid_id, 2, 'SOLO', 1430, 0, 900, 100);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1430, 150, 500, 0),
  (v_raid_id, 2, 'NORMAL', 1430, 200, 950, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1460, 200, 800, 0),
  (v_raid_id, 2, 'HARD', 1460, 500, 1800, 0);
END $$;

-- Kakul-Saydon 小丑 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'kakul-saydon' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1475, 0, 800, 60),
  (v_raid_id, 2, 'SOLO', 1475, 0, 800, 90),
  (v_raid_id, 3, 'SOLO', 1475, 0, 1600, 150);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1475, 500, 500, 0),
  (v_raid_id, 2, 'NORMAL', 1475, 500, 500, 0),
  (v_raid_id, 3, 'NORMAL', 1475, 1000, 1000, 0);
END $$;

-- Brelshaza 夢幻 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'brelshaza' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1490, 0, 1600, 150),
  (v_raid_id, 2, 'SOLO', 1490, 0, 1600, 150),
  (v_raid_id, 3, 'SOLO', 1490, 0, 1600, 150),
  (v_raid_id, 4, 'SOLO', 1490, 0, 2000, 250);

  -- Normal mode (gates 1-4, 1490 unlock)
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1490, 1500, 500, 0),
  (v_raid_id, 2, 'NORMAL', 1490, 1500, 500, 0),
  (v_raid_id, 3, 'NORMAL', 1490, 1500, 500, 0);

  -- Normal gate 4 needs 1520
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 4, 'NORMAL', 1520, 1900, 600, 0);

  -- Hard mode (gates 1-4, 1540 unlock)
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1540, 2500, 0, 0),
  (v_raid_id, 2, 'HARD', 1540, 2500, 0, 0),
  (v_raid_id, 3, 'HARD', 1540, 2500, 0, 0);

  -- Hard gate 4 needs 1560
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 4, 'HARD', 1560, 3000, 0, 0);
END $$;

-- Kayangel 天界 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'kayangel' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1540, 0, 800, 100),
  (v_raid_id, 2, 'SOLO', 1540, 0, 1200, 150),
  (v_raid_id, 3, 'SOLO', 1540, 0, 2400, 200);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1540, 1000, 0, 0),
  (v_raid_id, 2, 'NORMAL', 1540, 1500, 0, 0),
  (v_raid_id, 3, 'NORMAL', 1540, 3000, 0, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1580, 2000, 0, 0),
  (v_raid_id, 2, 'HARD', 1580, 2500, 0, 0),
  (v_raid_id, 3, 'HARD', 1580, 4000, 0, 0);
END $$;

-- Akkan 瘟疫 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'akkan' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1580, 0, 1200, 150),
  (v_raid_id, 2, 'SOLO', 1580, 0, 2000, 200),
  (v_raid_id, 3, 'SOLO', 1580, 0, 3600, 400);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1580, 1500, 0, 0),
  (v_raid_id, 2, 'NORMAL', 1580, 2500, 0, 0),
  (v_raid_id, 3, 'NORMAL', 1580, 4500, 0, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1600, 2000, 0, 0),
  (v_raid_id, 2, 'HARD', 1600, 3000, 0, 0),
  (v_raid_id, 3, 'HARD', 1600, 7000, 0, 0);
END $$;

-- Ivory Tower 象牙塔 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'ivory-tower' LIMIT 1;

  -- Solo mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1540, 0, 1200, 200),
  (v_raid_id, 2, 'SOLO', 1540, 0, 2000, 250),
  (v_raid_id, 3, 'SOLO', 1540, 0, 4000, 450);

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1540, 1500, 0, 0),
  (v_raid_id, 2, 'NORMAL', 1540, 2500, 0, 0),
  (v_raid_id, 3, 'NORMAL', 1540, 5000, 0, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1580, 2000, 0, 0),
  (v_raid_id, 2, 'HARD', 1580, 3500, 0, 0),
  (v_raid_id, 3, 'HARD', 1580, 9500, 0, 0);
END $$;

-- Thaemine 卡門 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'thaemine' LIMIT 1;

  -- Solo mode (only 3 gates)
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'SOLO', 1490, 0, 2800, 250),
  (v_raid_id, 2, 'SOLO', 1490, 0, 3200, 300),
  (v_raid_id, 3, 'SOLO', 1490, 0, 4400, 500);

  -- Normal mode (only 3 gates)
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1490, 3500, 0, 0),
  (v_raid_id, 2, 'NORMAL', 1490, 4000, 0, 0),
  (v_raid_id, 3, 'NORMAL', 1490, 5500, 0, 0);

  -- Hard mode (all 4 gates)
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1540, 5000, 0, 0),
  (v_raid_id, 2, 'HARD', 1540, 6000, 0, 0),
  (v_raid_id, 3, 'HARD', 1540, 9000, 0, 0);

  -- Hard gate 4 needs 1620
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 4, 'HARD', 1620, 23000, 0, 0);
END $$;

-- Echidna 初魅 Gates
DO $$
DECLARE
  v_raid_id UUID;
BEGIN
  SELECT id INTO v_raid_id FROM raid_info WHERE raid_type_id = 'echidna' LIMIT 1;

  -- Solo mode not available yet

  -- Normal mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'NORMAL', 1540, 5000, 0, 0),
  (v_raid_id, 2, 'NORMAL', 1540, 10000, 0, 0);

  -- Hard mode
  INSERT INTO raid_gates (raid_id, gate_number, mode, min_item_level, active_gold, bound_gold, solo_coin) VALUES
  (v_raid_id, 1, 'HARD', 1580, 8000, 0, 0),
  (v_raid_id, 2, 'HARD', 1580, 14000, 0, 0);
END $$;

-- Note: Bahemoth, Aegir, and Brelshaza Solo Mode details not provided
-- These can be added later when information is available
