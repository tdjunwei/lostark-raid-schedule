# Lost Ark Job Icons

This directory should contain the job class icons for the Lost Ark raid schedule system.

## Required Icons (26 total)

### How to Download

The icons can be downloaded from the [Lost Ark Wiki](https://lostark.fandom.com/wiki/Category:Class_Icons).

**Download URLs** (visit each page and download the image):

### Male Warriors (男戰士)
- **destroyer.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Warrior-Destroyer.png
- **gunlancer.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Warrior-Gunlancer.png
- **berserker.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Warrior-Berserker.png
- **paladin.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Warrior-Paladin.png

### Female Warriors (女戰士)
- **slayer.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Warrior-Slayer.png

### Male Fighters (男格鬥)
- **wardancer.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Martial_Artist-Wardancer.png

### Female Fighters (女格鬥)
- **striker.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Martial_Artist-Striker.png
- **scrapper.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Martial_Artist-Scrapper.png
- **soulfist.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Martial_Artist-Soulfist.png
- **gunslinger.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Gunner-Gunslinger.png

### Male Gunners (男射手)
- **artillerist.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Gunner-Artillerist.png
- **sharpshooter.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Gunner-Sharpshooter.png
- **machinist.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Gunner-Machinist.png

### Female Gunners (女射手)
- **deadeye.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Gunner-Deadeye.png

### Mages (魔法師)
- **arcanist.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Mage-Arcanist.png
- **bard.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Mage-Bard.png
- **sorceress.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Mage-Sorceress.png
- **summoner.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Mage-Summoner.png

### Assassins (暗殺者)
- **deathblade.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Assassin-Deathblade.png
- **reaper.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Assassin-Reaper.png
- **souleater.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Assassin-Souleater.png
- **shadowhunter.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Assassin-Shadowhunter.png

### Specialists (幻使)
- **artist.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Specialist-Artist.png
- **breaker.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Specialist-Breaker.png
- **aeromancer.png** - https://lostark.fandom.com/wiki/File:ClassIcon-Specialist-Aeromancer.png

## Quick Download Steps

1. Visit each URL above
2. Click on the image to view full size
3. Right-click and "Save Image As..."
4. Rename to the filename listed (e.g., `destroyer.png`)
5. Save to this directory (`public/icons/jobs/`)

## Alternative: Batch Download Script

You can create a script to download all icons at once:

```bash
#!/bin/bash
# Download Lost Ark class icons

# Base URL
BASE_URL="https://lostark.fandom.com/wiki/Special:Redirect/file"

# Download function
download_icon() {
    local filename=$1
    local wikiname=$2
    echo "Downloading $filename..."
    curl -L "$BASE_URL/$wikiname" -o "$filename"
}

cd public/icons/jobs

# Warriors
download_icon "destroyer.png" "ClassIcon-Warrior-Destroyer.png"
download_icon "gunlancer.png" "ClassIcon-Warrior-Gunlancer.png"
download_icon "berserker.png" "ClassIcon-Warrior-Berserker.png"
download_icon "paladin.png" "ClassIcon-Warrior-Paladin.png"
download_icon "slayer.png" "ClassIcon-Warrior-Slayer.png"

# Martial Artists
download_icon "wardancer.png" "ClassIcon-Martial_Artist-Wardancer.png"
download_icon "striker.png" "ClassIcon-Martial_Artist-Striker.png"
download_icon "scrapper.png" "ClassIcon-Martial_Artist-Scrapper.png"
download_icon "soulfist.png" "ClassIcon-Martial_Artist-Soulfist.png"

# Gunners
download_icon "artillerist.png" "ClassIcon-Gunner-Artillerist.png"
download_icon "sharpshooter.png" "ClassIcon-Gunner-Sharpshooter.png"
download_icon "machinist.png" "ClassIcon-Gunner-Machinist.png"
download_icon "deadeye.png" "ClassIcon-Gunner-Deadeye.png"
download_icon "gunslinger.png" "ClassIcon-Gunner-Gunslinger.png"

# Mages
download_icon "arcanist.png" "ClassIcon-Mage-Arcanist.png"
download_icon "bard.png" "ClassIcon-Mage-Bard.png"
download_icon "sorceress.png" "ClassIcon-Mage-Sorceress.png"
download_icon "summoner.png" "ClassIcon-Mage-Summoner.png"

# Assassins
download_icon "deathblade.png" "ClassIcon-Assassin-Deathblade.png"
download_icon "reaper.png" "ClassIcon-Assassin-Reaper.png"
download_icon "souleater.png" "ClassIcon-Assassin-Souleater.png"
download_icon "shadowhunter.png" "ClassIcon-Assassin-Shadowhunter.png"

# Specialists
download_icon "artist.png" "ClassIcon-Specialist-Artist.png"
download_icon "breaker.png" "ClassIcon-Specialist-Breaker.png"
download_icon "aeromancer.png" "ClassIcon-Specialist-Aeromancer.png"

echo "Download complete!"
```

Save this as `download-icons.sh`, make it executable with `chmod +x download-icons.sh`, and run it.

## After Downloading

Run the database migration to update the logo paths:

```bash
npx supabase db reset
```

This will apply migration `20241218000005_update_job_logos_local.sql` which updates all job logos to use local paths.
