import { readFileSync, writeFileSync } from 'fs';

const PATH = 'C:/Users/pietr/Cerebro/CannesFlix/cannes_cerebro_fixed.html';
let html = readFileSync(PATH, 'utf8');

// ── 1. Adiciona variáveis de glow ao :root ──
html = html.replace(
  '--blur-s: blur(20px) saturate(180%);',
  '--blur-s: blur(20px) saturate(180%);\n            --glow-c1: 0 0 0 1px rgba(255,31,142,.7), 0 0 32px rgba(255,31,142,.4), 0 0 64px rgba(191,90,242,.25), 0 32px 72px rgba(0,0,0,.6);\n            --glow-c2: 0 0 0 1px rgba(191,90,242,.75), 0 0 32px rgba(191,90,242,.45), 0 0 64px rgba(10,132,255,.3), 0 32px 72px rgba(0,0,0,.6);\n            --glow-c3: 0 0 0 1px rgba(10,132,255,.8), 0 0 32px rgba(10,132,255,.5), 0 0 64px rgba(100,210,255,.35), 0 32px 72px rgba(0,0,0,.6);'
);
console.log('Variáveis glow: ✓');

// ── 2. Substitui todo o bloco CSS da navbar ──
const styleStart = html.indexOf('<style>');
const styleEnd   = html.indexOf('</style>');
let css = html.substring(styleStart, styleEnd);

// Localiza e remove o bloco antigo da nav (de .global-nav até .nav-divider incluído)
const navStart = css.indexOf('\n/* ── Navbar global ── */');
const navEnd   = css.indexOf('\n.nav-login:hover{', navStart);
const navEnd2  = css.indexOf('}', navEnd) + 1;

const NEW_NAV_CSS = `
/* ── Navbar global — Chromatic Animated ── */
.global-nav{
  position:sticky;top:0;z-index:55;
  height:52px;
  background:rgba(4,4,12,.9);
  backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);
  border-bottom:1px solid var(--border-h);
  display:flex;align-items:center;
  padding:0 56px;gap:0;
  box-shadow:var(--glow-c3);
}
.nav-links{display:flex;align-items:center;gap:4px;flex:1;}

.nav-link{
  font-family:var(--font);
  font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(245,245,247,.45);
  text-decoration:none;
  padding:8px 18px;border-radius:12px;
  transition:all .25s cubic-bezier(.34,1.56,.64,1);
  white-space:nowrap;position:relative;overflow:hidden;
}
.nav-link::before{
  content:"";position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,var(--c1),var(--c2),var(--c3),transparent);
  background-size:300% 100%;
  opacity:0;transition:opacity .4s;
}
.nav-link:hover{
  color:#fff;
  background:rgba(255,255,255,.1);
  box-shadow:var(--glow-c1);
  transform:translateY(-2px);
}
.nav-link:hover::before{opacity:.15;animation:shimmer 1.5s infinite;}
.nav-link.active{
  color:#fff !important;
  background:linear-gradient(135deg,var(--c1),var(--c2));
  box-shadow:var(--glow-c1);
  font-weight:700;
  text-shadow:0 0 20px rgba(255,31,142,.6);
}

.nav-login{
  font-family:var(--font);
  font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
  color:#fff;text-decoration:none;
  padding:8px 24px;
  border:1.5px solid transparent;
  background:linear-gradient(var(--bg),var(--bg)) padding-box,
             linear-gradient(135deg,var(--c1),var(--c2),var(--c3)) border-box;
  border-radius:100px;
  transition:all .3s;
}
.nav-login:hover{
  transform:scale(1.05) translateY(-2px);
  box-shadow:var(--glow-c2);
  filter:drop-shadow(0 8px 32px rgba(191,90,242,.4));
}
.nav-divider{
  width:1px;height:20px;
  background:linear-gradient(180deg,transparent,rgba(255,255,255,.3),transparent);
  margin:0 16px;
}`;

css = css.substring(0, navStart) + NEW_NAV_CSS + css.substring(navEnd2);
html = html.substring(0, styleStart) + css + html.substring(styleEnd);
console.log('CSS navbar animada: ✓');

// ── 3. Ajusta sticky top do header e filters para nova altura 52px ──
html = html.replace('top:44px;z-index:50;', 'top:52px;z-index:50;');
html = html.replace('top:244px;z-index:49;', 'top:252px;z-index:49;');
// Premio bar: ajusta o cálculo dinâmico (já é feito por adjustTagBarTop)
console.log('Sticky tops ajustados (52px): ✓');

// ── 4. Hero: slides verdadeiramente aleatórios + preferência por animados e alta qualidade ──
const OLD_HERO = `async function updateHero(items) {
  if (!items || !items.length) return;

  // Ordena por ano desc, com thumbnail, preferindo Vimeo
  const withThumb = items
    .filter(d => d.thumbnail)
    .sort((a, b) => (b.ano || '').localeCompare(a.ano || ''));

  // Score: Vimeo embed = prioridade máxima, depois Grand Prix > Ouro > Prata
  function score(d) {
    let s = 0;
    if (d.video_embed && d.video_embed.includes('vimeo')) s += 3;
    if (d.premiacao === 'Grand Prix')    s += 4;
    if (d.premiacao === 'Leão de Ouro')  s += 2;
    if (d.premiacao === 'Leão de Prata') s += 1;
    return s;
  }
  // 1 candidato por ano (melhor score), últimos 5 anos
  const anos = [...new Set(withThumb.map(d => d.ano))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5);

  // Para cada ano, pega os top-3 por score como candidatos
  const candidates = anos.flatMap(ano => {
    const pool = withThumb.filter(d => d.ano === ano);
    return pool.sort((a, b) => _heroScore(b) - _heroScore(a)).slice(0, 3);
  });

  // Testa thumbnails em paralelo, filtra as quebradas
  const results = await Promise.all(
    candidates.map(d => _testImg(d.thumbnail).then(ok => ({ d, ok })))
  );
  const valid = results.filter(r => r.ok).map(r => r.d);

  // 1 por ano, preservando ordem de ano desc
  const seen = new Set();
  const featured = valid.filter(d => {
    if (seen.has(d.ano)) return false;
    seen.add(d.ano);
    return true;
  }).slice(0, 5);

  _heroItems = featured.length ? featured : valid.slice(0, 5);
  _heroIdx   = 0;
  clearInterval(_heroTimer);
  if (_heroItems.length > 1) {
    _heroTimer = setInterval(() => { _heroIdx = (_heroIdx + 1) % _heroItems.length; renderHeroSlide(); }, 7000);
  }
  renderHeroDots();
  renderHeroSlide();
}`;

const NEW_HERO = `async function updateHero(items) {
  if (!items || !items.length) return;

  // Score de qualidade — animados e Vimeo têm prioridade máxima
  function qualityScore(d) {
    let s = 0;
    const t = d.thumbnail || '';
    const e = d.video_embed || '';
    // Imagens animadas: GIF, Giphy — máxima prioridade visual
    if (t.match(/\\.gif(\\?|$)/i) || t.includes('giphy'))      s += 8;
    // Vimeo embed: qualidade garantida
    if (e.includes('vimeo'))                                    s += 5;
    // Domínios de alta qualidade
    if (t.includes('ctfassets') || t.includes('squarespace') ||
        t.includes('cargo.site') || t.includes('behance') ||
        t.includes('dandad') || t.includes('adsoftheworld'))    s += 3;
    // YouTube hq/maxres
    if (t.includes('maxresdefault'))                            s += 4;
    if (t.includes('hqdefault'))                               s += 1;
    // Premiação
    if (d.premiacao === 'Grand Prix')    s += 3;
    if (d.premiacao === 'Leão de Ouro')  s += 2;
    if (d.premiacao === 'Leão de Prata') s += 1;
    return s;
  }

  // Pool: todos com thumbnail, ordenados por score desc
  const pool = items
    .filter(d => d.thumbnail)
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  // Pega top-30 por qualidade como candidatos (garante variedade)
  const topPool = pool.slice(0, 30);

  // Testa thumbnails em paralelo
  const results = await Promise.all(
    topPool.map(d => _testImg(d.thumbnail).then(ok => ({ d, ok })))
  );
  const valid = results.filter(r => r.ok).map(r => r.d);

  if (!valid.length) return;

  // Embaralha aleatoriamente preservando os animados sempre na frente
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const animated = valid.filter(d => {
    const t = d.thumbnail || '';
    return t.match(/\\.gif(\\?|$)/i) || t.includes('giphy');
  });
  const rest = shuffle(valid.filter(d => !animated.includes(d)));
  // Animados primeiro, depois aleatório, máx 8 slides
  _heroItems = [...animated, ...rest].slice(0, 8);
  _heroIdx   = 0;
  clearInterval(_heroTimer);
  if (_heroItems.length > 1) {
    _heroTimer = setInterval(() => {
      _heroIdx = (_heroIdx + 1) % _heroItems.length;
      renderHeroSlide();
    }, 6000);
  }
  renderHeroDots();
  renderHeroSlide();
}`;

if (html.includes(OLD_HERO)) {
  html = html.replace(OLD_HERO, NEW_HERO);
  console.log('updateHero aleatório + qualidade: ✓');
} else {
  console.error('Âncora updateHero não encontrada');
  process.exit(1);
}

writeFileSync(PATH, html, 'utf8');

// Verifica JS
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Navbar animada + hero aleatório aplicados');
