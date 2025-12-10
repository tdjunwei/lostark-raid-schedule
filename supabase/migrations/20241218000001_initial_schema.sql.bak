-- Lost Ark 副本日程表系統 - 初始資料庫結構
-- 基於 Excel 數據分析的完整 schema

-- 啟用必要的 extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 列舉類型
create type user_role as enum ('ADMIN', 'SCHEDULER', 'PLAYER');
create type job_role as enum ('DPS', 'SUPPORT');
create type raid_type as enum ('CELESTIAL', 'DREAM', 'IVORY_TOWER', 'PLAGUE');
create type raid_mode as enum ('SOLO', 'NORMAL', 'HARD');
create type raid_status as enum ('PLANNED', 'RECRUITING', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type participant_status as enum ('PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED');
create type gate_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- 用戶系統 (擴展 Supabase auth.users)
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  role user_role default 'PLAYER'::user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 職業分類系統 (基於 Excel 分析)
create table public.job_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique, -- 男戰士、女戰士、魔法師、男格鬥、女格鬥、男射手、女射手、幻使、暗殺者
  color text not null, -- 代表顏色
  icon text not null, -- 職業圖標路徑
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 職業系統 (基於 Excel 實際發現的職業)
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique, -- 槍術士、格鬥大師、聖騎士、畫家、氣象術士、影殺者、拳霸、刀鋒等
  category_id uuid references public.job_categories(id) on delete restrict not null,
  role job_role default 'DPS'::job_role,
  logo text, -- 職業 logo 路徑
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 角色系統
create table public.characters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  nickname text not null,
  item_level integer not null check (item_level >= 1490),
  job_id uuid references public.jobs(id) on delete restrict not null,
  is_main boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, nickname)
);

-- 日程系統 (支援週四到週三週期)
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time text not null, -- Format: "HH:MM"
  end_time text not null, -- Format: "HH:MM"  
  available boolean default true,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, day_of_week, start_time)
);

-- 副本系統 (基於 Excel 收益數據)
create table public.raids (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type raid_type not null,
  mode raid_mode default 'NORMAL'::raid_mode,
  gate text, -- G1, G2, G3
  scheduled_time timestamp with time zone not null,
  status raid_status default 'PLANNED'::raid_status,
  
  -- 需求設定
  max_players integer default 8 check (max_players > 0),
  required_dps integer default 0 check (required_dps >= 0),
  required_support integer default 0 check (required_support >= 0),
  min_item_level integer check (min_item_level >= 1490),
  
  -- 經濟模型 (基於 Excel P1-P4 階段數據)
  phase1_cost integer check (phase1_cost >= 0),
  phase2_cost integer check (phase2_cost >= 0),
  phase3_cost integer check (phase3_cost >= 0), 
  phase4_cost integer check (phase4_cost >= 0),
  active_gold_reward integer check (active_gold_reward >= 0),
  bound_gold_reward integer check (bound_gold_reward >= 0),
  
  notes text,
  created_by uuid references public.user_profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 副本參與者
create table public.raid_participants (
  id uuid default uuid_generate_v4() primary key,
  raid_id uuid references public.raids(id) on delete cascade not null,
  character_id uuid references public.characters(id) on delete cascade not null,
  status participant_status default 'PENDING'::participant_status,
  position text, -- DPS, SUPPORT, TANK 定位
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(raid_id, character_id)
);

-- 經濟追蹤 (基於 Excel 收益金數據)
create table public.raid_economics (
  id uuid default uuid_generate_v4() primary key,
  raid_id uuid references public.raids(id) on delete cascade not null,
  character_id uuid references public.characters(id) on delete cascade not null,
  total_cost integer default 0, -- 總消耗 (P1+P2+P3+P4)
  active_gold integer default 0, -- 活金收益
  bound_gold integer default 0, -- 綁金收益
  total_revenue integer default 0, -- 總收益
  profit_ratio decimal(5,2) default 0.00, -- 收益率 = (總收益 - 總成本) / 總成本
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(raid_id, character_id)
);

-- 副本時間線 (關卡進度追蹤)
create table public.raid_timeline (
  id uuid default uuid_generate_v4() primary key,
  raid_id uuid references public.raids(id) on delete cascade not null,
  gate text not null, -- G1, G2, G3
  status gate_status default 'PENDING'::gate_status,
  start_time timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(raid_id, gate)
);

-- 獎勵系統
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  raid_id uuid references public.raids(id) on delete cascade not null,
  item_name text not null,
  quantity integer default 1 check (quantity > 0),
  gold_value integer check (gold_value >= 0),
  distributed boolean default false,
  distributed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引以提升查詢效能
create index idx_characters_user_id on public.characters(user_id);
create index idx_characters_job_id on public.characters(job_id);
create index idx_characters_item_level on public.characters(item_level);
create index idx_schedules_user_id on public.schedules(user_id);
create index idx_schedules_day_of_week on public.schedules(day_of_week);
create index idx_raids_type on public.raids(type);
create index idx_raids_mode on public.raids(mode);
create index idx_raids_status on public.raids(status);
create index idx_raids_scheduled_time on public.raids(scheduled_time);
create index idx_raid_participants_raid_id on public.raid_participants(raid_id);
create index idx_raid_participants_character_id on public.raid_participants(character_id);
create index idx_raid_economics_raid_id on public.raid_economics(raid_id);
create index idx_raid_timeline_raid_id on public.raid_timeline(raid_id);

-- 觸發器：自動更新 updated_at 欄位
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.characters
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.schedules
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.raids
  for each row execute procedure public.handle_updated_at();

-- RLS (Row Level Security) 政策
alter table public.user_profiles enable row level security;
alter table public.characters enable row level security;
alter table public.schedules enable row level security;
alter table public.raids enable row level security;
alter table public.raid_participants enable row level security;
alter table public.raid_economics enable row level security;
alter table public.raid_timeline enable row level security;
alter table public.rewards enable row level security;

-- 用戶個人資料政策
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 角色政策
create policy "Users can view their own characters" on public.characters
  for select using (auth.uid() = user_id);

create policy "Users can manage their own characters" on public.characters
  for all using (auth.uid() = user_id);

create policy "All users can view characters for raid planning" on public.characters
  for select using (true);

-- 日程政策
create policy "Users can manage their own schedules" on public.schedules
  for all using (auth.uid() = user_id);

create policy "All users can view schedules for raid planning" on public.schedules
  for select using (true);

-- 副本政策
create policy "All users can view raids" on public.raids
  for select using (true);

create policy "Schedulers and Admins can manage raids" on public.raids
  for all using (
    exists (
      select 1 from public.user_profiles 
      where id = auth.uid() and role in ('ADMIN', 'SCHEDULER')
    )
  );

-- 副本參與者政策
create policy "Users can view raid participants" on public.raid_participants
  for select using (true);

create policy "Users can join raids with their characters" on public.raid_participants
  for insert with check (
    exists (
      select 1 from public.characters
      where id = character_id and user_id = auth.uid()
    )
  );

-- 經濟數據政策
create policy "Users can view economics for their characters" on public.raid_economics
  for select using (
    exists (
      select 1 from public.characters 
      where id = character_id and user_id = auth.uid()
    )
  );

-- 公開資料表 (不需要 RLS)
alter table public.job_categories disable row level security;
alter table public.jobs disable row level security;