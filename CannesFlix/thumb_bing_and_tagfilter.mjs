/**
 * thumb_bing_and_tagfilter.mjs
 * 1. Busca thumbnails no Bing Images para entradas ainda sem thumbnail
 * 2. Adiciona filtro de tags ao HTML
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML  = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONC  = 10;
const TO    = 12000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

// ── 1. Carrega HTML e DATA ────────────────────────────────
let html = readFileSync(HTML, 'utf8');
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);

// ── 2. Bing Images para entradas sem thumbnail ────────────
async function fetchBingImage(campanha, marca) {
  const query = `${campanha} ${marca} cannes advertisement campaign`;
  const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&first=1';
  try {
    const r = await ft(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html' }
    });
    if (!r.ok) return null;
    const pg = await r.text();
    const murls = [...pg.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g)].map(m => m[1]);
    // Filtra imagens de tracking, logos, ícones
    const valid = murls.filter(u =>
      !u.includes('logo') && !u.includes('icon') && !u.includes('favicon')
      && !u.includes('1x1') && !u.includes('pixel') && !u.includes('tracking')
      && /\.(jpe?g|png|webp|gif)/i.test(u)
    );
    return valid[0] || murls[0] || null;
  } catch { return null; }
}

const noThumb = data.filter(d => !d.thumbnail || !d.thumbnail.trim());
console.log(`Entradas sem thumbnail: ${noThumb.length}`);

let found = 0;
for (let i = 0; i < noThumb.length; i += CONC) {
  const batch = noThumb.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const img = await fetchBingImage(d.campanha, d.marca);
    if (img) { d.thumbnail = img; found++; }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC, noThumb.length)}/${noThumb.length} | encontrados: ${found}`);
}
console.log(`\nThumbnails Bing: ${found}`);

// ── 3. Salva DATA atualizado ──────────────────────────────
html = html.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);

// ── 4. Coleta tags válidas (frequência ≥ 5, sem lixo) ────
const BLACKLIST = new Set([
  'aproveite','vídeos','músicas','você','envie','compartilhe','conteúdo',
  'campaign','people','world','creative','advertising','their','this','that',
  'with','your','have','they','from','brand','more','into','what','about',
  'outros','other','video','videos','music','share','and','the','for','are',
  'não','uma','was','new','how','can','all','has','its','been','also',
  'will','our','who','its','but','than','first','time','when','were',
  'meio','como','muito','mais','como','cada','para','pelo','pela',
  'use','get','two','one','like','make','see','her','his','him',
  'which','some','out','had','use','she','him','their','there',
  'through','just','because','came','come','during','each','few',
  'por','as','ao','da','de','do','em','na','no','se','um','os','as',
]);

const tagCounts = {};
for (const d of data) {
  if (!d.tags) continue;
  for (const t of d.tags.split(',').map(t => t.trim()).filter(Boolean)) {
    const lower = t.toLowerCase();
    if (BLACKLIST.has(lower)) continue;
    if (t.length < 3) continue;
    if (/^\d+$/.test(t)) continue; // só números
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  }
}

const validTags = Object.entries(tagCounts)
  .filter(([t, c]) => c >= 5)
  .sort((a, b) => b[1] - a[1])
  .map(([t]) => t);

console.log(`\nTags válidas (≥5 ocorrências): ${validTags.length}`);
console.log('Top 20:', validTags.slice(0, 20).join(', '));

// ── 5. Adiciona CSS para o filtro de tags ─────────────────
const tagCSS = `
  .tag-filter-bar{background:#111;padding:10px 32px;display:flex;gap:8px;overflow-x:auto;border-bottom:1px solid #222;scrollbar-width:thin;scrollbar-color:#333 #111;flex-wrap:nowrap;align-items:center;position:sticky;top:57px;z-index:9}
  .tag-filter-bar::-webkit-scrollbar{height:4px}
  .tag-filter-bar::-webkit-scrollbar-track{background:#111}
  .tag-filter-bar::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
  .tag-filter-label{font-size:9px;color:#555;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;margin-right:4px;flex-shrink:0}
  .tag-pill{background:transparent;color:#666;border:1px solid #2a2a2a;font-size:9px;padding:4px 10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Courier New',monospace;transition:all .15s}
  .tag-pill:hover{border-color:#FF1F8E;color:#FF1F8E}
  .tag-pill.active{background:#FF1F8E;color:#000;border-color:#FF1F8E;font-weight:bold}
  .tag-clear{background:transparent;color:#444;border:1px solid #222;font-size:9px;padding:4px 10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Courier New',monospace}
  .tag-clear:hover{color:#fff;border-color:#555}
`;

// Insere CSS antes do fechamento do </style>
const styleEnd = html.lastIndexOf('</style>');
html = html.substring(0, styleEnd) + tagCSS + html.substring(styleEnd);
console.log('CSS de tags adicionado');

// ── 6. Adiciona a barra de tags no HTML ───────────────────
const tagPillsHTML = validTags.map(t =>
  `<button class="tag-pill" onclick="setTagFilter('${t.replace(/'/g,"\\'")}')">` +
  `${t} <span style="opacity:.5;font-size:8px">(${tagCounts[t]})</span></button>`
).join('');

const tagBarHTML = `
<div class="tag-filter-bar" id="tag-filter-bar">
  <span class="tag-filter-label">▸ TAGS</span>
  <button class="tag-clear" onclick="setTagFilter(null)" id="tag-clear-btn">✕ LIMPAR</button>
  ${tagPillsHTML}
</div>`;

// Insere após o <div class="filters">...</div> (antes de <div class="grid")
const gridMarker = '<div class="grid" id="grid"></div>';
html = html.replace(gridMarker, tagBarHTML + '\n' + gridMarker);
console.log('Barra de tags adicionada ao HTML');

// ── 7. Adiciona JS para o filtro de tags ─────────────────
const tagFilterJS = `
let _activeTag = null;
function setTagFilter(tag) {
  _activeTag = tag;
  document.querySelectorAll('.tag-pill').forEach(p => {
    p.classList.toggle('active', p.textContent.trim().startsWith(tag || '__none__'));
  });
  if (tag) {
    document.querySelectorAll('.tag-pill').forEach(p => {
      const label = p.getAttribute('onclick').match(/setTagFilter\\('([^']+)'/)?.[1];
      p.classList.toggle('active', label === tag);
    });
  } else {
    document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  }
  render();
}
`;

// Atualiza getFiltered para incluir filtro de tag
const oldGetFiltered = `function getFiltered(){const p=document.getElementById('f-premiacao').value,a=document.getElementById('f-ano').value,s=document.getElementById('f-segmento').value,m=document.getElementById('f-marca').value,q=document.getElementById('f-search').value.toLowerCase();return DATA.filter(d=>(!p||d.premiacao===p)&&(!a||d.ano===a)&&(!s||d.segmento===s)&&(!m||d.marca===m)&&(!q||d.campanha.toLowerCase().includes(q)||(d.agencia||'').toLowerCase().includes(q)));}`;

const newGetFiltered = `function getFiltered(){const p=document.getElementById('f-premiacao').value,a=document.getElementById('f-ano').value,s=document.getElementById('f-segmento').value,m=document.getElementById('f-marca').value,q=document.getElementById('f-search').value.toLowerCase();return DATA.filter(d=>(!p||d.premiacao===p)&&(!a||d.ano===a)&&(!s||d.segmento===s)&&(!m||d.marca===m)&&(!q||d.campanha.toLowerCase().includes(q)||(d.agencia||'').toLowerCase().includes(q))&&(!_activeTag||(d.tags&&d.tags.split(',').map(t=>t.trim()).includes(_activeTag))));}`;

if (html.includes(oldGetFiltered)) {
  html = html.replace(oldGetFiltered, tagFilterJS + newGetFiltered);
  console.log('getFiltered atualizado com filtro de tags');
} else {
  console.warn('getFiltered não encontrado — tentando patch parcial');
  // Patch parcial: adiciona verificação de tag no final do filter
  html = html.replace(
    /return DATA\.filter\(d=>\(([^)]+)\)&&\(!q\|[^)]+\)\);/,
    `return DATA.filter(d=>($1)&&(!q||d.campanha.toLowerCase().includes(q)||(d.agencia||'').toLowerCase().includes(q))&&(!_activeTag||(d.tags&&d.tags.split(',').map(t=>t.trim()).includes(_activeTag))));`
  );
  html = html.replace('function getFiltered(){', tagFilterJS + 'function getFiltered(){');
  console.log('getFiltered patch parcial aplicado');
}

// ── 8. Salva HTML final ───────────────────────────────────
writeFileSync(HTML, html, 'utf8');

const total = data.filter(d => d.thumbnail).length;
const sem   = data.filter(d => !d.thumbnail).length;
console.log(`\n═══ Resumo ═══`);
console.log(`  Com thumbnail: ${total} / ${data.length}`);
console.log(`  Sem thumbnail: ${sem}`);
console.log(`  Tags no filtro: ${validTags.length}`);
console.log('✓ HTML salvo');
