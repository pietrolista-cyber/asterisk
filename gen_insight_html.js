const fs = require('fs');

const data = JSON.parse(fs.readFileSync('insights_data.json', 'utf8'));

const segsIcons = {
  'Alimentação e Bebidas': '🍽️',
  'Automóveis e Mobilidade': '🚗',
  'Causas Sociais e ONGs': '🤝',
  'Combate à Violência': '🛡️',
  'Diversidade e Direitos Humanos': '🌈',
  'Entretenimento e Cultura': '🎭',
  'Esporte': '⚽',
  'Finanças e Seguros': '💰',
  'Meio Ambiente e Sustentabilidade': '🌱',
  'Moda e Beleza': '💄',
  'Mídia e Comunicação': '📡',
  'Outros': '✦',
  'Pets e Animais': '🐾',
  'Saúde e Bem-Estar': '❤️',
  'Tecnologia e Inovação': '💡',
  'Turismo e Viagem': '✈️',
  'Varejo e E-commerce': '🛍️'
};

const segs = [...new Set(data.map(r => r.segmento).filter(s => s && s !== 'N/D'))].sort();
const marcas = [...new Set(data.map(r => r.marca).filter(m => m && m !== 'N/D'))].sort();
const total = data.length;

const chipsSeg = segs.map(s => {
  const icon = segsIcons[s] || '✦';
  return `        <button class="chip" onclick="searchBy('segmento','${s.replace(/'/g, "\\'")}')"><span>${icon}</span>${s}</button>`;
}).join('\n');

const marcaOptions = marcas.map(m => `      <option value="${m.replace(/"/g, '&quot;')}">${m}</option>`).join('\n');

// Compact data for embedding
const compact = data.map(r => ({
  d: r.dado,
  n: r.numeros,
  m: r.marca,
  s: r.segmento,
  c: r.campanha,
  a: r.ano,
  p: r.premiacao,
  r: r.referencia
}));

const dataJSON = JSON.stringify(compact)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Insight — Asterisk Cérebro</title>
<link rel="icon" href="CannesFlix/ASTERISK LOGO.png">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  :root{--c1:#ff1f8e;--c2:#bf5af2;--c3:#0a84ff;--bg:#050509;--surface:rgba(255,255,255,.04);--border:rgba(255,255,255,.08);--text:#e8e8f0;--muted:#6e6e8a;--nav-h:52px}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;overflow-x:hidden}
  .orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;top:-200px;left:-200px;background:radial-gradient(circle,rgba(255,31,142,.18),transparent 70%)}
  .orb2{width:500px;height:500px;bottom:-100px;right:-100px;background:radial-gradient(circle,rgba(10,132,255,.15),transparent 70%)}
  .orb3{width:400px;height:400px;top:40%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(191,90,242,.1),transparent 70%)}
  .global-nav{position:sticky;top:0;z-index:60;height:var(--nav-h);display:flex;align-items:center;padding:0 24px;gap:12px;background:rgba(5,5,9,.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
  .nav-logo img{height:28px;width:auto}
  .nav-links{display:flex;align-items:center;gap:4px;flex:1}
  .nav-link{padding:6px 12px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;color:var(--muted);transition:.2s}
  .nav-link:hover{color:var(--text);background:var(--surface)}
  .nav-link.active{color:#fff;background:linear-gradient(135deg,rgba(255,31,142,.2),rgba(191,90,242,.2));border:1px solid rgba(255,31,142,.3)}
  .nav-divider{width:1px;height:20px;background:var(--border)}
  .nav-login{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--c1),var(--c2));text-decoration:none}
  .nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;margin-left:auto}
  .nav-burger span{display:block;width:22px;height:2px;background:var(--text);transition:.3s}
  .nav-burger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .nav-burger.active span:nth-child(2){opacity:0}
  .nav-burger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .page{position:relative;z-index:1;min-height:calc(100vh - var(--nav-h));display:flex;flex-direction:column;max-width:900px;margin:0 auto;padding:40px 24px 80px}
  .page-header{text-align:center;margin-bottom:48px}
  .page-header .eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.15em;color:var(--c1);text-transform:uppercase;margin-bottom:12px}
  .page-header h1{font-size:clamp(28px,5vw,48px);font-weight:700;line-height:1.1;background:linear-gradient(135deg,#fff 40%,var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .page-header p{margin-top:14px;color:var(--muted);font-size:15px;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.6}
  .stats-bar{display:flex;gap:24px;justify-content:center;margin-bottom:40px;flex-wrap:wrap}
  .stat{text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 24px}
  .stat-num{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:var(--c1)}
  .stat-label{font-size:11px;color:var(--muted);margin-top:2px;letter-spacing:.05em}
  .search-wrap{position:relative;margin-bottom:16px}
  .search-input{width:100%;padding:18px 60px 18px 20px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:16px;color:var(--text);font-family:'Space Grotesk',sans-serif;font-size:15px;outline:none;transition:.2s}
  .search-input::placeholder{color:var(--muted)}
  .search-input:focus{border-color:rgba(255,31,142,.4);background:rgba(255,31,142,.04);box-shadow:0 0 0 3px rgba(255,31,142,.08)}
  .search-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:36px;height:36px;background:linear-gradient(135deg,var(--c1),var(--c2));border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:.2s}
  .search-btn:hover{opacity:.85;transform:translateY(-50%) scale(1.05)}
  .chips-label{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
  .chips-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}
  .chip{padding:6px 14px;background:var(--surface);border:1px solid var(--border);border-radius:20px;color:var(--muted);font-size:12px;font-family:'Space Grotesk',sans-serif;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:6px;white-space:nowrap}
  .chip:hover{color:var(--text);border-color:rgba(255,31,142,.4);background:rgba(255,31,142,.06)}
  .chip.active{color:var(--c1);border-color:var(--c1);background:rgba(255,31,142,.1)}
  .chip span{font-size:14px}
  .filter-row{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;align-items:center}
  .filter-label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
  .filter-select{padding:8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'Space Grotesk',sans-serif;font-size:12px;outline:none;cursor:pointer}
  .filter-select:focus{border-color:rgba(10,132,255,.4)}
  option{background:#0f0f1a}
  .filter-clear{padding:8px 14px;background:none;border:1px solid var(--border);border-radius:10px;color:var(--muted);font-size:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:.2s}
  .filter-clear:hover{color:var(--text);border-color:rgba(255,255,255,.2)}
  .results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .results-count{font-family:'Space Mono',monospace;font-size:12px;color:var(--muted)}
  .results-count strong{color:var(--c1)}
  .export-btn{padding:8px 16px;background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:11px;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:.2s;display:flex;align-items:center;gap:6px}
  .export-btn:hover{color:var(--text);border-color:rgba(255,255,255,.3)}
  .results-grid{display:flex;flex-direction:column;gap:12px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;transition:.2s;position:relative;overflow:hidden}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c1),var(--c2));opacity:0;transition:.2s}
  .card:hover{border-color:rgba(255,31,142,.2);background:rgba(255,255,255,.06)}
  .card:hover::before{opacity:1}
  .card-num{font-family:'Space Mono',monospace;font-size:20px;font-weight:700;color:var(--c1);margin-bottom:8px;letter-spacing:-.02em}
  .card-dado{font-size:14px;color:var(--text);line-height:1.6;margin-bottom:12px}
  .card-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .tag{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:.03em}
  .tag-marca{background:rgba(255,31,142,.12);color:#ff6eb5;border:1px solid rgba(255,31,142,.2)}
  .tag-seg{background:rgba(10,132,255,.12);color:#5bb5ff;border:1px solid rgba(10,132,255,.2)}
  .tag-ref{background:rgba(191,90,242,.12);color:#d18fff;border:1px solid rgba(191,90,242,.2);cursor:pointer;transition:.2s;text-decoration:none;display:inline-block}
  .tag-ref:hover{background:rgba(191,90,242,.25)}
  .tag-ano{background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--border)}
  .tag-premio{background:rgba(255,200,0,.1);color:#ffd54f;border:1px solid rgba(255,200,0,.2)}
  .empty{text-align:center;padding:80px 20px;color:var(--muted)}
  .empty-icon{font-size:48px;margin-bottom:16px}
  .empty h3{font-size:18px;color:var(--text);margin-bottom:8px}
  @media(max-width:768px){
    .nav-links,.nav-divider,.nav-login{display:none}
    .nav-links.open{display:flex;flex-direction:column;position:fixed;top:var(--nav-h);left:0;right:0;bottom:0;background:rgba(5,5,9,.97);padding:24px;gap:8px;z-index:50}
    .nav-links.open .nav-link{display:flex}
    .nav-links.open .nav-login{display:block;margin-top:8px}
    .nav-burger{display:flex}
    .page{padding:24px 16px 60px}
    .stats-bar{gap:12px}
    .stat{padding:10px 16px}
    .stat-num{font-size:18px}
    .chips-row{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}
    .chips-row::-webkit-scrollbar{height:3px}
    .chips-row::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
    .filter-row{gap:8px}
    .filter-select{font-size:11px;padding:6px 10px}
  }
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<nav class="global-nav">
  <div class="nav-logo"><a href="cerebro.html"><img src="CannesFlix/ASTERISK LOGO.png" alt="Asterisk"></a></div>
  <div class="nav-links" id="nav-links">
    <a href="cerebro.html" class="nav-link">Cérebro</a>
    <a href="CannesFlix/cannes_cerebro_fixed.html" class="nav-link">CannesFlix</a>
    <a href="insight.html" class="nav-link active">Insight</a>
    <a href="Biblioteca/biblioteca.html" class="nav-link">Biblioteca</a>
    <a href="Sobre/sobre_apple_futurista.html" class="nav-link">Sobre</a>
  </div>
  <div class="nav-divider"></div>
  <a href="login.html" class="nav-login">Login</a>
  <button class="nav-burger" id="nav-burger" onclick="toggleNav()" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="page">
  <div class="page-header">
    <div class="eyebrow">✦ Banco de Dados Numéricos</div>
    <h1>Insight</h1>
    <p>Dados, estatísticas e números reais extraídos das campanhas premiadas em Cannes. Pesquise por tema, marca ou segmento.</p>
  </div>

  <div class="stats-bar">
    <div class="stat">
      <div class="stat-num">${total}</div>
      <div class="stat-label">dados extraídos</div>
    </div>
    <div class="stat">
      <div class="stat-num">${segs.length}</div>
      <div class="stat-label">segmentos</div>
    </div>
    <div class="stat">
      <div class="stat-num">${marcas.length}</div>
      <div class="stat-label">marcas</div>
    </div>
    <div class="stat">
      <div class="stat-num">3</div>
      <div class="stat-label">anos Cannes</div>
    </div>
  </div>

  <div class="search-wrap">
    <input type="text" class="search-input" id="search-input"
      placeholder="Pesquise por dado, marca, segmento ou campanha…"
      oninput="doSearch()" onkeydown="if(event.key==='Enter')doSearch()">
    <button class="search-btn" onclick="doSearch()">🔍</button>
  </div>

  <div class="chips-label">Filtrar por segmento</div>
  <div class="chips-row" id="chips-segs">
${chipsSeg}
  </div>

  <div class="filter-row">
    <span class="filter-label">Filtros:</span>
    <select class="filter-select" id="filter-marca" onchange="doSearch()">
      <option value="">Todas as marcas</option>
${marcaOptions}
    </select>
    <select class="filter-select" id="filter-ano" onchange="doSearch()">
      <option value="">Todos os anos</option>
      <option value="2022">2022</option>
      <option value="2023">2023</option>
      <option value="2025">2025</option>
    </select>
    <select class="filter-select" id="filter-premio" onchange="doSearch()">
      <option value="">Todas as premiações</option>
      <option value="Grand Prix">Grand Prix</option>
      <option value="Leão de Ouro">Leão de Ouro</option>
      <option value="Leão de Prata">Leão de Prata</option>
      <option value="Leão de Bronze">Leão de Bronze</option>
      <option value="Shortlist">Shortlist</option>
    </select>
    <button class="filter-clear" onclick="clearAll()">✕ Limpar</button>
  </div>

  <div class="results-header">
    <div class="results-count">Exibindo <strong id="count-label">${total}</strong> resultados</div>
    <button class="export-btn" onclick="exportCSV()">⬇ Exportar CSV</button>
  </div>

  <div class="results-grid" id="results"></div>
  <div class="empty" id="empty" style="display:none">
    <div class="empty-icon">🔭</div>
    <h3>Nenhum resultado encontrado</h3>
    <p>Tente outros termos ou remova alguns filtros.</p>
  </div>
</div>

<script>
const DATA = ${dataJSON};
let activeSegs = new Set();
let filteredData = [...DATA];

function searchBy(type, value) {
  const chips = document.querySelectorAll('.chip');
  chips.forEach(c => { if (c.textContent.trim().includes(value)) c.classList.toggle('active'); });
  if (activeSegs.has(value)) activeSegs.delete(value);
  else activeSegs.add(value);
  doSearch();
}

function doSearch() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  const marca = document.getElementById('filter-marca').value;
  const ano = document.getElementById('filter-ano').value;
  const premio = document.getElementById('filter-premio').value;

  filteredData = DATA.filter(r => {
    const text = (r.d + ' ' + r.m + ' ' + r.s + ' ' + r.c + ' ' + r.n).toLowerCase();
    if (q && !text.includes(q)) return false;
    if (marca && r.m !== marca) return false;
    if (ano && r.a !== ano) return false;
    if (premio && r.p !== premio) return false;
    if (activeSegs.size > 0 && !activeSegs.has(r.s)) return false;
    return true;
  });
  render(filteredData);
}

function clearAll() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-marca').value = '';
  document.getElementById('filter-ano').value = '';
  document.getElementById('filter-premio').value = '';
  activeSegs.clear();
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  filteredData = [...DATA];
  render(filteredData);
}

function highlight(text, q) {
  if (!q) return text;
  var escaped = q.replace(/[-.*+?^$|()\\[\\]]/g, '\\\\$&');
  var re = new RegExp('(' + escaped + ')', 'gi');
  return text.replace(re, '<mark style="background:rgba(255,31,142,.3);color:#fff;border-radius:3px;padding:0 2px">$1</mark>');
}

function render(items) {
  const container = document.getElementById('results');
  const empty = document.getElementById('empty');
  const q = document.getElementById('search-input').value.trim();
  document.getElementById('count-label').textContent = items.length;
  if (!items.length) { container.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  container.innerHTML = items.map(r => {
    const url = 'CannesFlix/cannes_cerebro_fixed.html';
    return '<div class="card">' +
      '<div class="card-num">' + r.n + '</div>' +
      '<div class="card-dado">' + highlight(r.d, q) + '</div>' +
      '<div class="card-meta">' +
        '<span class="tag tag-marca">🏷 ' + r.m + '</span>' +
        '<span class="tag tag-seg">📂 ' + r.s + '</span>' +
        '<span class="tag tag-ano">' + r.a + '</span>' +
        '<span class="tag tag-premio">🏆 ' + r.p + '</span>' +
        '<a class="tag tag-ref" href="' + url + '" title="' + r.r + '">🎬 Ver no CannesFlix</a>' +
      '</div></div>';
  }).join('');
}

function exportCSV() {
  const esc = s => '"' + (s||'').replace(/"/g, '""') + '"';
  const header = 'DADO NUMÉRICO,NÚMERO(S),MARCA,SEGMENTO,CAMPANHA,ANO,PREMIAÇÃO,REFERÊNCIA';
  const rows = filteredData.map(r => [esc(r.d),esc(r.n),esc(r.m),esc(r.s),esc(r.c),esc(r.a),esc(r.p),esc(r.r)].join(','));
  const csv = '\\uFEFF' + header + '\\n' + rows.join('\\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'insights_cannes.csv'; a.click();
}

function toggleNav() {
  document.getElementById('nav-links').classList.toggle('open');
  document.getElementById('nav-burger').classList.toggle('active');
}

render(DATA);
</script>
</body>
</html>`;

fs.writeFileSync('insight.html', html, 'utf8');
console.log('insight.html gerado — ' + html.length + ' chars, ' + data.length + ' registros');
