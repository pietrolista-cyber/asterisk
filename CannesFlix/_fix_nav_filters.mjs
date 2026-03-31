import { readFileSync, writeFileSync } from 'fs';
let html = readFileSync('cannes_cerebro_fixed.html', 'utf8');

// ── 1. Nav: adiciona Premiações como segundo item (ativo) ──
html = html.replace(
  '<a href="cerebro.html" class="nav-link active">Cérebro</a>\n    <a href="insight.html" class="nav-link">Insight</a>',
  '<a href="cerebro.html" class="nav-link">Cérebro</a>\n    <a href="premiacoes.html" class="nav-link active">Premiações</a>\n    <a href="insight.html" class="nav-link">Insight</a>'
);
console.log('Nav atualizada: ✓');

// ── 2. Substitui bloco CSS de filtros ──
const styleStart = html.indexOf('<style>');
const styleEnd   = html.indexOf('</style>');
let css = html.substring(styleStart, styleEnd);

// Remove o bloco antigo de filtros (do comentário até .count-badge final)
const filterCssStart = css.indexOf('/* ── Barra de Filtros ── */');
const filterCssEnd   = css.indexOf('\n.count-badge{', filterCssStart);
const countBadgeEnd  = css.indexOf('}', filterCssEnd + 10) + 1;

const NEW_FILTER_CSS = `/* ── Barra de Filtros ── */
.filters{
  position:sticky;top:244px;z-index:49;
  background:rgba(6,6,14,.8);
  backdrop-filter:var(--blur-m);-webkit-backdrop-filter:var(--blur-m);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:10px 36px;
  display:flex;flex-wrap:nowrap;gap:8px;align-items:center;
  overflow-x:auto;scrollbar-width:none;
}
.filters::-webkit-scrollbar{display:none}

.filter-group{
  display:flex;flex-direction:column;gap:3px;
  flex-shrink:0;position:relative;
}
.filter-group label{
  font-size:8px;font-weight:700;letter-spacing:.15em;
  text-transform:uppercase;
  color:rgba(245,245,247,.35);
  padding-left:10px;white-space:nowrap;
}
.filter-group.has-select::after{
  content:'▾';
  position:absolute;right:10px;bottom:9px;
  font-size:10px;color:rgba(255,255,255,.3);
  pointer-events:none;
}

select,input[type=text]{
  background:rgba(255,255,255,.05);
  color:rgba(245,245,247,.85);
  border:1px solid rgba(255,255,255,.09);
  padding:7px 28px 7px 10px;
  font-family:var(--font);font-size:12px;font-weight:400;
  border-radius:8px;
  appearance:none;-webkit-appearance:none;
  cursor:pointer;
  transition:border-color .2s,background .2s,color .2s;
  outline:none;
  min-width:110px;
}
select:hover,input[type=text]:hover{
  border-color:rgba(255,255,255,.2);
  background:rgba(255,255,255,.08);
  color:#fff;
}
select:focus,input[type=text]:focus{
  border-color:rgba(191,90,242,.45);
  background:rgba(255,255,255,.07);
  color:#fff;
  box-shadow:0 0 0 3px rgba(191,90,242,.1);
}
input[type=text]{min-width:200px;padding-right:12px;}
input[type=text]::placeholder{color:rgba(245,245,247,.25)}

select option{background:#0d0d18;color:#e8e8f0;}
select option:checked{background:#1e1a2e;color:#fff;}

.count-badge{
  margin-left:auto;flex-shrink:0;
  font-size:11px;font-weight:500;letter-spacing:.06em;
  color:rgba(245,245,247,.4);
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);
  padding:6px 16px;border-radius:100px;
  white-space:nowrap;
}`;

css = css.substring(0, filterCssStart) + NEW_FILTER_CSS + css.substring(countBadgeEnd);
html = html.substring(0, styleStart) + css + html.substring(styleEnd);
console.log('CSS filtros substituído: ✓');

// ── 3. Simplifica HTML da filter bar ──
const fbStart = html.indexOf('<div class="filters">');
let depth = 0, i = fbStart, fbEnd = -1;
while (i < html.length) {
  if (html.startsWith('<div', i)) depth++;
  else if (html.startsWith('</div>', i)) { depth--; if (depth === 0) { fbEnd = i + 6; break; } }
  i++;
}
const oldFilterBar = html.substring(fbStart, fbEnd);

const anoOpts   = (oldFilterBar.match(/<select id="f-ano">([\s\S]*?)<\/select>/)   || ['',''])[1];
const segOpts   = (oldFilterBar.match(/<select id="f-segmento">([\s\S]*?)<\/select>/) || ['',''])[1];
const marcaOpts = (oldFilterBar.match(/<select id="f-marca">([\s\S]*?)<\/select>/)  || ['',''])[1];
const tagOpts   = (oldFilterBar.match(/<select id="f-tag">([\s\S]*?)<\/select>/)    || ['',''])[1];

const NEW_FILTER_BAR = `<div class="filters">
  <div class="filter-group">
    <label>Buscar</label>
    <input type="text" id="f-search" placeholder="campanha, marca ou agência...">
  </div>
  <div class="filter-group has-select">
    <label>Ano</label>
    <select id="f-ano">${anoOpts}</select>
  </div>
  <div class="filter-group has-select">
    <label>Segmento</label>
    <select id="f-segmento">${segOpts}</select>
  </div>
  <div class="filter-group has-select">
    <label>Marca</label>
    <select id="f-marca">${marcaOpts}</select>
  </div>
  <div class="filter-group has-select">
    <label>Tag</label>
    <select id="f-tag">${tagOpts}</select>
  </div>
  <div class="count-badge" id="count-badge">— CAMPANHAS</div>
</div>`;

html = html.substring(0, fbStart) + NEW_FILTER_BAR + html.substring(fbEnd);
console.log('HTML filter bar: ✓');

writeFileSync('cannes_cerebro_fixed.html', html, 'utf8');

const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Nav + filtros corrigidos');
