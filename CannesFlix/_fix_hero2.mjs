import { readFileSync, writeFileSync } from 'fs';
let html = readFileSync('cannes_cerebro_fixed.html', 'utf8');

// ── 1. Grid: ordenar por ano decrescente no render() ──
// Adiciona .sort() logo após getFiltered()
html = html.replace(
  'function render(){\n  const filtered=getFiltered();',
  'function render(){\n  const filtered=getFiltered().slice().sort((a,b)=>(b.ano||"").localeCompare(a.ano||""));'
);
console.log('Grid ordenado por ano desc: ✓');

// ── 2. Hero: detectar thumbnails quebradas antes de exibir ──
// Substitui updateHero para testar cada thumbnail com Image() antes de usar
const OLD_UPDATE = `function updateHero(items) {
  if (!items || !items.length) return;
  // Ordena por ano decrescente (mais recente primeiro), com thumbnail obrigatório
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
  // 1 destaque por ano, pegando os últimos 5 anos disponíveis
  const anos = [...new Set(withThumb.map(d => d.ano))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5);
  const featured = anos.map(ano => {
    const pool = withThumb.filter(d => d.ano === ano);
    return pool.sort((a, b) => score(b) - score(a))[0];
  }).filter(Boolean);
  _heroItems = featured.length ? featured : withThumb.slice(0, 5);
  _heroIdx   = 0;
  clearInterval(_heroTimer);
  if (_heroItems.length > 1) {
    _heroTimer = setInterval(() => { _heroIdx = (_heroIdx+1) % _heroItems.length; renderHeroSlide(); }, 7000);
  }
  renderHeroDots();
  renderHeroSlide();
}`;

const NEW_UPDATE = `function _heroScore(d) {
  let s = 0;
  if (d.video_embed && d.video_embed.includes('vimeo')) s += 3;
  if (d.premiacao === 'Grand Prix')    s += 4;
  if (d.premiacao === 'Leão de Ouro')  s += 2;
  if (d.premiacao === 'Leão de Prata') s += 1;
  return s;
}

function _testImg(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    // Timeout de 4s — se não carregar, considera quebrado
    setTimeout(() => resolve(false), 4000);
  });
}

async function updateHero(items) {
  if (!items || !items.length) return;

  // Ordena por ano desc, com thumbnail, preferindo Vimeo
  const withThumb = items
    .filter(d => d.thumbnail)
    .sort((a, b) => (b.ano || '').localeCompare(a.ano || ''));

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

if (html.includes(OLD_UPDATE)) {
  html = html.replace(OLD_UPDATE, NEW_UPDATE);
  console.log('updateHero com validação de thumbnail: ✓');
} else {
  console.error('Âncora updateHero não encontrada');
  process.exit(1);
}

// ── 3. renderHeroSlide: adiciona fallback onerror no bg ──
// Quando a imagem de fundo quebra no slide, avança para o próximo
const OLD_BG = `    if (d.thumbnail) bg.style.backgroundImage = 'url(' + d.thumbnail + ')';`;
const NEW_BG = `    if (d.thumbnail) {
      const imgTest = new Image();
      imgTest.onload  = () => { bg.style.backgroundImage = 'url(' + d.thumbnail + ')'; };
      imgTest.onerror = () => {
        // Thumbnail quebrada — avança para o próximo slide
        _heroItems.splice(_heroIdx, 1);
        if (!_heroItems.length) return;
        _heroIdx = _heroIdx % _heroItems.length;
        renderHeroDots();
        renderHeroSlide();
      };
      imgTest.src = d.thumbnail;
    }`;

if (html.includes(OLD_BG)) {
  html = html.replace(OLD_BG, NEW_BG);
  console.log('renderHeroSlide com fallback de imagem: ✓');
} else {
  console.error('Âncora renderHeroSlide bg não encontrada');
}

writeFileSync('cannes_cerebro_fixed.html', html, 'utf8');

const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Hero validado + grid ordenado por ano');
