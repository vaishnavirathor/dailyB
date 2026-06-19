const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'songs-checkpoint.json');
const OUTPUT = path.join(__dirname, 'daily-bread', 'src', 'content', 'bundled', 'scraped-hymns.json');

const TELUGU_RE = /[\u0C00-\u0C7F]/;

const CRUFT_RE = /^(download lyrics|lyricist:|chords credits|good song|praise the|tq|awesome|love this song|gracefull song|thank|brother|prisethelord)/i;

function isTeluguLyric(line) {
  return TELUGU_RE.test(line) && !CRUFT_RE.test(line.trim());
}

function slugifyUrl(url) {
  const match = url.match(/christianlyricz\.com\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/);
  return match ? match[1].replace(/\/+$/, '') : null;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
  const hymns = [];

  for (const song of raw) {
    const teluguLines = song.lyrics.filter(isTeluguLyric);
    if (teluguLines.length === 0) continue;

    const id = slugifyUrl(song.url) || `song-${hymns.length}`;
    const enTitle = id ? id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : song.title;

    const stanzas = teluguLines.map((line) => ({
      te: line.trim(),
      translit: '',
    }));

    hymns.push({
      id,
      title: { en: enTitle, te: song.title },
      source: 'original',
      stanzas,
    });
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(hymns, null, 2), 'utf-8');
  console.log(`Converted ${hymns.length} hymns → ${OUTPUT}`);
}

main();
