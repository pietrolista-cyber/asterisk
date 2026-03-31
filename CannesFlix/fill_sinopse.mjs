/**
 * fill_sinopse.mjs
 * Busca sinopses para as 934 entradas sem texto:
 *  - YouTube/youtu.be → shortDescription da página
 *  - Vimeo            → oEmbed description
 *  - D&AD             → scraping da página
 *  - Clios / LBB      → Bing search snippet
 *  - Outros sites     → og:description / meta description
 *  Traduz tudo para PT-BR via Google Translate
 *  Atualiza DATA no HTML
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML  = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONC  = 20;
const TO    = 12000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

// ── Tradução PT-BR ────────────────────────────────────────
async function translate(text) {
  if (!text || text.trim().length < 10) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text.slice(0, 800))}`;
    const r = await ft(url);
    if (!r.ok) return text;
    const j = await r.json();
    return j[0]?.map(s => s[0]).join('') || text;
  } catch { return text; }
}

// ── Detecta idioma (simples) ─────────────────────────────
function isAlreadyPT(text) {
  if (!text) return false;
  const ptWords = /\b(de|da|do|que|para|uma|com|por|não|como|foi|são|sua|seu|este|essa|nos|nas)\b/i;
  return ptWords.test(text);
}

// ── YouTube: extrai shortDescription ─────────────────────
async function getYouTubeDesc(url) {
  try {
    // Normaliza youtu.be → watch URL
    let watchUrl = url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      watchUrl = `https://www.youtube.com/watch?v=${id}`;
    }
    const r = await ft(watchUrl, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' }
    });
    if (!r.ok) return null;
    const pg = await r.text();
    // Tenta shortDescription no ytInitialData
    const m = pg.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (m) {
      const desc = m[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\/g, '').trim();
      if (desc.length > 30 && !desc.toLowerCase().includes('aproveite vídeos')) return desc;
    }
    // Fallback: og:description
    const og = pg.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{20,})["']/i)
             || pg.match(/<meta[^>]+content=["']([^"']{20,})["'][^>]+property=["']og:description["']/i);
    if (og) return og[1];
    return null;
  } catch { return null; }
}

// ── Vimeo: oEmbed description ─────────────────────────────
async function getVimeoDesc(url) {
  try {
    const r = await ft(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    if (!r.ok) return null;
    const j = await r.json();
    const desc = (j.description || '').trim();
    return desc.length > 20 ? desc : null;
  } catch { return null; }
}

// ── Bing search snippet ───────────────────────────────────
async function bingSearchSnippet(campanha, marca) {
  const query = `"${campanha}" "${marca}" cannes advertisement campaign`;
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=en`;
  try {
    const r = await ft(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html' }
    });
    if (!r.ok) return null;
    const pg = await r.text();
    // Extrai snippets de resultado
    const snippets = [...pg.matchAll(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter(s => s.length > 40);
    if (snippets.length) return snippets[0];
    // Fallback: qualquer <p> com texto relevante
    const ps = [...pg.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(s => s.length > 50 && (
        s.toLowerCase().includes(campanha.toLowerCase().split(' ')[0]) ||
        s.toLowerCase().includes(marca.toLowerCase().split(' ')[0])
      ));
    return ps[0] || null;
  } catch { return null; }
}

// ── Scraping genérico de página ───────────────────────────
async function scrapePageDesc(url) {
  try {
    const r = await ft(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': (() => { try { return new URL(url).origin + '/'; } catch { return ''; } })()
      },
      redirect: 'follow'
    });
    if (!r.ok) return null;
    const pg = await r.text();

    // 1. og:description
    const og = pg.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{30,})["']/i)
             || pg.match(/<meta[^>]+content=["']([^"']{30,})["'][^>]+property=["']og:description["']/i);
    if (og) return og[1].trim();

    // 2. meta description
    const meta = pg.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{30,})["']/i)
              || pg.match(/<meta[^>]+content=["']([^"']{30,})["'][^>]+name=["']description["']/i);
    if (meta) return meta[1].trim();

    // 3. D&AD: busca campo específico de descrição
    if (url.includes('dandad.org')) {
      const dd = pg.match(/<div[^>]*class="[^"]*entry-copy[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
              || pg.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*><p>([\s\S]*?)<\/p>/i);
      if (dd) return dd[1].replace(/<[^>]+>/g, '').trim();
    }

    // 4. Primeiro parágrafo com conteúdo
    const paras = [...pg.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 60 && p.length < 1000 && !/cookie|copyright|privacy/i.test(p));
    if (paras.length) return paras[0];

    return null;
  } catch { return null; }
}

// ── Carrega DATA ──────────────────────────────────────────
let html = readFileSync(HTML, 'utf8');
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);

const noSin = data.filter(d => !d.sinopse || !d.sinopse.trim());
console.log(`Entradas sem sinopse: ${noSin.length}`);

// Separa por estratégia
const ytEntries     = noSin.filter(d => d.link?.includes('youtube.com') || d.link?.includes('youtu.be'));
const vimeoEntries  = noSin.filter(d => d.link?.includes('vimeo.com'));
const cliosEntries  = noSin.filter(d => d.link?.includes('clios.com'));
const lbbEntries    = noSin.filter(d => d.link?.includes('lbbonline.com'));
const otherEntries  = noSin.filter(d =>
  !d.link?.includes('youtube') && !d.link?.includes('youtu.be') &&
  !d.link?.includes('vimeo') && !d.link?.includes('clios') && !d.link?.includes('lbbonline')
);

console.log(`  YouTube: ${ytEntries.length} | Vimeo: ${vimeoEntries.length} | Clios: ${cliosEntries.length} | LBB: ${lbbEntries.length} | Outros: ${otherEntries.length}`);

let found = 0;

// ── FASE 1: YouTube ───────────────────────────────────────
console.log('\n[1/5] YouTube...');
for (let i = 0; i < ytEntries.length; i += CONC) {
  const batch = ytEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const desc = await getYouTubeDesc(d.link);
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,ytEntries.length)}/${ytEntries.length} | ok: ${found}`);
}
console.log();

// ── FASE 2: Vimeo ─────────────────────────────────────────
console.log('[2/5] Vimeo...');
for (let i = 0; i < vimeoEntries.length; i += CONC) {
  const batch = vimeoEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const desc = await getVimeoDesc(d.link);
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,vimeoEntries.length)}/${vimeoEntries.length} | total ok: ${found}`);
}
console.log();

// ── FASE 3: Outros sites (D&AD, agências, etc.) ───────────
console.log('[3/5] Outros sites (D&AD, agências, etc.)...');
for (let i = 0; i < otherEntries.length; i += CONC) {
  const batch = otherEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const desc = await scrapePageDesc(d.link);
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,otherEntries.length)}/${otherEntries.length} | total ok: ${found}`);
}
console.log();

// ── FASE 4: Clios (Bing search) ───────────────────────────
console.log('[4/5] Clios via Bing search...');
for (let i = 0; i < cliosEntries.length; i += CONC) {
  const batch = cliosEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const desc = await bingSearchSnippet(d.campanha, d.marca);
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,cliosEntries.length)}/${cliosEntries.length} | total ok: ${found}`);
}
console.log();

// ── FASE 5: LBBOnline (Bing search) ──────────────────────
console.log('[5/5] LBBOnline via Bing search...');
for (let i = 0; i < lbbEntries.length; i += CONC) {
  const batch = lbbEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const desc = await bingSearchSnippet(d.campanha, d.marca);
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,lbbEntries.length)}/${lbbEntries.length} | total ok: ${found}`);
}
console.log();

// ── Salva ─────────────────────────────────────────────────
html = html.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);
writeFileSync(HTML, html, 'utf8');

const totalSin  = data.filter(d => d.sinopse && d.sinopse.trim()).length;
const stillNone = data.filter(d => !d.sinopse || !d.sinopse.trim()).length;
console.log('\n═══ Resultado ═══');
console.log(`  Sinopses novas encontradas: ${found}`);
console.log(`  Total com sinopse: ${totalSin} / ${data.length}`);
console.log(`  Ainda sem sinopse: ${stillNone}`);
console.log('✓ HTML salvo');
