import { readFileSync, writeFileSync } from 'fs';

const PATH = 'C:/Users/pietr/Cerebro/CannesFlix/cannes_cerebro_fixed.html';
let html = readFileSync(PATH, 'utf8');

// ── Garante variáveis de glow no :root ──
if (!html.includes('--glow-c1:')) {
  html = html.replace(
    '--blur-s: blur(20px) saturate(180%);',
    '--blur-s: blur(20px) saturate(180%);\n            --glow-c1: 0 0 0 1px rgba(255,31,142,.7), 0 0 32px rgba(255,31,142,.4), 0 0 64px rgba(191,90,242,.25), 0 32px 72px rgba(0,0,0,.6);\n            --glow-c2: 0 0 0 1px rgba(191,90,242,.75), 0 0 32px rgba(191,90,242,.45), 0 0 64px rgba(10,132,255,.3), 0 32px 72px rgba(0,0,0,.6);\n            --glow-c3: 0 0 0 1px rgba(10,132,255,.8), 0 0 32px rgba(10,132,255,.5), 0 0 64px rgba(100,210,255,.35), 0 32px 72px rgba(0,0,0,.6);'
  );
  console.log('Variáveis glow: ✓');
} else {
  console.log('Variáveis glow: já existem ✓');
}

// ── Extrai o estilo do <style> ──
const styleOpen  = html.indexOf('<style>');
const styleClose = html.indexOf('</style>');
let css = html.substring(styleOpen, styleClose);

// ── Localiza o bloco completo da navbar (do comentário até o } final do .nav-divider) ──
const BLOCK_START = '/* ── Navbar global ── */';
const bStart = css.indexOf(BLOCK_START);
if (bStart < 0) { console.error('Bloco navbar não encontrado'); process.exit(1); }

// Encontra o fim: o } que fecha .nav-divider{...}
// Avança pelo bloco contando abertura e fechamento
let pos = bStart + BLOCK_START.length;
let inBlock = false;
let braces = 0;
let bEnd = -1;
for (let i = pos; i < css.length; i++) {
  if (css[i] === '{') { inBlock = true; braces++; }
  else if (css[i] === '}') {
    braces--;
    if (inBlock && braces === 0) {
      // verifica se o próximo bloco CSS já é outro seletor (indica fim da nav)
      const after = css.substring(i+1, i+40).trim();
      if (after.startsWith('.') || after.startsWith('@') || after.startsWith('/*') || after === '') {
        bEnd = i + 1;
        // Continua para pegar TODOS os sub-blocos da navbar até mudar de contexto
        // Verifica se o próximo seletor ainda é relacionado à nav
        if (!after.startsWith('.nav') && !after.startsWith('.global')) {
          break;
        }
      }
    }
  }
}
// Fallback: usa indexOf manual para o fim do bloco .nav-divider
const navDivEnd = css.indexOf('\n.nav-divider{', bStart);
const navDivClose = css.indexOf('}', navDivEnd) + 1;
bEnd = navDivClose;
console.log('Bloco nav: pos', bStart, '→', bEnd);

// ── Novo CSS da navbar — idêntico ao sobre_apple_futurista.html ──
const NEW_NAV_CSS = `/* ── Navbar global — Chromatic Animated ── */
.global-nav{position:sticky;top:0;z-index:55;height:52px;background:rgba(4,4,12,.9);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border-bottom:1px solid var(--border-h);display:flex;align-items:center;padding:0 56px;gap:0;box-shadow:var(--glow-c3);}
.nav-links{display:flex;align-items:center;gap:4px;flex:1;}
.nav-link{font-family:var(--font);font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,245,247,.45);text-decoration:none;padding:8px 18px;border-radius:12px;transition:all .25s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;position:relative;overflow:hidden;}
.nav-link::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--c1),var(--c2),var(--c3),transparent);background-size:300% 100%;opacity:0;transition:opacity .4s;}
.nav-link:hover{color:#fff;background:rgba(255,255,255,.1);box-shadow:var(--glow-c1);transform:translateY(-2px);}
.nav-link:hover::before{opacity:.15;animation:shimmer 1.5s infinite;}
.nav-link.active{color:#fff !important;background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:var(--glow-c1);font-weight:700;text-shadow:0 0 20px rgba(255,31,142,.6);}
.nav-login{font-family:var(--font);font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#fff;text-decoration:none;padding:8px 24px;border:1.5px solid transparent;background:linear-gradient(var(--bg),var(--bg)) padding-box,linear-gradient(135deg,var(--c1),var(--c2),var(--c3)) border-box;border-radius:100px;transition:all .3s;}
.nav-login:hover{transform:scale(1.05) translateY(-2px);box-shadow:var(--glow-c2);filter:drop-shadow(0 8px 32px rgba(191,90,242,.4));}
.nav-divider{width:1px;height:20px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.3),transparent);margin:0 16px;}`;

css = css.substring(0, bStart) + NEW_NAV_CSS + css.substring(bEnd);
html = html.substring(0, styleOpen) + css + html.substring(styleClose);
console.log('CSS navbar animada: ✓');

// ── Ajusta header top para 52px ──
html = html.replace('top:44px;z-index:50;', 'top:52px;z-index:50;');
html = html.replace('top:244px;z-index:49;', 'top:252px;z-index:49;');
console.log('Tops ajustados: ✓');

writeFileSync(PATH, html, 'utf8');

// Verifica
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd   = html.lastIndexOf('</script>');
const initPart    = html.substring(scriptStart + html.substring(scriptStart).indexOf('const PLAY_SVG='), scriptEnd);
try { new Function(initPart); console.log('JS syntax: ✓'); }
catch(e) { console.error('JS syntax error:', e.message); }
console.log('\n✓ Navbar cromática aplicada');
