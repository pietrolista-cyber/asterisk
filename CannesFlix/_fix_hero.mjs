import { readFileSync, writeFileSync } from 'fs';
let html = readFileSync('cannes_cerebro_fixed.html', 'utf8');

// ── 1. Imagem centralizada ──
html = html.replace(
  'background-size:cover;background-position:center top;',
  'background-size:cover;background-position:center center;'
);
console.log('bg-position centralizado: ✓');

// ── 2. Nova lógica updateHero: ano desc + preferência Vimeo + score ──
const OLD = `function updateHero(items) {
  if (!items || !items.length) return;
  // Pega até 5 destaques: prefere Grand Prix e Ouro com thumbnail
  const withThumb = items.filter(d => d.thumbnail);
  const featured  = [
    ...withThumb.filter(d => d.premiacao === 'Grand Prix').slice(0,2),
    ...withThumb.filter(d => d.premiacao === 'Leão de Ouro').slice(0,2),
    ...withThumb.filter(d => d.premiacao === 'Leão de Prata').slice(0,1),
  ].slice(0,5);
  _heroItems = featured.length ? featured : withThumb.slice(0,5);`;

const NEW = `function updateHero(items) {
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
  _heroItems = featured.length ? featured : withThumb.slice(0, 5);`;

if (html.includes(OLD)) {
  html = html.replace(OLD, NEW);
  console.log('updateHero atualizado: ✓');
} else {
  console.error('Âncora não encontrada');
  process.exit(1);
}

writeFileSync('cannes_cerebro_fixed.html', html, 'utf8');

const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }

console.log('\n✓ Hero atualizado');
