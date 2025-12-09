-- Update job logos to use Lost Ark Wiki CDN URLs
-- Base URL: https://static.wikia.nocookie.net/lostark_gamepedia/images/

-- Male Warriors (男戰士)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/b/bf/ClassIcon-Warrior-Destroyer.png' where name = '毀滅者';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/2/2b/ClassIcon-Warrior-Gunlancer.png' where name = '督軍';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/4/40/ClassIcon-Warrior-Berserker.png' where name = '狂戰士';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/6/6c/ClassIcon-Warrior-Paladin.png' where name = '聖騎士';

-- Female Warriors (女戰士)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/b/b8/ClassIcon-Warrior-Slayer.png' where name = '屠殺者';

-- Male Fighters (男格鬥)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/7/70/ClassIcon-Martial_Artist-Wardancer.png' where name = '鬥士';

-- Female Fighters (女格鬥)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/f/f8/ClassIcon-Martial_Artist-Striker.png' where name = '格鬥大師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/4/45/ClassIcon-Martial_Artist-Scrapper.png' where name = '拳霸';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/1/15/ClassIcon-Martial_Artist-Soulfist.png' where name = '氣功師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/f/fa/ClassIcon-Gunner-Gunslinger.png' where name = '槍術士';

-- Male Gunners (男射手)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/2/26/ClassIcon-Gunner-Artillerist.png' where name = '槍砲大師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/2/28/ClassIcon-Gunner-Sharpshooter.png' where name = '鷹眼';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/a/a6/ClassIcon-Gunner-Machinist.png' where name = '惡魔獵手';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/a/a6/ClassIcon-Gunner-Machinist.png' where name = '偵察士';

-- Female Gunners (女射手)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/8/84/ClassIcon-Gunner-Deadeye.png' where name = '神槍手';

-- Mages (魔法師)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/2/24/ClassIcon-Mage-Arcanist.png' where name = '卡牌魔術師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/7/70/ClassIcon-Mage-Bard.png' where name = '吟遊詩人';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/1/19/ClassIcon-Mage-Sorceress.png' where name = '女巫';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/9/9a/ClassIcon-Mage-Summoner.png' where name = '召喚師';

-- Assassins (暗殺者)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/5/5c/ClassIcon-Assassin-Deathblade.png' where name = '刀鋒';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/5/52/ClassIcon-Assassin-Reaper.png' where name = '半魔人';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/9/95/ClassIcon-Assassin-Souleater.png' where name = '噬魂者';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/f/f2/ClassIcon-Assassin-Shadowhunter.png' where name = '影殺者';

-- Specialists (幻使)
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/1/13/ClassIcon-Specialist-Artist.png' where name = '畫師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/2/26/ClassIcon-Specialist-Breaker.png' where name = '幻獸師';
update public.jobs set logo = 'https://static.wikia.nocookie.net/lostark_gamepedia/images/8/8a/ClassIcon-Specialist-Aeromancer.png' where name = '氣象術士';
