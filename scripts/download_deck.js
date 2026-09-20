import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const targetDir = path.resolve('client/public/cards');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const suits = [
  { code: 'S', name: 'spades' },
  { code: 'H', name: 'hearts' },
  { code: 'D', name: 'diamonds' },
  { code: 'C', name: 'clubs' }
];

const ranks = [
  { code: '2', fileRank: '2' },
  { code: '3', fileRank: '3' },
  { code: '4', fileRank: '4' },
  { code: '5', fileRank: '5' },
  { code: '6', fileRank: '6' },
  { code: '7', fileRank: '7' },
  { code: '8', fileRank: '8' },
  { code: '9', fileRank: '9' },
  { code: '10', fileRank: '10' },
  { code: 'J', fileRank: 'jack' },
  { code: 'Q', fileRank: 'queen' },
  { code: 'K', fileRank: 'king' },
  { code: 'A', fileRank: 'ace' }
];

function fetchFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url} (Status: ${res.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function downloadDeck() {
  console.log('Downloading CC0 Public Domain Deck into client/public/cards/ ...');

  const baseUrl = 'https://raw.githubusercontent.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20fronts';
  const downloads = [];

  for (const s of suits) {
    for (const r of ranks) {
      const fileName = `${r.fileRank}%20of%20${s.name}.svg`;
      const url = `${baseUrl}/${s.name}/${fileName}`;
      const dest = path.join(targetDir, `${s.code}_${r.code}.svg`);
      downloads.push({ url, dest, id: `${s.code}_${r.code}` });
    }
  }

  // Card Back
  const backUrl = 'https://raw.githubusercontent.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards/main/svg%20cards/card%20backs/card%20back%20red.svg';
  const backDest = path.join(targetDir, 'back.svg');
  downloads.push({ url: backUrl, dest: backDest, id: 'back' });

  // Download with concurrency control (5 at a time)
  const queue = [...downloads];
  let completed = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      try {
        await fetchFile(item.url, item.dest);
        completed++;
        process.stdout.write(`\r[${completed}/${downloads.length}] Downloaded ${item.id}.svg`);
      } catch (err) {
        console.error(`\nError downloading ${item.id}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: 6 }, () => worker());
  await Promise.all(workers);

  console.log('\nAll 52 CC0 card SVGs + card back downloaded successfully!');
}

downloadDeck().catch(console.error);
