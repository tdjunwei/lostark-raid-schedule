-- Add english_name column to jobs table
alter table public.jobs add column if not exists english_name text;

-- Update existing job names (fix swaps and add english names)
-- Warriors
update public.jobs set english_name = 'Destroyer' where name = '毀滅者';
update public.jobs set english_name = 'Gunlancer' where name = '督軍';
update public.jobs set english_name = 'Berserker' where name = '狂戰士';
update public.jobs set english_name = 'Paladin' where name = '聖騎士';
update public.jobs set english_name = 'Slayer' where name = '屠殺者';

-- Fighters - FIX SWAPS
update public.jobs set
  name = 'Wardancer (temp)',
  english_name = 'Wardancer'
where name = '鬥士';

update public.jobs set
  name = 'Striker (temp)',
  english_name = 'Striker'
where name = '格鬥大師';

update public.jobs set name = '格鬥大師' where name = 'Wardancer (temp)';
update public.jobs set name = '鬥士' where name = 'Striker (temp)';

update public.jobs set english_name = 'Scrapper' where name = '拳霸';
update public.jobs set english_name = 'Soulfist' where name = '氣功師';

-- Gunners - FIX NAMES AND LOGOS
-- Delete 槍術士 (wrong job name)
delete from public.jobs where name = '槍術士';

-- Update 神槍手 to use gunslinger logo
update public.jobs set
  logo = '/icons/jobs/gunslinger.png',
  english_name = 'Gunslinger'
where name = '神槍手';

-- Update 惡魔獵手 to use deadeye logo
update public.jobs set
  logo = '/icons/jobs/deadeye.png',
  english_name = 'Deadeye'
where name = '惡魔獵手';

update public.jobs set english_name = 'Artillerist' where name = '槍砲大師';
update public.jobs set english_name = 'Sharpshooter' where name = '鷹眼';
update public.jobs set english_name = 'Machinist' where name = '偵察士';

-- Mages
update public.jobs set english_name = 'Arcanist' where name = '卡牌魔術師';
update public.jobs set english_name = 'Bard' where name = '吟遊詩人';
update public.jobs set english_name = 'Sorceress' where name = '女巫';
update public.jobs set english_name = 'Summoner' where name = '召喚師';

-- Assassins - FIX SWAPS
update public.jobs set
  name = 'Shadowhunter (temp)',
  english_name = 'Shadowhunter'
where name = '影殺者';

update public.jobs set
  name = 'Reaper (temp)',
  english_name = 'Reaper'
where name = '半魔人';

update public.jobs set name = '半魔人' where name = 'Shadowhunter (temp)';
update public.jobs set name = '影殺者' where name = 'Reaper (temp)';

update public.jobs set english_name = 'Deathblade' where name = '刀鋒';
update public.jobs set english_name = 'Souleater' where name = '噬魂者';

-- Specialists
update public.jobs set english_name = 'Artist' where name = '畫師';
update public.jobs set english_name = 'Aeromancer' where name = '氣象術士';

-- Rename 幻獸師 to use Wildsoul english name (breaker.png logo will be reused for new job)
update public.jobs set
  english_name = 'Wildsoul',
  logo = '/icons/jobs/wildsoul.png'
where name = '幻獸師';

-- Add new job: 拳剎 (Breaker) - uses the breaker.png logo
insert into public.jobs (name, category_id, role, logo, description, english_name)
select '拳剎', id, 'DPS', '/icons/jobs/breaker.png', '使用重拳打擊的格鬥家', 'Breaker'
from public.job_categories where name = '幻使'
on conflict (name) do nothing;

-- Add new job: 女聖騎 (Valkyrie) - new support class
insert into public.jobs (name, category_id, role, logo, description, english_name)
select '女聖騎', id, 'SUPPORT', '/icons/jobs/valkyrie.png', '神聖的女性騎士', 'Valkyrie'
from public.job_categories where name = '女戰士'
on conflict (name) do nothing;
