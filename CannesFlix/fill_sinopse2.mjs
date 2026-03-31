/**
 * fill_sinopse2.mjs
 * Segunda passagem para os 453 restantes sem sinopse:
 *  - Vimeo sem desc → Bing search snippet
 *  - YouTube sem desc → Bing search snippet
 *  - Outros inacessíveis → Bing search snippet
 * Traduz para PT-BR
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const UA   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONC = 15;
const TO   = 12000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

async function translate(text) {
  if (!text || text.trim().length < 10) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text.slice(0,800))}`;
    const r = await ft(url);
    if (!r.ok) return text;
    const j = await r.json();
    return j[0]?.map(s => s[0]).join('') || text;
  } catch { return text; }
}

function isAlreadyPT(text) {
  const ptWords = /\b(de|da|do|que|para|uma|com|por|não|como|foi|são|sua|seu|este|essa|nos|nas)\b/i;
  return ptWords.test(text);
}

// ── Bing: busca snippet + fallback DuckDuckGo ─────────────
async function searchSnippet(campanha, marca, extra='') {
  const query = `"${campanha.slice(0,50)}" "${marca.slice(0,40)}" cannes ${extra} advertisement`;

  // Tenta Bing
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=en`;
    const r = await ft(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html' }
    });
    if (r.ok) {
      const pg = await r.text();
      // Snippets de resultado
      const snips = [
        ...pg.matchAll(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/gi),
        ...pg.matchAll(/<p[^>]*class="[^"]*b_algoSlug[^"]*"[^>]*>([\s\S]*?)<\/p>/gi),
      ].map(m => m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim())
       .filter(s => s.length > 40 && !/cookie|©|privacy|terms|sign in/i.test(s));
      if (snips.length) return snips[0];

      // Extrai qualquer <p> com texto relevante
      const token = campanha.toLowerCase().split(' ')[0];
      const mtoken = marca.toLowerCase().split(' ')[0];
      const ps = [...pg.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim())
        .filter(s => s.length > 50 && (s.toLowerCase().includes(token) || s.toLowerCase().includes(mtoken)));
      if (ps.length) return ps[0];
    }
  } catch {}

  // Fallback: DuckDuckGo HTML
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const r = await ft(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
    });
    if (r.ok) {
      const pg = await r.text();
      const snips = [...pg.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim())
        .filter(s => s.length > 40);
      if (snips.length) return snips[0];
    }
  } catch {}

  return null;
}

// ── Vimeo: título + Bing ──────────────────────────────────
async function getVimeoFallback(d) {
  // Primeiro tenta pegar título do Vimeo para enriquecer a busca
  let extra = '';
  try {
    const r = await ft(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(d.link)}`);
    if (r.ok) {
      const j = await r.json();
      if (j.description && j.description.trim().length > 20) return j.description.trim();
      if (j.title) extra = j.title;
    }
  } catch {}
  return searchSnippet(d.campanha, d.marca, extra);
}

// ── Carrega DATA ──────────────────────────────────────────
let html = readFileSync(HTML, 'utf8');
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);

const noSin = data.filter(d => !d.sinopse || !d.sinopse.trim());
console.log(`Entradas ainda sem sinopse: ${noSin.length}`);

let found = 0;

// Todos os restantes via Bing (Vimeo, YouTube restantes, outros)
console.log('Buscando via Bing/DDG para todos os restantes...');
for (let i = 0; i < noSin.length; i += CONC) {
  const batch = noSin.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    let desc = null;
    if (d.link?.includes('vimeo.com')) {
      desc = await getVimeoFallback(d);
    } else {
      desc = await searchSnippet(d.campanha, d.marca);
    }
    if (desc) {
      d.sinopse = isAlreadyPT(desc) ? desc : await translate(desc);
      found++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC,noSin.length)}/${noSin.length} | encontrados: ${found}`);
}
console.log();

// ── Salva ─────────────────────────────────────────────────
html = html.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);
writeFileSync(HTML, html, 'utf8');

const totalSin = data.filter(d => d.sinopse && d.sinopse.trim()).length;
const stillNone = data.filter(d => !d.sinopse || !d.sinopse.trim()).length;
console.log('\n═══ Resultado ═══');
console.log(`  Novas sinopses encontradas: ${found}`);
console.log(`  Total com sinopse: ${totalSin} / ${data.length} (${(totalSin/data.length*100).toFixed(1)}%)`);
console.log(`  Ainda sem sinopse: ${stillNone}`);
console.log('✓ HTML salvo');
