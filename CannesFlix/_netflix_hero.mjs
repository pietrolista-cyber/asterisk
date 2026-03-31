import { readFileSync, writeFileSync } from 'fs';
let html = readFileSync('cannes_cerebro_fixed.html', 'utf8');

// ── 1. CSS do hero Netflix ──
const HERO_CSS = `
/* ── Hero Netflix ── */
.hero{
  position:relative;
  width:100%;
  height:68vh;min-height:420px;max-height:680px;
  overflow:hidden;
  display:flex;align-items:flex-end;
}

.hero-bg{
  position:absolute;inset:0;
  background-size:cover;background-position:center top;
  transform:scale(1.06);
  transition:background-image .7s ease, opacity .5s ease;
  filter:brightness(.55) saturate(1.1);
  will-change:transform;
}

.hero-noise{
  position:absolute;inset:0;
  background:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events:none;z-index:1;
}

.hero-grad{
  position:absolute;inset:0;
  background:
    linear-gradient(to top, rgba(5,5,14,1) 0%, rgba(5,5,14,.7) 28%, rgba(5,5,14,.15) 60%, transparent 100%),
    linear-gradient(to right, rgba(5,5,14,.7) 0%, rgba(5,5,14,.1) 50%, transparent 100%);
  z-index:2;
}

.hero-content{
  position:relative;z-index:3;
  padding:0 56px 52px;
  max-width:680px;
  display:flex;flex-direction:column;gap:14px;
}

.hero-tags{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
}
.hero-premio-badge{
  font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  padding:4px 12px;border-radius:100px;
}
.hero-premio-badge.gp    {background:linear-gradient(135deg,#bf5af2,#ff1f8e);color:#fff;}
.hero-premio-badge.ouro  {background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;}
.hero-premio-badge.prata {background:linear-gradient(135deg,#94a3b8,#64748b);color:#fff;}
.hero-premio-badge.bronze{background:linear-gradient(135deg,#b45309,#92400e);color:#fff;}

.hero-ano-tag{
  font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(245,245,247,.5);
  border:1px solid rgba(255,255,255,.15);
  padding:3px 10px;border-radius:100px;
}
.hero-seg-tag{
  font-size:10px;font-weight:500;letter-spacing:.08em;
  color:rgba(245,245,247,.4);
}

.hero-title{
  font-size:clamp(28px,4.5vw,56px);
  font-weight:700;
  color:#fff;
  line-height:1.1;
  letter-spacing:-.01em;
  margin:0;
  text-shadow:0 2px 24px rgba(0,0,0,.6);
}

.hero-brand{
  font-size:13px;font-weight:500;
  color:rgba(245,245,247,.6);
  letter-spacing:.04em;
}
.hero-brand strong{color:rgba(245,245,247,.9);}

.hero-synopsis{
  font-size:13px;line-height:1.6;
  color:rgba(245,245,247,.55);
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
  max-width:540px;
  margin:0;
}

.hero-actions{
  display:flex;gap:12px;align-items:center;margin-top:4px;
}

.hero-btn-play{
  display:flex;align-items:center;gap:8px;
  background:#fff;color:#000;
  border:none;border-radius:8px;
  padding:11px 26px;
  font-family:var(--font);font-size:13px;font-weight:700;letter-spacing:.04em;
  cursor:pointer;transition:all .2s;
  flex-shrink:0;
}
.hero-btn-play:hover{background:rgba(255,255,255,.82);transform:scale(1.03);}
.hero-btn-play svg{width:16px;height:16px;flex-shrink:0;}

.hero-btn-info{
  display:flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.15);color:#fff;
  border:1px solid rgba(255,255,255,.2);border-radius:8px;
  padding:11px 22px;
  font-family:var(--font);font-size:13px;font-weight:600;letter-spacing:.04em;
  cursor:pointer;transition:all .2s;
  flex-shrink:0;
  backdrop-filter:blur(8px);
}
.hero-btn-info:hover{background:rgba(255,255,255,.22);transform:scale(1.03);}

.hero-fade-out{opacity:0;transition:opacity .35s ease;}
.hero-fade-in {opacity:1;transition:opacity .35s ease;}

/* Indicadores de posição (dots) */
.hero-dots{
  position:absolute;right:56px;bottom:52px;z-index:3;
  display:flex;gap:6px;align-items:center;
}
.hero-dot{
  width:4px;height:4px;border-radius:100px;
  background:rgba(255,255,255,.3);
  transition:all .3s;cursor:pointer;
}
.hero-dot.active{
  width:20px;background:#fff;
}
`;

html = html.replace('</style>', HERO_CSS + '</style>');
console.log('CSS hero: ✓');

// ── 2. HTML do hero (antes do grid) ──
const HERO_HTML = `<div class="hero" id="hero-section">
  <div class="hero-bg" id="hero-bg"></div>
  <div class="hero-noise"></div>
  <div class="hero-grad"></div>
  <div class="hero-content" id="hero-content">
    <div class="hero-tags" id="hero-tags"></div>
    <h2 class="hero-title" id="hero-title"></h2>
    <div class="hero-brand" id="hero-brand"></div>
    <p class="hero-synopsis" id="hero-synopsis"></p>
    <div class="hero-actions" id="hero-actions"></div>
  </div>
  <div class="hero-dots" id="hero-dots"></div>
</div>
`;

html = html.replace('<div class="grid" id="grid"></div>', HERO_HTML + '<div class="grid" id="grid"></div>');
console.log('HTML hero: ✓');

// ── 3. JS: updateHero() e integração com render() ──
const PREMIO_CLS = {
  'Grand Prix':     'gp',
  'Leão de Ouro':   'ouro',
  'Leão de Prata':  'prata',
  'Leão de Bronze': 'bronze',
};
const PREMIO_EMOJI = {
  'Grand Prix':     '🏆',
  'Leão de Ouro':   '🥇',
  'Leão de Prata':  '🥈',
  'Leão de Bronze': '🥉',
};

const HERO_JS = `
/* ── Hero Netflix ── */
let _heroItems = [];
let _heroIdx   = 0;
let _heroTimer = null;

function updateHero(items) {
  if (!items || !items.length) return;
  // Pega até 5 destaques: prefere Grand Prix e Ouro com thumbnail
  const withThumb = items.filter(d => d.thumbnail);
  const featured  = [
    ...withThumb.filter(d => d.premiacao === 'Grand Prix').slice(0,2),
    ...withThumb.filter(d => d.premiacao === 'Leão de Ouro').slice(0,2),
    ...withThumb.filter(d => d.premiacao === 'Leão de Prata').slice(0,1),
  ].slice(0,5);
  _heroItems = featured.length ? featured : withThumb.slice(0,5);
  _heroIdx   = 0;
  clearInterval(_heroTimer);
  if (_heroItems.length > 1) {
    _heroTimer = setInterval(() => { _heroIdx = (_heroIdx+1) % _heroItems.length; renderHeroSlide(); }, 7000);
  }
  renderHeroDots();
  renderHeroSlide();
}

function renderHeroDots() {
  const dots = document.getElementById('hero-dots');
  if (!dots || _heroItems.length <= 1) { if(dots) dots.innerHTML=''; return; }
  dots.innerHTML = _heroItems.map((_,i) =>
    '<div class="hero-dot'+(i===_heroIdx?' active':'')+'" onclick="heroGoto('+i+')"></div>'
  ).join('');
}

function heroGoto(idx) {
  _heroIdx = idx;
  clearInterval(_heroTimer);
  if (_heroItems.length > 1) {
    _heroTimer = setInterval(() => { _heroIdx = (_heroIdx+1) % _heroItems.length; renderHeroSlide(); }, 7000);
  }
  renderHeroSlide();
}

function renderHeroSlide() {
  const d = _heroItems[_heroIdx];
  if (!d) return;

  const PCLS  = {'Grand Prix':'gp','Leão de Ouro':'ouro','Leão de Prata':'prata','Leão de Bronze':'bronze'};
  const PEMOJI= {'Grand Prix':'🏆','Leão de Ouro':'🥇','Leão de Prata':'🥈','Leão de Bronze':'🥉'};

  const bg      = document.getElementById('hero-bg');
  const title   = document.getElementById('hero-title');
  const brand   = document.getElementById('hero-brand');
  const synopsis= document.getElementById('hero-synopsis');
  const tags    = document.getElementById('hero-tags');
  const actions = document.getElementById('hero-actions');
  const dots    = document.getElementById('hero-dots');

  // Fade out
  const content = document.getElementById('hero-content');
  content.style.opacity = '0';
  content.style.transition = 'opacity .3s';

  setTimeout(() => {
    if (d.thumbnail) bg.style.backgroundImage = 'url(' + d.thumbnail + ')';

    tags.innerHTML =
      '<span class="hero-premio-badge '+(PCLS[d.premiacao]||'gp')+'">'+(PEMOJI[d.premiacao]||'✦')+' '+d.premiacao+'</span>' +
      '<span class="hero-ano-tag">'+d.ano+'</span>' +
      (d.segmento ? '<span class="hero-seg-tag">'+d.segmento+'</span>' : '');

    title.textContent = d.campanha || '';
    brand.innerHTML   = (d.marca ? '<strong>'+d.marca+'</strong>' : '') +
                        (d.marca && d.agencia ? ' &nbsp;·&nbsp; ' : '') +
                        (d.agencia || '');
    synopsis.textContent = d.sinopse || d.categoria || '';

    const hasVideo = d.video_embed || (d.link && d.link.includes('youtube')) || (d.link && d.link.includes('vimeo'));
    actions.innerHTML =
      (hasVideo ? '<button class="hero-btn-play" onclick="heroPlay('+_heroItems.indexOf(d)+')"><svg viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 15,8 3,15"/></svg>Assistir</button>' : '') +
      '<button class="hero-btn-info" onclick="openModal(_heroItems['+_heroItems.indexOf(d)+'])">ℹ Mais Info</button>';

    // Fade in
    content.style.opacity = '1';

    // Atualiza dots
    if (dots) {
      [...dots.querySelectorAll('.hero-dot')].forEach((el,i) => el.classList.toggle('active', i===_heroIdx));
    }
  }, 300);
}

function heroPlay(idx) {
  const d = _heroItems[idx];
  if (!d) return;
  openModal(d);
}
`;

// Insere antes do render()
html = html.replace('function render(){', HERO_JS + '\nfunction render(){');
console.log('JS hero: ✓');

// ── 4. Integra updateHero no render() — chama após calcular filtered ──
html = html.replace(
  'function render(){\n  const filtered=getFiltered();\n  const grid=document.getElementById(\'grid\');',
  'function render(){\n  const filtered=getFiltered();\n  const grid=document.getElementById(\'grid\');\n  updateHero(filtered);'
);
console.log('render() integrado com hero: ✓');

writeFileSync('cannes_cerebro_fixed.html', html, 'utf8');

// Verifica JS
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Efeito Netflix aplicado');
