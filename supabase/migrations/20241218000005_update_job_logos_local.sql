-- Update job logos to use local paths
-- Icons need to be downloaded from Lost Ark Wiki and placed in public/icons/jobs/

-- Male Warriors (男戰士)
update public.jobs set logo = '/icons/jobs/destroyer.png' where name = '毀滅者';
update public.jobs set logo = '/icons/jobs/gunlancer.png' where name = '督軍';
update public.jobs set logo = '/icons/jobs/berserker.png' where name = '狂戰士';
update public.jobs set logo = '/icons/jobs/paladin.png' where name = '聖騎士';

-- Female Warriors (女戰士)
update public.jobs set logo = '/icons/jobs/slayer.png' where name = '屠殺者';

-- Male Fighters (男格鬥)
update public.jobs set logo = '/icons/jobs/wardancer.png' where name = '鬥士';

-- Female Fighters (女格鬥)
update public.jobs set logo = '/icons/jobs/striker.png' where name = '格鬥大師';
update public.jobs set logo = '/icons/jobs/scrapper.png' where name = '拳霸';
update public.jobs set logo = '/icons/jobs/soulfist.png' where name = '氣功師';
update public.jobs set logo = '/icons/jobs/gunslinger.png' where name = '槍術士';

-- Male Gunners (男射手)
update public.jobs set logo = '/icons/jobs/artillerist.png' where name = '槍砲大師';
update public.jobs set logo = '/icons/jobs/sharpshooter.png' where name = '鷹眼';
update public.jobs set logo = '/icons/jobs/machinist.png' where name = '惡魔獵手';
update public.jobs set logo = '/icons/jobs/machinist.png' where name = '偵察士';

-- Female Gunners (女射手)
update public.jobs set logo = '/icons/jobs/deadeye.png' where name = '神槍手';

-- Mages (魔法師)
update public.jobs set logo = '/icons/jobs/arcanist.png' where name = '卡牌魔術師';
update public.jobs set logo = '/icons/jobs/bard.png' where name = '吟遊詩人';
update public.jobs set logo = '/icons/jobs/sorceress.png' where name = '女巫';
update public.jobs set logo = '/icons/jobs/summoner.png' where name = '召喚師';

-- Assassins (暗殺者)
update public.jobs set logo = '/icons/jobs/deathblade.png' where name = '刀鋒';
update public.jobs set logo = '/icons/jobs/reaper.png' where name = '半魔人';
update public.jobs set logo = '/icons/jobs/souleater.png' where name = '噬魂者';
update public.jobs set logo = '/icons/jobs/shadowhunter.png' where name = '影殺者';

-- Specialists (幻使)
update public.jobs set logo = '/icons/jobs/artist.png' where name = '畫師';
update public.jobs set logo = '/icons/jobs/breaker.png' where name = '幻獸師';
update public.jobs set logo = '/icons/jobs/aeromancer.png' where name = '氣象術士';
