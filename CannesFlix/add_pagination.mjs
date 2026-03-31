import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

// ── 1. CSS da paginação ───────────────────────────────────
const PAGINATION_CSS = `
.pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:28px 36px 40px;position:relative;z-index:1;flex-wrap:wrap}
.pg-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:rgba(245,245,247,.55);font-size:12px;font-weight:500;font-family:var(--font);padding:8px 14px;border-radius:8px;cursor:pointer;transition:all .2s;min-width:38px;text-align:center;letter-spacing:.04em}
.pg-btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#f5f5f7}
.pg-btn.active{background:linear-gradient(135deg,var(--c1),var(--c2));border-color:transparent;color:#fff;font-weight:700;box-shadow:0 0 16px rgba(255,31,142,.3)}
.pg-btn.disabled{opacity:.25;cursor:default;pointer-events:none}
.pg-btn.nav{padding:8px 18px;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.pg-ellipsis{color:rgba(245,245,247,.25);font-size:12px;padding:0 4px}
.pg-info{font-size:11px;color:rgba(245,245,247,.35);letter-spacing:.08em;margin:0 8px}
`;

html = html.replace('</style>', PAGINATION_CSS + '</style>');
console.log('CSS paginação: ✓');

// ── 2. Adiciona div#pagination após o grid ────────────────
html = html.replace(
  '<div class="grid" id="grid"></div>',
  '<div class="grid" id="grid"></div>\n<div class="pagination" id="pagination"></div>'
);
console.log('HTML paginação: ✓');

// ── 3. Substitui a função render() com lógica de paginação ──
const OLD_RENDER = `function render(){const filtered=getFiltered();const grid=document.getElementById('grid');document.getElementById('count-badge').textContent=filtered.length+' CAMPANHAS';grid.innerHTML='';if(!filtered.length){grid.innerHTML='<div class="no-results">— NENHUM RESULTADO —</div>';return;}filtered.forEach(d=>{const card=document.createElement('div');card.className='card';card.onclick=()=>openModal(d);card.innerHTML=\`\${buildCardMedia(d)}<div class="card-body"><div class="card-top"><span class="card-premio \${premioClass(d.premiacao)}">\${d.premiacao}</span><span class="card-ano">\${d.ano}</span></div><div class="card-title">\${d.campanha||'—'}</div><div class="card-meta"><div class="meta-row"><span class="meta-label">Marca</span><span class="meta-value">\${d.marca||'—'}</span></div><div class="meta-row"><span class="meta-label">Agência</span><span class="meta-value">\${d.agencia||'—'}</span></div><div class="meta-row"><span class="meta-label">Categoria</span><span class="meta-value">\${d.categoria||'—'}</span></div></div><span class="segmento-tag">\${d.segmento||'—'}</span></div>\`;card.style.animationDelay=(filtered.indexOf(d)%20*.04)+"s";grid.appendChild(card);});}`;

const NEW_RENDER = `const PER_PAGE=100;
let _page=1;

function render(){
  const filtered=getFiltered();
  const grid=document.getElementById('grid');
  const totalPages=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  if(_page>totalPages)_page=1;
  const start=(_page-1)*PER_PAGE;
  const pageItems=filtered.slice(start,start+PER_PAGE);
  document.getElementById('count-badge').textContent=filtered.length+' CAMPANHAS';
  grid.innerHTML='';
  if(!filtered.length){grid.innerHTML='<div class="no-results">— NENHUM RESULTADO —</div>';document.getElementById('pagination').innerHTML='';return;}
  pageItems.forEach((d,i)=>{
    const card=document.createElement('div');
    card.className='card';
    card.onclick=()=>openModal(d);
    card.innerHTML=\`\${buildCardMedia(d)}<div class="card-body"><div class="card-top"><span class="card-premio \${premioClass(d.premiacao)}">\${d.premiacao}</span><span class="card-ano">\${d.ano}</span></div><div class="card-title">\${d.campanha||'—'}</div><div class="card-meta"><div class="meta-row"><span class="meta-label">Marca</span><span class="meta-value">\${d.marca||'—'}</span></div><div class="meta-row"><span class="meta-label">Agência</span><span class="meta-value">\${d.agencia||'—'}</span></div><div class="meta-row"><span class="meta-label">Categoria</span><span class="meta-value">\${d.categoria||'—'}</span></div></div><span class="segmento-tag">\${d.segmento||'—'}</span></div>\`;
    card.style.animationDelay=(i%20*.04)+"s";
    grid.appendChild(card);
  });
  renderPagination(totalPages,filtered.length);
}

function goToPage(p){
  _page=p;
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderPagination(total,count){
  const pg=document.getElementById('pagination');
  if(total<=1){pg.innerHTML='';return;}
  const show=[];
  show.push(1);
  if(_page>4)show.push('...');
  for(let i=Math.max(2,_page-2);i<=Math.min(total-1,_page+2);i++)show.push(i);
  if(_page<total-3)show.push('...');
  if(total>1)show.push(total);
  let out='';
  out+=\`<button class="pg-btn nav\${_page===1?' disabled':''}" onclick="goToPage(\${_page-1})">← ANT</button>\`;
  show.forEach(s=>{
    if(s==='...')out+=\`<span class="pg-ellipsis">…</span>\`;
    else out+=\`<button class="pg-btn\${s===_page?' active':''}" onclick="goToPage(\${s})">\${s}</button>\`;
  });
  out+=\`<button class="pg-btn nav\${_page===total?' disabled':''}" onclick="goToPage(\${_page+1})">PRÓX →</button>\`;
  out+=\`<span class="pg-info">\${(_page-1)*PER_PAGE+1}–\${Math.min(_page*PER_PAGE,count)} de \${count}</span>\`;
  pg.innerHTML=out;
}`;

if (html.includes(OLD_RENDER)) {
  html = html.replace(OLD_RENDER, NEW_RENDER);
  console.log('render() com paginação: ✓');
} else {
  console.error('render() não encontrado — verificar âncora');
  process.exit(1);
}

// ── 4. Reset página ao mudar filtros ─────────────────────
// Substitui os event listeners para resetar _page=1 ao filtrar
html = html.replace(
  `['f-premiacao','f-ano','f-segmento','f-marca','f-search'].forEach(id=>{document.getElementById(id).addEventListener('input',render);document.getElementById(id).addEventListener('change',render);});`,
  `['f-premiacao','f-ano','f-segmento','f-marca','f-search'].forEach(id=>{document.getElementById(id).addEventListener('input',()=>{_page=1;render();});document.getElementById(id).addEventListener('change',()=>{_page=1;render();});});`
);
console.log('Event listeners com reset de página: ✓');

// ── 5. Reset _page no setTagFilter também ────────────────
html = html.replace(
  'function setTagFilter(tag) {\n  _activeTag = tag;',
  'function setTagFilter(tag) {\n  _activeTag = tag;\n  _page = 1;'
);
console.log('setTagFilter reset de página: ✓');

writeFileSync(HTML, html, 'utf8');

// Verificação final JS
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const initPart = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Paginação aplicada — 100 cards por página');
