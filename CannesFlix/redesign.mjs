/**
 * redesign.mjs
 * Redesign completo — Apple glass + glassmorphism + RGB/policromia
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

// ─────────────────────────────────────────────────────────
// NOVO CSS
// ─────────────────────────────────────────────────────────
const NEW_CSS = `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#06060f;
  --surface:rgba(255,255,255,0.04);
  --surface-hover:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.08);
  --border-hover:rgba(255,255,255,0.18);
  --text:#f0f0f5;
  --text-muted:rgba(240,240,245,0.45);
  --text-dim:rgba(240,240,245,0.25);
  --accent:#ff1f8e;
  --accent2:#a855f7;
  --accent3:#3b82f6;
  --radius:16px;
  --radius-sm:10px;
  --radius-xs:6px;
  --blur:blur(24px) saturate(180%);
  --blur-sm:blur(12px) saturate(160%);
  --shadow:0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow:0 0 40px rgba(255,31,142,0.15);
  --font:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;
}

body{
  background:var(--bg);
  font-family:var(--font);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
}

/* ── Fundo animado ── */
body::before{
  content:'';
  position:fixed;
  inset:0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%, rgba(168,85,247,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 50% 100%, rgba(255,31,142,0.05) 0%, transparent 50%);
  pointer-events:none;
  z-index:0;
}

/* ── Grain ── */
body::after{
  content:'';
  position:fixed;
  inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none;
  z-index:0;
  opacity:0.4;
}

/* ── Header ── */
header{
  position:sticky;
  top:0;
  z-index:20;
  background:rgba(6,6,15,0.7);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border-bottom:1px solid var(--border);
  padding:0 40px;
  height:64px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

header h1{
  font-size:15px;
  font-weight:600;
  letter-spacing:0.08em;
  color:var(--text);
  background:linear-gradient(90deg,#fff 0%,rgba(255,31,142,0.9) 60%,rgba(168,85,247,0.8) 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

header span{
  font-size:11px;
  color:var(--text-muted);
  letter-spacing:0.12em;
  font-weight:400;
}

.header-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--accent);
  box-shadow:0 0 8px var(--accent);
  flex-shrink:0;
}

/* ── Filtros ── */
.filters{
  position:sticky;
  top:64px;
  z-index:19;
  background:rgba(6,6,15,0.65);
  backdrop-filter:var(--blur-sm);
  -webkit-backdrop-filter:var(--blur-sm);
  border-bottom:1px solid var(--border);
  padding:12px 40px;
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
}

.filter-group{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.filter-group label{
  font-size:9px;
  font-weight:500;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--accent);
  padding-left:2px;
}

select,input{
  background:var(--surface);
  color:var(--text);
  border:1px solid var(--border);
  padding:7px 14px;
  font-family:var(--font);
  font-size:12px;
  font-weight:400;
  min-width:140px;
  border-radius:var(--radius-xs);
  appearance:none;
  cursor:pointer;
  backdrop-filter:var(--blur-sm);
  transition:border-color .2s,background .2s;
  outline:none;
}

select:hover,input:hover{
  border-color:var(--border-hover);
  background:var(--surface-hover);
}

select:focus,input:focus{
  border-color:rgba(255,31,142,0.5);
  background:rgba(255,255,255,0.06);
  box-shadow:0 0 0 3px rgba(255,31,142,0.1);
}

input::placeholder{color:var(--text-dim)}
input{min-width:200px}

.count-badge{
  margin-left:auto;
  font-size:11px;
  font-weight:500;
  letter-spacing:0.1em;
  color:var(--text-muted);
  align-self:center;
  background:var(--surface);
  border:1px solid var(--border);
  padding:5px 14px;
  border-radius:100px;
}

/* ── Tag Filter Bar ── */
.tag-filter-bar{
  background:rgba(6,6,15,0.55);
  backdrop-filter:var(--blur-sm);
  -webkit-backdrop-filter:var(--blur-sm);
  padding:10px 40px;
  display:flex;
  gap:6px;
  overflow-x:auto;
  border-bottom:1px solid var(--border);
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,0.1) transparent;
  flex-wrap:nowrap;
  align-items:center;
  position:sticky;
  top:116px;
  z-index:18;
}

.tag-filter-bar::-webkit-scrollbar{height:3px}
.tag-filter-bar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}

.tag-filter-label{
  font-size:9px;
  color:var(--text-dim);
  letter-spacing:0.15em;
  text-transform:uppercase;
  white-space:nowrap;
  margin-right:4px;
  flex-shrink:0;
  font-weight:500;
}

.tag-pill{
  background:var(--surface);
  color:var(--text-muted);
  border:1px solid var(--border);
  font-size:9px;
  padding:5px 12px;
  letter-spacing:0.08em;
  text-transform:uppercase;
  cursor:pointer;
  white-space:nowrap;
  flex-shrink:0;
  font-family:var(--font);
  font-weight:500;
  border-radius:100px;
  transition:all .2s;
}

.tag-pill:hover{
  border-color:rgba(255,31,142,0.5);
  color:var(--accent);
  background:rgba(255,31,142,0.08);
}

.tag-pill.active{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;
  border-color:transparent;
  font-weight:600;
  box-shadow:0 0 16px rgba(255,31,142,0.35);
}

.tag-clear{
  background:transparent;
  color:var(--text-dim);
  border:1px solid rgba(255,255,255,0.06);
  font-size:9px;
  padding:5px 12px;
  letter-spacing:0.08em;
  text-transform:uppercase;
  cursor:pointer;
  white-space:nowrap;
  flex-shrink:0;
  font-family:var(--font);
  border-radius:100px;
  transition:all .2s;
}

.tag-clear:hover{color:var(--text);border-color:var(--border-hover)}

/* ── Grid ── */
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:20px;
  padding:28px 40px;
  position:relative;
  z-index:1;
}

/* ── Cards ── */
.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  overflow:hidden;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, border-color .3s;
  cursor:pointer;
  position:relative;
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
}

/* RGB glow border on hover via pseudo-element */
.card::before{
  content:'';
  position:absolute;
  inset:-1px;
  border-radius:calc(var(--radius) + 1px);
  background:conic-gradient(from var(--angle,0deg),
    #ff1f8e,#a855f7,#3b82f6,#06b6d4,#10b981,#f59e0b,#ff1f8e);
  z-index:-1;
  opacity:0;
  transition:opacity .4s;
}

@property --angle{
  syntax:'<angle>';inherits:true;initial-value:0deg;
}

@keyframes spin-angle{to{--angle:360deg}}

.card:hover::before{
  opacity:1;
  animation:spin-angle 3s linear infinite;
}

.card:hover{
  transform:translateY(-6px) scale(1.01);
  box-shadow:0 20px 60px rgba(0,0,0,0.5), var(--shadow-glow);
  border-color:transparent;
  background:var(--surface-hover);
}

/* ── Card thumb ── */
.card-thumb{
  width:100%;
  aspect-ratio:16/9;
  background:#0a0a14;
  position:relative;
  overflow:hidden;
  cursor:pointer;
}

.card-thumb img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
  transition:transform .5s cubic-bezier(.4,0,.2,1);
}

.card:hover .card-thumb img{transform:scale(1.07)}

.card-thumb iframe{
  position:absolute;inset:0;
  width:100%;height:100%;
  border:none;display:block;
}

/* ── Glass reflection on thumb ── */
.card-thumb::after{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:35%;
  background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%);
  pointer-events:none;
  z-index:2;
  border-radius:0;
}

/* ── Play overlay ── */
.play-overlay{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.15);
  transition:background .25s;
  pointer-events:none;
  z-index:3;
}

.card:hover .play-overlay{background:rgba(0,0,0,0.05)}

.play-btn{
  width:56px;height:56px;
  border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 8px rgba(255,31,142,0.15), 0 8px 24px rgba(255,31,142,0.4);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  backdrop-filter:blur(8px);
}

.card:hover .play-btn{
  transform:scale(1.15);
  box-shadow:0 0 0 12px rgba(255,31,142,0.12), 0 12px 32px rgba(255,31,142,0.55);
}

.play-btn svg{width:20px;height:20px;fill:#fff;margin-left:4px}

/* ── No thumb ── */
.no-thumb{
  width:100%;aspect-ratio:16/9;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:10px;
  background:linear-gradient(135deg,rgba(168,85,247,0.05),rgba(59,130,246,0.05));
}

.no-thumb span{
  font-size:9px;letter-spacing:0.15em;
  text-transform:uppercase;
  color:var(--text-dim);font-weight:500;
}

.no-thumb a{
  color:var(--accent);
  font-size:9px;
  text-decoration:none;
  padding:5px 14px;
  border:1px solid rgba(255,31,142,0.3);
  border-radius:100px;
  transition:all .2s;
  font-weight:500;
}

.no-thumb a:hover{
  background:rgba(255,31,142,0.1);
  border-color:var(--accent);
}

/* ── Card body ── */
.card-body{padding:16px 18px 18px}

.card-top{
  display:flex;align-items:center;
  justify-content:space-between;
  margin-bottom:10px;
}

.card-premio{
  font-size:9px;
  font-weight:600;
  letter-spacing:0.1em;
  text-transform:uppercase;
  padding:3px 10px;
  border-radius:100px;
  display:inline-block;
}

.card-ano{
  font-size:10px;
  color:var(--text-dim);
  letter-spacing:0.08em;
  font-weight:500;
}

/* Premio badges */
.grand-prix{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;
  box-shadow:0 0 12px rgba(255,31,142,0.4);
}

.ouro{
  background:linear-gradient(135deg,#f59e0b,#d97706);
  color:#000;
}

.prata{
  background:linear-gradient(135deg,#94a3b8,#64748b);
  color:#fff;
}

.bronze{
  background:linear-gradient(135deg,#a16207,#92400e);
  color:#fff;
}

.outro{
  background:rgba(255,255,255,0.06);
  color:var(--text-muted);
  border:1px solid var(--border);
}

.card-title{
  font-size:13px;
  font-weight:600;
  color:var(--text);
  letter-spacing:0.02em;
  line-height:1.35;
  margin-bottom:12px;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.card-meta{display:flex;flex-direction:column;gap:5px}

.meta-row{display:flex;gap:8px;font-size:11px;align-items:baseline}

.meta-label{
  color:var(--accent);
  min-width:60px;
  font-size:8.5px;
  letter-spacing:0.12em;
  text-transform:uppercase;
  font-weight:600;
  opacity:0.8;
  flex-shrink:0;
}

.meta-value{color:var(--text-muted);flex:1;font-size:11.5px}

.segmento-tag{
  display:inline-block;
  margin-top:12px;
  background:rgba(255,31,142,0.08);
  border:1px solid rgba(255,31,142,0.2);
  color:rgba(255,31,142,0.8);
  font-size:8.5px;
  padding:3px 10px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  border-radius:100px;
  font-weight:500;
}

.no-results{
  grid-column:1/-1;
  text-align:center;
  padding:80px;
  color:var(--text-dim);
  letter-spacing:0.2em;
  text-transform:uppercase;
  font-size:12px;
}

/* ── Modal overlay ── */
.modal-overlay{
  display:none;
  position:fixed;inset:0;
  background:rgba(0,0,0,0.75);
  backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  z-index:100;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.modal-overlay.active{display:flex}

/* ── Modal ── */
.modal{
  background:rgba(12,12,22,0.9);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:20px;
  max-width:900px;
  width:100%;
  max-height:92vh;
  overflow-y:auto;
  position:relative;
  box-shadow:0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,0.1) transparent;
}

/* Glass highlight top */
.modal::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
  border-radius:20px 20px 0 0;
  pointer-events:none;
}

.modal-close{
  position:absolute;
  top:14px;right:16px;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.08);
  color:var(--text-muted);
  font-size:14px;
  cursor:pointer;
  font-family:var(--font);
  z-index:2;
  width:30px;height:30px;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s;
}

.modal-close:hover{
  background:rgba(255,31,142,0.15);
  border-color:rgba(255,31,142,0.4);
  color:var(--accent);
}

.modal-media{
  width:100%;
  aspect-ratio:16/9;
  background:#000;
  position:relative;
  border-radius:20px 20px 0 0;
  overflow:hidden;
}

.modal-media iframe{
  width:100%;height:100%;
  border:none;
  position:absolute;inset:0;
}

.modal-media img{
  width:100%;height:100%;
  object-fit:cover;display:block;
}

.modal-info{padding:22px 28px 28px}

.modal-header{
  display:flex;
  align-items:flex-start;
  gap:12px;
  margin-bottom:18px;
}

.modal-title{
  font-size:19px;
  font-weight:700;
  color:var(--text);
  letter-spacing:0.02em;
  line-height:1.25;
  flex:1;
}

.modal-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px 24px;
  background:rgba(255,255,255,0.02);
  border:1px solid var(--border);
  border-radius:var(--radius-sm);
  padding:16px;
}

.modal-field{display:flex;flex-direction:column;gap:3px}

.modal-label{
  font-size:8.5px;
  color:var(--accent);
  letter-spacing:0.15em;
  text-transform:uppercase;
  font-weight:600;
  opacity:0.8;
}

.modal-val{
  font-size:13px;
  color:var(--text-muted);
  font-weight:400;
}

.modal-sinopse-wrap{
  margin-top:18px;
  background:rgba(255,255,255,0.025);
  border:1px solid var(--border);
  border-left:2px solid var(--accent);
  border-radius:var(--radius-sm);
  padding:14px 16px;
}

.modal-sinopse-label{
  font-size:8.5px;
  color:var(--accent);
  letter-spacing:0.15em;
  text-transform:uppercase;
  margin-bottom:8px;
  display:block;
  font-weight:600;
  opacity:0.8;
}

.modal-sinopse-text{
  font-size:13px;
  color:var(--text-muted);
  line-height:1.7;
  font-weight:400;
}

.modal-tags-wrap{
  margin-top:14px;
  display:flex;flex-wrap:wrap;gap:6px;
}

.modal-tag{
  background:rgba(255,31,142,0.06);
  color:rgba(255,31,142,0.7);
  border:1px solid rgba(255,31,142,0.15);
  font-size:8.5px;
  padding:4px 10px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  border-radius:100px;
  font-weight:500;
  transition:all .2s;
}

.modal-tag:hover{
  background:rgba(255,31,142,0.15);
  color:var(--accent);
  border-color:rgba(255,31,142,0.4);
  cursor:default;
}

.modal-link{
  display:block;
  margin-top:18px;
  color:#fff;
  font-size:11px;
  font-weight:600;
  letter-spacing:0.1em;
  text-decoration:none;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  padding:11px 20px;
  text-align:center;
  text-transform:uppercase;
  border-radius:var(--radius-xs);
  transition:opacity .2s, transform .2s;
  box-shadow:0 4px 16px rgba(255,31,142,0.3);
}

.modal-link:hover{opacity:0.88;transform:translateY(-1px)}

/* HUD corners */
.hud-corner{
  position:fixed;
  pointer-events:none;
  z-index:0;
  border:1px solid rgba(255,31,142,0.15);
  opacity:1;
}

.hud-tl{top:80px;left:12px;width:40px;height:40px;border-right:none;border-bottom:none;border-radius:4px 0 0 0}
.hud-br{bottom:12px;right:12px;width:40px;height:40px;border-left:none;border-top:none;border-radius:0 0 4px 0}

/* Scrollbar global */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}
</style>`;

// ─────────────────────────────────────────────────────────
// NOVO HEADER HTML
// ─────────────────────────────────────────────────────────
const NEW_HEADER = `<header>
  <h1>CANNES LIONS — DATABASE</h1>
  <div class="header-dot"></div>
  <span>CÉREBRO CRIATIVO &nbsp;·&nbsp; 2022 · 2023 · 2025</span>
</header>`;

// ─────────────────────────────────────────────────────────
// Aplica substituições
// ─────────────────────────────────────────────────────────

// 1. Substitui <style>...</style>
const styleStart = html.indexOf('<style>');
const styleEnd   = html.indexOf('</style>') + '</style>'.length;
html = html.substring(0, styleStart) + NEW_CSS + html.substring(styleEnd);
console.log('CSS redesign: ✓');

// 2. Substitui header
const headerStart = html.indexOf('<header>');
const headerEnd   = html.indexOf('</header>') + '</header>'.length;
html = html.substring(0, headerStart) + NEW_HEADER + html.substring(headerEnd);
console.log('Header: ✓');

// 3. Atualiza top do tag-filter-bar para bater com novo header (64px) + filters (~57px) = 121px
html = html.replace(
  /top:\s*57px;\s*z-index:\s*9\b/,
  'top:121px;z-index:18'
);
html = html.replace(
  /top:57px;z-index:9/,
  'top:121px;z-index:18'
);
console.log('Tag bar top: ✓');

// 4. Atualiza adjustTagBarTop para usar header + filters
html = html.replace(
  'function adjustTagBarTop(){\n  const fbar = document.querySelector(\'.filters\');\n  const tbar = document.getElementById(\'tag-filter-bar\');\n  if(fbar && tbar) { tbar.style.top = fbar.offsetHeight + \'px\'; }\n}',
  `function adjustTagBarTop(){
  const hdr = document.querySelector('header');
  const fbar = document.querySelector('.filters');
  const tbar = document.getElementById('tag-filter-bar');
  if(hdr && fbar && tbar){ tbar.style.top = (hdr.offsetHeight + fbar.offsetHeight) + 'px'; }
}`
);
console.log('adjustTagBarTop: ✓');

// 5. Adiciona link do Google Fonts no <head>
if (!html.includes('fonts.googleapis.com')) {
  html = html.replace(
    '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  );
}
console.log('Fonts preconnect: ✓');

writeFileSync(HTML, html, 'utf8');
console.log('\n✓ Redesign aplicado e HTML salvo');
