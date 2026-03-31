/**
 * fix_hover.mjs
 * Remove @property --angle + conic-gradient (pesado demais)
 * Substitui por RGB glow animado via box-shadow (leve, moderno)
 * Remove também backdrop-filter de cada card individual
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

const styleStart = html.indexOf('<style>');
const styleEnd   = html.indexOf('</style>') + '</style>'.length;
let css = html.substring(styleStart, styleEnd);

// ── 1. Remove @property --angle e @keyframes spin ────────
css = css.replace('@property --angle{syntax:\'<angle>\';inherits:true;initial-value:0deg}', '');
css = css.replace('@keyframes spin{to{--angle:360deg}}', '');

// ── 2. Adiciona @keyframes rgb-glow (box-shadow cycling) ──
// Insere após os outros @keyframes
const newKeyframes = `
@keyframes rgb-glow{
  0%  {box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 0 0 1px rgba(255,31,142,.55),0 0 24px rgba(255,31,142,.22),0 0 48px rgba(191,90,242,.12),0 24px 56px rgba(0,0,0,.5)}
  33% {box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 0 0 1px rgba(191,90,242,.6),0 0 24px rgba(191,90,242,.22),0 0 48px rgba(10,132,255,.14),0 24px 56px rgba(0,0,0,.5)}
  66% {box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 0 0 1px rgba(10,132,255,.5),0 0 24px rgba(10,132,255,.2),0 0 48px rgba(100,210,255,.1),0 24px 56px rgba(0,0,0,.5)}
  100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 0 0 1px rgba(255,31,142,.55),0 0 24px rgba(255,31,142,.22),0 0 48px rgba(191,90,242,.12),0 24px 56px rgba(0,0,0,.5)}
}`;

css = css.replace('@keyframes float-in', newKeyframes + '\n@keyframes float-in');

// ── 3. Substitui o bloco .card (remove ::before conic, remove backdrop-filter ::after) ──
const OLD_CARD_BLOCK = `.card{position:relative;background:var(--glass);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s,background .25s;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 0 rgba(255,255,255,.03),0 2px 24px rgba(0,0,0,.4);outline:1px solid var(--border);outline-offset:-1px;animation:float-in .4s ease both}
.card::before{content:'';position:absolute;inset:-1.5px;border-radius:calc(var(--r) + 1.5px);background:conic-gradient(from var(--angle),var(--c1),var(--c2),var(--c3),var(--c6),var(--c4),var(--c5),var(--c1));z-index:-1;opacity:0;transition:opacity .4s}
.card::after{content:'';position:absolute;inset:0;background:var(--glass);backdrop-filter:var(--blur-s);-webkit-backdrop-filter:var(--blur-s);border-radius:var(--r);z-index:-1}
.card:hover::before{opacity:1;animation:spin 4s linear infinite}
.card:hover{transform:translateY(-8px) scale(1.015);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 32px 80px rgba(0,0,0,.55),0 0 60px rgba(191,90,242,.1),0 0 80px rgba(255,31,142,.07);outline-color:transparent;background:var(--glass-h)}`;

const NEW_CARD_BLOCK = `.card{position:relative;background:var(--glass);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,background .25s,outline-color .3s;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 2px 20px rgba(0,0,0,.38);outline:1px solid var(--border);outline-offset:-1px;animation:float-in .4s ease both;will-change:transform}
.card:hover{transform:translateY(-6px) scale(1.012);background:var(--glass-h);outline-color:transparent;animation:rgb-glow 3s ease infinite}`;

if (css.includes(OLD_CARD_BLOCK)) {
  css = css.replace(OLD_CARD_BLOCK, NEW_CARD_BLOCK);
  console.log('Card hover → rgb-glow: ✓');
} else {
  // Patch por partes
  // Remove ::before conic
  css = css.replace(
    /\.card::before\{content:'';position:absolute;inset:-1\.5px;[^}]+conic-gradient[^}]+\}/,
    ''
  );
  // Remove ::after backdrop-filter no card
  css = css.replace(
    /\.card::after\{content:'';position:absolute;inset:0;background:var\(--glass\);backdrop-filter:var\(--blur-s\);-webkit-backdrop-filter:var\(--blur-s\);border-radius:var\(--r\);z-index:-1\}/,
    ''
  );
  // Remove hover::before spin
  css = css.replace(/\.card:hover::before\{opacity:1;animation:spin \ds linear infinite\}/, '');
  // Substitui .card:hover
  css = css.replace(
    /\.card:hover\{transform:translateY\(-8px\)[^}]+\}/,
    `.card:hover{transform:translateY(-6px) scale(1.012);background:var(--glass-h);outline-color:transparent;animation:rgb-glow 3s ease infinite}`
  );
  // Adiciona will-change ao .card base
  css = css.replace(
    'animation:float-in .4s ease both}',
    'animation:float-in .4s ease both;will-change:transform}'
  );
  console.log('Card hover patch parcial: ✓');
}

// ── 4. Remove --angle de qualquer lugar restante ──────────
css = css.replace(/var\(--angle\)/g, '0deg');

// ── 5. Aplica CSS corrigido ───────────────────────────────
html = html.substring(0, styleStart) + css + html.substring(styleEnd);

// ── 6. Garante que .card não inicia rgb-glow até hover ────
// A animação deve ser none no estado normal
// Já está correto porque só aplicamos em :hover

writeFileSync(HTML, html, 'utf8');
console.log('✓ Hover RGB leve aplicado — sem @property, sem conic-gradient');
