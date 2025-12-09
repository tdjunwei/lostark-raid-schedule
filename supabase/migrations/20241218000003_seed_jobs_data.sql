-- Seed job categories and jobs data
-- Based on Lost Ark class system

-- Insert job categories (職業分類)
insert into public.job_categories (name, color, icon) values
  ('男戰士', '#8B4513', '/icons/categories/male_warrior.svg'),
  ('女戰士', '#CD853F', '/icons/categories/female_warrior.svg'),
  ('男格鬥', '#FF6347', '/icons/categories/male_fighter.svg'),
  ('女格鬥', '#FF8C69', '/icons/categories/female_fighter.svg'),
  ('男射手', '#4169E1', '/icons/categories/male_gunner.svg'),
  ('女射手', '#6495ED', '/icons/categories/female_gunner.svg'),
  ('魔法師', '#9370DB', '/icons/categories/mage.svg'),
  ('暗殺者', '#2F4F4F', '/icons/categories/assassin.svg'),
  ('幻使', '#48D1CC', '/icons/categories/specialist.svg')
on conflict (name) do nothing;

-- Insert jobs (職業)
-- Male Warriors (男戰士)
insert into public.jobs (name, category_id, role, logo, description)
select '毀滅者', id, 'DPS', '/icons/jobs/destroyer.png', '使用重型武器的強力戰士'
from public.job_categories where name = '男戰士'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '督軍', id, 'DPS', '/icons/jobs/warlord.png', '指揮戰場的戰術大師'
from public.job_categories where name = '男戰士'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '狂戰士', id, 'DPS', '/icons/jobs/berserker.png', '狂暴的近戰戰士'
from public.job_categories where name = '男戰士'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '聖騎士', id, 'SUPPORT', '/icons/jobs/paladin.png', '神聖的輔助職業'
from public.job_categories where name = '男戰士'
on conflict (name) do nothing;

-- Female Warriors (女戰士)
insert into public.jobs (name, category_id, role, logo, description)
select '屠殺者', id, 'DPS', '/icons/jobs/slayer.png', '使用巨劍的女戰士'
from public.job_categories where name = '女戰士'
on conflict (name) do nothing;

-- Male Fighters (男格鬥)
insert into public.jobs (name, category_id, role, logo, description)
select '鬥士', id, 'DPS', '/icons/jobs/wardancer.png', '快速連擊的格鬥家'
from public.job_categories where name = '男格鬥'
on conflict (name) do nothing;

-- Female Fighters (女格鬥)
insert into public.jobs (name, category_id, role, logo, description)
select '格鬥大師', id, 'DPS', '/icons/jobs/striker.png', '靈活的格鬥家'
from public.job_categories where name = '女格鬥'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '拳霸', id, 'DPS', '/icons/jobs/scrapper.png', '使用重拳的格鬥家'
from public.job_categories where name = '女格鬥'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '氣功師', id, 'DPS', '/icons/jobs/soulfist.png', '運用氣功的武術家'
from public.job_categories where name = '女格鬥'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '槍術士', id, 'DPS', '/icons/jobs/gunslinger.png', '使用三種武器的神槍手'
from public.job_categories where name = '女格鬥'
on conflict (name) do nothing;

-- Male Gunners (男射手)
insert into public.jobs (name, category_id, role, logo, description)
select '槍砲大師', id, 'DPS', '/icons/jobs/artillerist.png', '使用重型火砲的射手'
from public.job_categories where name = '男射手'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '鷹眼', id, 'DPS', '/icons/jobs/sharpshooter.png', '精準的弓箭手'
from public.job_categories where name = '男射手'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '惡魔獵手', id, 'DPS', '/icons/jobs/demon_hunter.png', '使用雙槍的獵人'
from public.job_categories where name = '男射手'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '偵察士', id, 'DPS', '/icons/jobs/scouter.png', '使用機械裝備的射手'
from public.job_categories where name = '男射手'
on conflict (name) do nothing;

-- Female Gunners (女射手)
insert into public.jobs (name, category_id, role, logo, description)
select '神槍手', id, 'DPS', '/icons/jobs/deadeye.png', '靈活的三槍手'
from public.job_categories where name = '女射手'
on conflict (name) do nothing;

-- Mages (魔法師)
insert into public.jobs (name, category_id, role, logo, description)
select '卡牌魔術師', id, 'DPS', '/icons/jobs/arcanist.png', '使用卡牌魔法的術士'
from public.job_categories where name = '魔法師'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '吟遊詩人', id, 'SUPPORT', '/icons/jobs/bard.png', '演奏樂曲的輔助職業'
from public.job_categories where name = '魔法師'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '女巫', id, 'DPS', '/icons/jobs/sorceress.png', '強大的元素魔法師'
from public.job_categories where name = '魔法師'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '召喚師', id, 'DPS', '/icons/jobs/summoner.png', '召喚魔獸的魔法師'
from public.job_categories where name = '魔法師'
on conflict (name) do nothing;

-- Assassins (暗殺者)
insert into public.jobs (name, category_id, role, logo, description)
select '刀鋒', id, 'DPS', '/icons/jobs/blade.png', '使用雙刀的刺客'
from public.job_categories where name = '暗殺者'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '半魔人', id, 'DPS', '/icons/jobs/reaper.png', '操控黑暗的刺客'
from public.job_categories where name = '暗殺者'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '噬魂者', id, 'DPS', '/icons/jobs/soul_eater.png', '吞噬靈魂的刺客'
from public.job_categories where name = '暗殺者'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '影殺者', id, 'DPS', '/icons/jobs/shadowhunter.png', '化身惡魔的刺客'
from public.job_categories where name = '暗殺者'
on conflict (name) do nothing;

-- Specialists (幻使)
insert into public.jobs (name, category_id, role, logo, description)
select '畫師', id, 'SUPPORT', '/icons/jobs/artist.png', '用畫筆作戰的藝術家'
from public.job_categories where name = '幻使'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '幻獸師', id, 'DPS', '/icons/jobs/breaker.png', '操控幻獸的專家'
from public.job_categories where name = '幻使'
on conflict (name) do nothing;

insert into public.jobs (name, category_id, role, logo, description)
select '氣象術士', id, 'DPS', '/icons/jobs/aeromancer.png', '操控天氣的魔法師'
from public.job_categories where name = '幻使'
on conflict (name) do nothing;
