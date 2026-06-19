const cheerio = require('cheerio');

const BASE_URL = 'https://christianlyricz.com';
const TELUGU_URL = BASE_URL;
const ENGLISH_URL = `${BASE_URL}/english-songs/`;

async function fetchHtml(url) {
  const resp = await fetch(url);
  return await resp.text();
}

async function extractTeluguSongLinks() {
  console.log('Fetching Telugu songs page...');
  const html = await fetchHtml(TELUGU_URL);
  const $ = cheerio.load(html);

  // The Telugu song links are under .letter-section > ul.az-columns > li > a
  const links = [];
  $('.letter-section ul.az-columns li a').each((i, el) => {
    const href = $(el).attr('href');
    const title = $(el).text().trim();
    if (href && href.startsWith(BASE_URL)) {
      links.push({ title, url: href, language: 'telugu' });
    }
  });
  console.log(`Found ${links.length} Telugu song links`);
  return links;
}

async function extractEnglishSongLinks() {
  console.log('Fetching English songs page...');
  const html = await fetchHtml(ENGLISH_URL);
  const $ = cheerio.load(html);

  const links = [];
  $('.letter-section ul.az-columns li a').each((i, el) => {
    const href = $(el).attr('href');
    const title = $(el).text().trim();
    if (href && href.startsWith(BASE_URL)) {
      links.push({ title, url: href, language: 'english' });
    }
  });
  console.log(`Found ${links.length} English song links`);
  return links;
}

async function extractSongLyrics(url) {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $('h1.entry-title').text().trim().replace('– CHRISTIAN LYRICZ', '').trim();
    
    const article = $('article');
    const paragraphs = [];
    article.find('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });

    // First paragraph is usually "పాట రచయిత: ... Lyricist: ..."
    let lyricist = '';
    let lyrics = [];

    if (paragraphs.length > 0) {
      const firstP = paragraphs[0];
      const lyricistMatch = firstP.match(/Lyricist:\s*(.+)/i);
      if (lyricistMatch) {
        lyricist = lyricistMatch[1].trim();
      }
      // Skip first paragraph (it's metadata), rest are lyrics
      lyrics = paragraphs.slice(1);
    }

    return {
      title: title || $('title').text().replace('– CHRISTIAN LYRICZ', '').trim(),
      url,
      lyricist,
      lyrics,
    };
  } catch (err) {
    console.error(`Error fetching ${url}: ${err.message}`);
    return { title: '', url, lyricist: '', lyrics: [], error: err.message };
  }
}

async function main() {
  const fs = require('fs');
  const CHECKPOINT_FILE = 'songs-checkpoint.json';
  
  // Step 1: Extract or load all links
  let allLinks;
  if (fs.existsSync('song-index.json') && !process.argv.includes('--refresh-index')) {
    allLinks = JSON.parse(fs.readFileSync('song-index.json', 'utf8'));
    console.log(`Loaded ${allLinks.length} songs from song-index.json`);
  } else {
    const teluguLinks = await extractTeluguSongLinks();
    const englishLinks = await extractEnglishSongLinks();
    allLinks = [...teluguLinks, ...englishLinks];
    fs.writeFileSync('song-index.json', JSON.stringify(allLinks, null, 2));
    console.log(`Total songs: ${allLinks.length} (Telugu: ${teluguLinks.length}, English: ${englishLinks.length})`);
  }

  // Step 2: Load checkpoint if exists
  let results = [];
  let startIndex = 0;
  if (fs.existsSync(CHECKPOINT_FILE)) {
    results = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    startIndex = results.length;
    console.log(`Resuming from checkpoint: ${startIndex}/${allLinks.length} already scraped`);
  }

  // Step 3: Scrape remaining songs
  for (let i = startIndex; i < allLinks.length; i++) {
    const song = allLinks[i];
    process.stdout.write(`\rScraping ${i + 1}/${allLinks.length} (${((i+1)/allLinks.length*100).toFixed(1)}%): ${song.title.substring(0, 35).padEnd(35)}`);
    const data = await extractSongLyrics(song.url);
    results.push({
      ...song,
      lyricist: data.lyricist,
      lyrics: data.lyrics,
    });
    
    // Save checkpoint every 50 songs
    if ((i + 1) % 50 === 0 || i === allLinks.length - 1) {
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(results, null, 2));
    }
    
    await new Promise(r => setTimeout(r, 300));
  }

  // Step 4: Final save
  console.log('\nSaving final songs.json...');
  fs.writeFileSync('songs.json', JSON.stringify(results, null, 2));
  // Remove checkpoint
  if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
  console.log(`Done! Saved ${results.length} songs.`);
  
  // Summary
  const teluguCount = results.filter(s => s.language === 'telugu').length;
  const englishCount = results.filter(s => s.language === 'english').length;
  const withLyricist = results.filter(s => s.lyricist).length;
  const withLyrics = results.filter(s => s.lyrics.length > 0).length;
  console.log(`Summary: ${teluguCount} Telugu, ${englishCount} English, ${withLyricist} have lyricist, ${withLyrics} have lyrics.`);
}

main().catch(console.error);
