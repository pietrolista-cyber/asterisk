import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

// ── 1. CSS ────────────────────────────────────────────────
const NEW_CSS = `
/* ── Barra de Premiação ── */
.premio-bar{
  position:sticky;top:247px;z-index:48;
  background:rgba(0,0,0,.42);
  backdrop-filter:blur(16px) saturate(160%);
  -webkit-backdrop-filter:blur(16px) saturate(160%);
  border-bottom:1px solid rgba(255,255,255,.09);
  padding:10px 36px;
  display:flex;gap:8px;align-items:center;
  overflow-x:auto;flex-wrap:nowrap;
  scrollbar-width:none;
}
.premio-bar::-webkit-scrollbar{display:none}

.premio-bar-label{
  font-size:8.5px;font-weight:600;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(245,245,247,.3);
  white-space:nowrap;margin-right:4px;flex-shrink:0;
}

.premio-pill{
  display:flex;align-items:center;gap:7px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  border-radius:100px;
  padding:7px 16px;
  font-size:12px;font-weight:500;
  font-family:var(--font);
  color:rgba(245,245,247,.5);
  cursor:pointer;white-space:nowrap;flex-shrink:0;
  transition:all .22s;
}
.premio-pill .emoji{font-size:16px;line-height:1}
.premio-pill .label{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.premio-pill .cnt{font-size:9px;opacity:.45;font-weight:400}

.premio-pill:hover{
  border-color:rgba(255,255,255,.22);
  color:rgba(245,245,247,.9);
  background:rgba(255,255,255,.08);
  transform:translateY(-1px);
}

.premio-pill.active{color:#fff;border-color:transparent;transform:translateY(-1px)}
.premio-pill.p-all.active       {background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
.premio-pill.p-gp.active        {background:linear-gradient(135deg,#bf5af2,#ff1f8e);box-shadow:0 0 20px rgba(191,90,242,.35)}
.premio-pill.p-ouro.active      {background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 0 20px rgba(245,158,11,.35)}
.premio-pill.p-prata.active     {background:linear-gradient(135deg,#94a3b8,#64748b);box-shadow:0 0 16px rgba(148,163,184,.25)}
.premio-pill.p-bronze.active    {background:linear-gradient(135deg,#b45309,#92400e);box-shadow:0 0 16px rgba(180,83,9,.3)}
`;

html = html.replace('</style>', NEW_CSS + '</style>');
console.log('CSS premiação bar: ✓');

// ── 2. Remove a barra de tags antiga e substitui pela de premiação ──
// Extrai contagem de premiações do DATA
const dataStart = html.indexOf('const DATA=[') + 'const DATA='.length;
const dataEnd   = html.indexOf('const PLAY_SVG=');
const raw  = html.substring(dataStart, dataEnd).trim().replace(/;$/, '');
const data = JSON.parse(raw);

const premioCount = {};
data.forEach(d => { if(d.premiacao) premioCount[d.premiacao] = (premioCount[d.premiacao]||0)+1; });
const total = data.length;

const EMOJI_MAP = {
  'Grand Prix':    { emoji: '🏆', cls: 'p-gp' },
  'Leão de Ouro':  { emoji: '🥇', cls: 'p-ouro' },
  'Leão de Prata': { emoji: '🥈', cls: 'p-prata' },
  'Leão de Bronze':{ emoji: '🥉', cls: 'p-bronze' },
};

const PREMIO_PILLS = Object.entries(EMOJI_MAP).map(([name, { emoji, cls }]) => {
  const cnt = premioCount[name] || 0;
  return `<button class="premio-pill ${cls}" onclick="setPremioFilter('${name}')">
    <span class="emoji">${emoji}</span>
    <span class="label">${name}</span>
    <span class="cnt">${cnt}</span>
  </button>`;
}).join('');

const NEW_BAR = `<div class="premio-bar" id="premio-bar">
  <span class="premio-bar-label">PREMIAÇÃO</span>
  <button class="premio-pill p-all active" onclick="setPremioFilter(null)">
    <span class="emoji">✦</span>
    <span class="label">Todas</span>
    <span class="cnt">${total}</span>
  </button>
  ${PREMIO_PILLS}
</div>`;

// Remove a tag-filter-bar antiga (tudo entre as marcações)
const tagBarStart = html.indexOf('<div class="tag-filter-bar"');
const tagBarEnd   = html.indexOf('</div>', tagBarStart) + 6;
html = html.substring(0, tagBarStart) + NEW_BAR + html.substring(tagBarEnd);
console.log('Barra de premiação inserida: ✓');

// ── 3. Remove f-premiacao do filter bar e adiciona f-tag ──
// Remove o grupo de Premiação
html = html.replace(
  `<div class="filter-group"><label>Premiação</label><select id="f-premiacao"><option value="">TODAS</option></select></div>`,
  ``
);

// Adiciona select de Tags antes do campo Buscar
const BLACKLIST = new Set([
  'aproveite','vídeos','músicas','você','envie','compartilhe','conteúdo',
  'campaign','people','world','creative','advertising','their','this','that',
  'with','your','have','they','from','brand','more','into','what','about',
  'outros','other','video','videos','music','share','and','the','for','are',
  'não','uma','was','new','how','can','all','has','its','been','also',
  'will','our','who','but','than','first','time','when','were','meio',
  'por','as','ao','da','de','do','em','na','no','se','um','os',
  'use','get','two','one','like','make','see','her','his','him',
]);

const tagCounts = {};
data.forEach(d => {
  if (!d.tags) return;
  d.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
    if (BLACKLIST.has(t.toLowerCase()) || t.length < 3 || /^\d+$/.test(t)) return;
    tagCounts[t] = (tagCounts[t]||0)+1;
  });
});

const validTags = Object.entries(tagCounts)
  .filter(([, c]) => c >= 5)
  .sort((a, b) => b[1] - a[1])
  .map(([t]) => t);

const TAG_OPTIONS = validTags.map(t =>
  `<option value="${t}">${t} (${tagCounts[t]})</option>`
).join('');

const TAG_SELECT_GROUP = `<div class="filter-group"><label>Tag</label><select id="f-tag"><option value="">TODAS</option>${TAG_OPTIONS}</select></div>`;

html = html.replace(
  `<div class="filter-group"><label>Buscar</label>`,
  TAG_SELECT_GROUP + `\n  <div class="filter-group"><label>Buscar</label>`
);
console.log(`Tags select (${validTags.length} tags): ✓`);

// ── 4. Atualiza getFiltered() ─────────────────────────────
// Adiciona filtros de _activePremio e f-tag
const OLD_GF = `function getFiltered(){const p=document.getElementById('f-premiacao').value,a=document.getElementById('f-ano').value,s=document.getElementById('f-segmento').value,m=document.getElementById('f-marca').value,q=document.getElementById('f-search').value.toLowerCase();return DATA.filter(d=>(!p||d.premiacao===p)&&(!a||d.ano===a)&&(!s||d.segmento===s)&&(!m||d.marca===m)&&(!q||d.campanha.toLowerCase().includes(q)||(d.agencia||'').toLowerCase().includes(q))&&(!_activeTag||(d.tags&&d.tags.split(',').map(t=>t.trim()).includes(_activeTag))));}`;

const NEW_GF = `function getFiltered(){const a=document.getElementById('f-ano').value,s=document.getElementById('f-segmento').value,m=document.getElementById('f-marca').value,q=document.getElementById('f-search').value.toLowerCase(),tg=document.getElementById('f-tag').value;return DATA.filter(d=>(!_activePremio||d.premiacao===_activePremio)&&(!a||d.ano===a)&&(!s||d.segmento===s)&&(!m||d.marca===m)&&(!q||d.campanha.toLowerCase().includes(q)||(d.agencia||'').toLowerCase().includes(q))&&(!tg||(d.tags&&d.tags.split(',').map(t=>t.trim()).includes(tg))));}`;

if (html.includes(OLD_GF)) {
  html = html.replace(OLD_GF, NEW_GF);
  console.log('getFiltered() atualizado: ✓');
} else {
  console.warn('getFiltered() âncora não encontrada — patch parcial');
}

// ── 5. Substitui setTagFilter → setPremioFilter ───────────
// Remove a variável _activeTag e função setTagFilter antigas
// Adiciona _activePremio e setPremioFilter
const OLD_TAG_JS = `let _activeTag = null;
function setTagFilter(tag) {
  _activeTag = tag;
  _page = 1;
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
}`;

const NEW_PREMIO_JS = `let _activePremio = null;
function setPremioFilter(premio) {
  _activePremio = premio;
  _page = 1;
  document.querySelectorAll('.premio-pill').forEach(p => p.classList.remove('active'));
  if (premio) {
    const btn = [...document.querySelectorAll('.premio-pill')].find(p => {
      const m = p.getAttribute('onclick').match(/setPremioFilter\\('([^']+)'/);
      return m && m[1] === premio;
    });
    if (btn) btn.classList.add('active');
  } else {
    const all = document.querySelector('.premio-pill.p-all');
    if (all) all.classList.add('active');
  }
  render();
}`;

if (html.includes(OLD_TAG_JS)) {
  html = html.replace(OLD_TAG_JS, NEW_PREMIO_JS);
  console.log('setTagFilter → setPremioFilter: ✓');
} else {
  // fallback: adiciona antes do render()
  html = html.replace('let _activeTag = null;', '');
  html = html.replace(/function setTagFilter[\s\S]*?render\(\);\s*\}/, '');
  html = html.replace('render();\n\n// Ajusta top', NEW_PREMIO_JS + '\nrender();\n\n// Ajusta top');
  console.log('setPremioFilter (fallback): ✓');
}

// ── 6. Atualiza event listeners — remove f-premiacao, adiciona f-tag ──
html = html.replace(
  `['f-premiacao','f-ano','f-segmento','f-marca','f-search'].forEach(id=>{document.getElementById(id).addEventListener('input',()=>{_page=1;render();});document.getElementById(id).addEventListener('change',()=>{_page=1;render();});});`,
  `['f-ano','f-segmento','f-marca','f-tag','f-search'].forEach(id=>{document.getElementById(id).addEventListener('input',()=>{_page=1;render();});document.getElementById(id).addEventListener('change',()=>{_page=1;render();});});`
);
console.log('Event listeners: ✓');

// ── 7. Ajusta sticky top da barra de premiação dinamicamente ──
html = html.replace(
  /function adjustTagBarTop\(\)\{[\s\S]*?\}/,
  `function adjustTagBarTop(){
  const hdr=document.querySelector('header');
  const fbar=document.querySelector('.filters');
  const pbar=document.getElementById('premio-bar');
  if(hdr&&fbar&&pbar){pbar.style.top=(hdr.offsetHeight+fbar.offsetHeight)+'px';}
}`
);
console.log('adjustTagBarTop → premio-bar: ✓');

// ── 8. Popula o f-premiacao foi removido, ajusta populateFilter ──
html = html.replace(
  `populateFilter('f-premiacao','premiacao');populateFilter('f-ano','ano');`,
  `populateFilter('f-ano','ano');`
);
console.log('populateFilter ajustado: ✓');

// ── 9. Remove referências antigas ao tag-filter-bar no adjustTagBarTop ──

// ── Salva ─────────────────────────────────────────────────
writeFileSync(HTML, html, 'utf8');

// Verificação JS
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Concluído — premiação com emoji na barra, tags como select');
