/**
 * chromatic_redesign.mjs
 * Design Apple Vision Pro Glass + Chromatic RGB
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// NOVO CSS — Apple Chromatic Glass
// ─────────────────────────────────────────────────────────────────────────────
const NEW_CSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ── Chromatic custom props ── */
@property --angle { syntax:'<angle>'; inherits:true; initial-value:0deg; }
@property --hshift { syntax:'<number>'; inherits:false; initial-value:0; }

@keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-60px) scale(1.15)} 66%{transform:translate(-40px,80px) scale(.9)} }
@keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-90px,50px) scale(1.2)} 70%{transform:translate(60px,-80px) scale(.85)} }
@keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,60px) scale(1.1)} }
@keyframes spin  { to{--angle:360deg} }
@keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes pulse-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes float-in { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:none} }

*{box-sizing:border-box;margin:0;padding:0}

:root {
  /* Chromatic palette */
  --c1:#ff1f8e;   /* magenta */
  --c2:#bf5af2;   /* violet */
  --c3:#0a84ff;   /* blue */
  --c4:#32d74b;   /* green */
  --c5:#ff9f0a;   /* amber */
  --c6:#64d2ff;   /* cyan */

  --bg:#000;
  --bg2:#070710;
  --glass:rgba(255,255,255,.055);
  --glass-hover:rgba(255,255,255,.085);
  --glass-active:rgba(255,255,255,.11);
  --border:rgba(255,255,255,.09);
  --border-bright:rgba(255,255,255,.2);
  --text:#f5f5f7;
  --text-2:rgba(245,245,247,.6);
  --text-3:rgba(245,245,247,.35);
  --font:-apple-system,BlinkMacSystemFont,'Inter','SF Pro Display','Segoe UI',sans-serif;
  --r:18px;
  --r-sm:12px;
  --r-xs:8px;
  --blur:blur(48px) saturate(200%);
  --blur-md:blur(28px) saturate(180%);
  --blur-sm:blur(16px) saturate(160%);
}

/* ── RESET & BASE ── */
html { scroll-behavior:smooth }

body {
  background:var(--bg);
  font-family:var(--font);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}

/* ── Floating orbs background ── */
#bg-orbs {
  position:fixed;inset:0;
  pointer-events:none;
  z-index:0;
  overflow:hidden;
}

#bg-orbs span {
  position:absolute;
  border-radius:50%;
  filter:blur(120px);
  opacity:.35;
}

#bg-orbs .o1 {
  width:700px;height:700px;
  top:-200px;left:-150px;
  background:radial-gradient(circle,var(--c1),var(--c2));
  animation:orb1 18s ease-in-out infinite;
}

#bg-orbs .o2 {
  width:600px;height:600px;
  bottom:-100px;right:-100px;
  background:radial-gradient(circle,var(--c3),var(--c6));
  animation:orb2 22s ease-in-out infinite;
}

#bg-orbs .o3 {
  width:500px;height:500px;
  top:40%;left:40%;
  background:radial-gradient(circle,var(--c2),var(--c3));
  animation:orb3 14s ease-in-out infinite;
  opacity:.2;
}

/* Grain overlay */
#bg-orbs::after {
  content:'';
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E");
  opacity:.5;
  pointer-events:none;
}

/* ── HEADER ── */
header {
  position:sticky;top:0;z-index:50;
  height:60px;
  display:flex;align-items:center;gap:16px;
  padding:0 36px;
  background:rgba(0,0,0,.55);
  backdrop-filter:var(--blur);
  -webkit-backdrop-filter:var(--blur);
  border-bottom:1px solid var(--border);
  /* Top highlight line */
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07);
}

.header-logo {
  display:flex;align-items:center;gap:10px;
  flex:1;
}

.header-icon {
  width:28px;height:28px;border-radius:8px;
  background:linear-gradient(135deg,var(--c1),var(--c2));
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;color:#fff;
  box-shadow:0 0 16px rgba(255,31,142,.5);
  flex-shrink:0;
  letter-spacing:-.5px;
}

header h1 {
  font-size:14px;font-weight:600;
  letter-spacing:.04em;
  background:linear-gradient(90deg,#fff 30%,var(--c1) 65%,var(--c2) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}

.header-badge {
  font-size:10px;font-weight:500;
  letter-spacing:.1em;
  color:var(--text-3);
  border:1px solid var(--border);
  padding:3px 10px;
  border-radius:100px;
  background:rgba(255,255,255,.03);
  display:flex;align-items:center;gap:6px;
}

.header-badge::before {
  content:'';width:5px;height:5px;border-radius:50%;
  background:var(--c4);
  box-shadow:0 0 6px var(--c4);
  animation:pulse-glow 2.5s ease-in-out infinite;
}

/* ── FILTROS ── */
.filters {
  position:sticky;top:60px;z-index:49;
  background:rgba(0,0,0,.45);
  backdrop-filter:var(--blur-md);
  -webkit-backdrop-filter:var(--blur-md);
  border-bottom:1px solid var(--border);
  padding:11px 36px;
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
}

.filter-group { display:flex;flex-direction:column;gap:3px }

.filter-group label {
  font-size:8.5px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;
  color:var(--c1);opacity:.9;
  padding-left:2px;
}

select, input {
  background:rgba(255,255,255,.05);
  color:var(--text);
  border:1px solid var(--border);
  padding:7px 14px;
  font-family:var(--font);font-size:12px;font-weight:400;
  min-width:140px;
  border-radius:var(--r-xs);
  appearance:none;cursor:pointer;
  backdrop-filter:var(--blur-sm);
  transition:border-color .2s,background .2s,box-shadow .2s;
  outline:none;
}

select:hover,input:hover {
  border-color:var(--border-bright);
  background:rgba(255,255,255,.07);
}

select:focus,input:focus {
  border-color:rgba(191,90,242,.55);
  background:rgba(255,255,255,.07);
  box-shadow:0 0 0 3px rgba(191,90,242,.15),0 0 20px rgba(191,90,242,.1);
}

input::placeholder{color:var(--text-3)}
input{min-width:200px}

.count-badge {
  margin-left:auto;
  font-size:11px;font-weight:500;letter-spacing:.06em;
  color:var(--text-2);
  background:rgba(255,255,255,.04);
  border:1px solid var(--border);
  padding:5px 14px;border-radius:100px;
  align-self:center;
}

/* ── TAG BAR ── */
.tag-filter-bar {
  position:sticky;top:107px;z-index:48;
  background:rgba(0,0,0,.4);
  backdrop-filter:var(--blur-sm);
  -webkit-backdrop-filter:var(--blur-sm);
  border-bottom:1px solid var(--border);
  padding:9px 36px;
  display:flex;gap:6px;
  overflow-x:auto;
  flex-wrap:nowrap;align-items:center;
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,.08) transparent;
}

.tag-filter-bar::-webkit-scrollbar{height:2px}
.tag-filter-bar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:1px}

.tag-filter-label {
  font-size:8.5px;font-weight:600;
  letter-spacing:.16em;text-transform:uppercase;
  color:var(--text-3);white-space:nowrap;
  margin-right:4px;flex-shrink:0;
}

.tag-pill {
  background:rgba(255,255,255,.04);
  color:var(--text-3);
  border:1px solid rgba(255,255,255,.07);
  font-size:9px;font-weight:500;
  padding:4px 12px;
  letter-spacing:.07em;text-transform:uppercase;
  cursor:pointer;white-space:nowrap;flex-shrink:0;
  font-family:var(--font);
  border-radius:100px;
  transition:all .2s;
}

.tag-pill:hover {
  color:var(--c1);
  border-color:rgba(255,31,142,.35);
  background:rgba(255,31,142,.07);
}

.tag-pill.active {
  background:linear-gradient(135deg,var(--c1),var(--c2));
  color:#fff;border-color:transparent;font-weight:600;
  box-shadow:0 0 20px rgba(255,31,142,.3),0 0 40px rgba(191,90,242,.15);
}

.tag-clear {
  background:transparent;color:var(--text-3);
  border:1px solid rgba(255,255,255,.06);
  font-size:9px;font-weight:500;
  padding:4px 12px;letter-spacing:.07em;text-transform:uppercase;
  cursor:pointer;white-space:nowrap;flex-shrink:0;
  font-family:var(--font);border-radius:100px;
  transition:all .2s;
}

.tag-clear:hover{color:var(--text);border-color:var(--border-bright)}

/* ── GRID ── */
.grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:20px;
  padding:28px 36px;
  position:relative;z-index:1;
}

/* ── CARD ── */
.card {
  position:relative;
  background:var(--glass);
  border-radius:var(--r);
  overflow:hidden;
  cursor:pointer;
  transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s;
  /* Glass border */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.1),
    inset 0 -1px 0 rgba(255,255,255,.03),
    0 2px 24px rgba(0,0,0,.4);
  /* Chrome border via outline */
  outline:1px solid var(--border);
  outline-offset:-1px;
  animation:float-in .4s ease both;
}

/* Chromatic rainbow border on hover */
.card::before {
  content:'';
  position:absolute;inset:-1.5px;
  border-radius:calc(var(--r) + 1.5px);
  background:conic-gradient(from var(--angle),
    var(--c1),var(--c2),var(--c3),var(--c6),var(--c4),var(--c5),var(--c1));
  z-index:-1;
  opacity:0;
  transition:opacity .4s;
}

.card:hover::before {
  opacity:1;
  animation:spin 4s linear infinite;
}

/* Frosted glass inner layer */
.card::after {
  content:'';
  position:absolute;inset:0;
  background:var(--glass);
  backdrop-filter:var(--blur-sm);
  -webkit-backdrop-filter:var(--blur-sm);
  border-radius:var(--r);
  z-index:-1;
}

.card:hover {
  transform:translateY(-8px) scale(1.015);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.15),
    0 32px 80px rgba(0,0,0,.6),
    0 0 60px rgba(191,90,242,.12),
    0 0 80px rgba(255,31,142,.08);
  outline-color:transparent;
  background:var(--glass-hover);
}

/* ── THUMB ── */
.card-thumb {
  width:100%;aspect-ratio:16/9;
  background:#050508;
  position:relative;overflow:hidden;cursor:pointer;
}

.card-thumb img {
  width:100%;height:100%;
  object-fit:cover;display:block;
  transition:transform .55s cubic-bezier(.4,0,.2,1);
}

.card:hover .card-thumb img{transform:scale(1.08)}

.card-thumb iframe{position:absolute;inset:0;width:100%;height:100%;border:none;display:block}

/* Glass reflection on top of thumbnail */
.card-thumb::before {
  content:'';
  position:absolute;
  top:0;left:0;right:0;height:45%;
  background:linear-gradient(180deg,
    rgba(255,255,255,.12) 0%,
    rgba(255,255,255,.04) 40%,
    transparent 100%);
  z-index:3;pointer-events:none;
  border-radius:var(--r) var(--r) 0 0;
}

/* Chromatic shimmer line at top of thumb */
.card-thumb::after {
  content:'';
  position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,
    transparent,var(--c1),var(--c2),var(--c3),var(--c6),transparent);
  background-size:200% 100%;
  animation:shimmer 3s ease infinite;
  z-index:4;opacity:0;
  transition:opacity .3s;
}

.card:hover .card-thumb::after{opacity:.7}

/* ── PLAY OVERLAY ── */
.play-overlay {
  position:absolute;inset:0;z-index:2;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.1);
  transition:background .25s;
  pointer-events:none;
}

.card:hover .play-overlay{background:rgba(0,0,0,0)}

.play-btn {
  width:58px;height:58px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  /* Chromatic glass button */
  background:rgba(255,255,255,.15);
  backdrop-filter:blur(16px) saturate(200%);
  -webkit-backdrop-filter:blur(16px) saturate(200%);
  border:1px solid rgba(255,255,255,.25);
  box-shadow:
    0 0 0 8px rgba(255,255,255,.06),
    0 8px 32px rgba(0,0,0,.4),
    inset 0 1px 0 rgba(255,255,255,.3);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,background .3s;
}

.card:hover .play-btn {
  transform:scale(1.18);
  background:linear-gradient(135deg,rgba(255,31,142,.7),rgba(191,90,242,.7));
  border-color:rgba(255,255,255,.35);
  box-shadow:
    0 0 0 12px rgba(255,31,142,.08),
    0 12px 40px rgba(255,31,142,.3),
    inset 0 1px 0 rgba(255,255,255,.4);
}

.play-btn svg{width:20px;height:20px;fill:#fff;margin-left:3px;
  filter:drop-shadow(0 0 4px rgba(255,255,255,.5))}

/* ── NO THUMB ── */
.no-thumb {
  width:100%;aspect-ratio:16/9;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:10px;
  background:linear-gradient(135deg,rgba(191,90,242,.06),rgba(10,132,255,.06));
}

.no-thumb span{
  font-size:9px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--text-3);font-weight:500;
}

.no-thumb a{
  color:var(--c1);font-size:9px;text-decoration:none;
  padding:4px 14px;
  border:1px solid rgba(255,31,142,.25);
  border-radius:100px;
  transition:all .2s;font-weight:500;
}

.no-thumb a:hover{background:rgba(255,31,142,.1);border-color:var(--c1)}

/* ── CARD BODY ── */
.card-body{padding:16px 18px 20px}

.card-top{
  display:flex;align-items:center;
  justify-content:space-between;margin-bottom:10px;
}

.card-premio{
  font-size:9px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  padding:3px 10px;border-radius:100px;
  display:inline-block;
}

.card-ano{
  font-size:10px;color:var(--text-3);
  letter-spacing:.08em;font-weight:500;
}

/* Premio badges — chromatic */
.grand-prix {
  background:linear-gradient(135deg,var(--c1),var(--c2));
  color:#fff;
  box-shadow:0 0 16px rgba(255,31,142,.4),0 0 32px rgba(191,90,242,.2);
}

.ouro {
  background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;
  box-shadow:0 0 12px rgba(245,158,11,.3);
}

.prata {
  background:linear-gradient(135deg,#94a3b8,#64748b);color:#fff;
}

.bronze {
  background:linear-gradient(135deg,#b45309,#92400e);color:#fff;
}

.outro {
  background:rgba(255,255,255,.06);color:var(--text-3);
  border:1px solid var(--border);
}

.card-title {
  font-size:13px;font-weight:600;
  color:var(--text);
  letter-spacing:.01em;line-height:1.35;
  margin-bottom:12px;
  display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;
}

.card-meta{display:flex;flex-direction:column;gap:5px}

.meta-row{display:flex;gap:8px;font-size:11px;align-items:baseline}

.meta-label{
  color:var(--c1);min-width:58px;
  font-size:8.5px;letter-spacing:.12em;
  text-transform:uppercase;font-weight:600;
  opacity:.75;flex-shrink:0;
}

.meta-value{color:var(--text-2);flex:1;font-size:11.5px}

.segmento-tag{
  display:inline-block;margin-top:12px;
  background:rgba(191,90,242,.07);
  border:1px solid rgba(191,90,242,.2);
  color:rgba(191,90,242,.85);
  font-size:8.5px;padding:3px 10px;
  letter-spacing:.1em;text-transform:uppercase;
  border-radius:100px;font-weight:600;
}

.no-results{
  grid-column:1/-1;text-align:center;
  padding:80px;color:var(--text-3);
  letter-spacing:.2em;text-transform:uppercase;font-size:12px;
}

/* ── MODAL OVERLAY ── */
.modal-overlay {
  display:none;
  position:fixed;inset:0;z-index:200;
  background:rgba(0,0,0,.7);
  backdrop-filter:blur(32px) saturate(160%);
  -webkit-backdrop-filter:blur(32px) saturate(160%);
  align-items:center;justify-content:center;
  padding:20px;
}

.modal-overlay.active{display:flex}

/* ── MODAL ── */
.modal {
  position:relative;
  background:rgba(14,14,26,.88);
  border-radius:22px;
  max-width:920px;width:100%;
  max-height:92vh;overflow-y:auto;
  /* Chromatic border */
  box-shadow:
    0 0 0 1px rgba(255,255,255,.12),
    0 40px 100px rgba(0,0,0,.7),
    0 0 80px rgba(191,90,242,.08);
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,.08) transparent;
  animation:float-in .25s ease;
}

/* Chromatic top edge */
.modal::before {
  content:'';
  position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,
    transparent 0%,var(--c1) 25%,var(--c2) 50%,var(--c3) 75%,transparent 100%);
  background-size:200% 100%;
  animation:shimmer 4s ease infinite;
  border-radius:22px 22px 0 0;
  z-index:10;
}

/* Glass highlight */
.modal::after {
  content:'';
  position:absolute;top:2px;left:0;right:0;height:60px;
  background:linear-gradient(180deg,rgba(255,255,255,.06),transparent);
  border-radius:22px 22px 0 0;
  pointer-events:none;z-index:1;
}

.modal-close {
  position:absolute;top:14px;right:16px;z-index:20;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.1);
  color:var(--text-2);
  font-size:13px;cursor:pointer;
  font-family:var(--font);
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s;
  backdrop-filter:blur(8px);
}

.modal-close:hover{
  background:rgba(255,31,142,.15);
  border-color:rgba(255,31,142,.4);
  color:var(--c1);
  transform:scale(1.1);
}

.modal-media{
  width:100%;aspect-ratio:16/9;
  background:#000;position:relative;
  border-radius:22px 22px 0 0;overflow:hidden;
}

/* Chromatic shimmer on media top */
.modal-media::after{
  content:'';
  position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--c1),var(--c2),var(--c3),var(--c6));
  background-size:200% 100%;
  animation:shimmer 3s ease infinite;
  z-index:5;
}

.modal-media iframe{width:100%;height:100%;border:none;position:absolute;inset:0}
.modal-media img{width:100%;height:100%;object-fit:cover;display:block}

.modal-info{padding:24px 28px 30px}

.modal-header{
  display:flex;align-items:flex-start;
  gap:12px;margin-bottom:20px;
}

.modal-title{
  font-size:20px;font-weight:700;
  color:var(--text);
  letter-spacing:.01em;line-height:1.25;flex:1;
}

/* Info grid — glass card */
.modal-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:12px 24px;
  background:rgba(255,255,255,.03);
  border:1px solid var(--border);
  border-radius:var(--r-sm);
  padding:16px 18px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
}

.modal-field{display:flex;flex-direction:column;gap:3px}

.modal-label{
  font-size:8.5px;color:var(--c1);
  letter-spacing:.15em;text-transform:uppercase;
  font-weight:600;opacity:.8;
}

.modal-val{font-size:13px;color:var(--text-2);font-weight:400}

/* Sinopse */
.modal-sinopse-wrap{
  margin-top:18px;
  background:rgba(255,255,255,.025);
  border:1px solid var(--border);
  border-left:2px solid var(--c1);
  border-radius:var(--r-sm);
  padding:14px 18px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
}

.modal-sinopse-label{
  font-size:8.5px;color:var(--c1);
  letter-spacing:.15em;text-transform:uppercase;
  margin-bottom:8px;display:block;font-weight:600;opacity:.8;
}

.modal-sinopse-text{
  font-size:13px;color:var(--text-2);
  line-height:1.75;font-weight:400;
}

/* Tags */
.modal-tags-wrap{
  margin-top:14px;
  display:flex;flex-wrap:wrap;gap:6px;
}

.modal-tag{
  background:rgba(255,31,142,.06);
  color:rgba(255,31,142,.65);
  border:1px solid rgba(255,31,142,.15);
  font-size:8.5px;padding:4px 11px;
  letter-spacing:.1em;text-transform:uppercase;
  border-radius:100px;font-weight:600;
  transition:all .2s;
}

.modal-tag:hover{
  background:rgba(255,31,142,.14);
  color:var(--c1);
  border-color:rgba(255,31,142,.4);
  cursor:default;
}

/* CTA link */
.modal-link{
  display:block;margin-top:20px;
  color:#fff;font-size:11px;font-weight:700;
  letter-spacing:.1em;text-decoration:none;
  text-transform:uppercase;text-align:center;
  padding:13px 20px;
  border-radius:var(--r-sm);
  background:linear-gradient(135deg,var(--c1) 0%,var(--c2) 60%,var(--c3) 100%);
  background-size:200% 200%;
  animation:shimmer 5s ease infinite;
  box-shadow:0 6px 24px rgba(255,31,142,.35),0 0 40px rgba(191,90,242,.15);
  transition:opacity .2s,transform .2s;
}

.modal-link:hover{opacity:.88;transform:translateY(-2px)}

/* HUD corners — subtle */
.hud-corner{
  position:fixed;pointer-events:none;z-index:0;
  border:1px solid rgba(255,31,142,.1);opacity:1;
}

.hud-tl{top:76px;left:14px;width:36px;height:36px;
  border-right:none;border-bottom:none;border-radius:6px 0 0 0}
.hud-br{bottom:14px;right:14px;width:36px;height:36px;
  border-left:none;border-top:none;border-radius:0 0 6px 0}

/* Global scrollbar */
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.15)}
</style>`;

// ─────────────────────────────────────────────────────────────────────────────
// NOVO BODY STRUCTURE (header + orbs)
// ─────────────────────────────────────────────────────────────────────────────
const NEW_BODY_OPEN = `<body>
<!-- Floating orbs background -->
<div id="bg-orbs">
  <span class="o1"></span>
  <span class="o2"></span>
  <span class="o3"></span>
</div>
<div class="hud-corner hud-tl"></div>
<div class="hud-corner hud-br"></div>
<header>
  <div class="header-logo">
    <div class="header-icon">CL</div>
    <h1>CANNES LIONS — DATABASE</h1>
  </div>
  <div class="header-badge">CÉREBRO CRIATIVO &nbsp;·&nbsp; 2022 · 2023 · 2025</div>
</header>`;

// ─────────────────────────────────────────────────────────────────────────────
// Aplica as substituições
// ─────────────────────────────────────────────────────────────────────────────

// 1. Remove Google Fonts links anteriores se existirem
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/g, '');
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\n?/g, '');
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet">\n?/g, '');

// 2. Substitui <style>...</style> (incluindo todo o bloco)
const styleStart = html.indexOf('<style>');
const styleEnd   = html.indexOf('</style>') + '</style>'.length;
// Insere as novas fontes + estilos no <head>
const headEnd = html.indexOf('</head>');
html = html.substring(0, headEnd) + NEW_CSS + '\n' + html.substring(headEnd);
// Remove o estilo antigo
const newStyleStart = html.indexOf('<style>');
const newStyleEnd   = html.indexOf('</style>', newStyleStart) + '</style>'.length;
// Agora o <style> antigo está após o novo, remova-o
const secondStyleStart = html.indexOf('<style>', newStyleEnd);
if (secondStyleStart !== -1) {
  const secondStyleEnd = html.indexOf('</style>', secondStyleStart) + '</style>'.length;
  html = html.substring(0, secondStyleStart) + html.substring(secondStyleEnd);
}
console.log('CSS chromatic: ✓');

// 3. Substitui <body> até fim do header
const bodyTagStart = html.indexOf('<body>');
const filtersStart = html.indexOf('<div class="filters">');
html = html.substring(0, bodyTagStart) + NEW_BODY_OPEN + '\n' + html.substring(filtersStart);
console.log('Body/header: ✓');

// 4. Atualiza sticky tops para novo header (60px) + filters (~54px) + tags
// Tag bar top = 60 + 54 = 114
html = html.replace(
  /top:\s*12[0-9]px;\s*z-index:\s*1[0-9]/g,
  'top:114px;z-index:48'
);
console.log('Sticky tops: ✓');

// 5. Atualiza adjustTagBarTop
const oldAdjust = `function adjustTagBarTop(){
  const hdr = document.querySelector('header');
  const fbar = document.querySelector('.filters');
  const tbar = document.getElementById('tag-filter-bar');
  if(hdr && fbar && tbar){ tbar.style.top = (hdr.offsetHeight + fbar.offsetHeight) + 'px'; }
}`;
if (html.includes(oldAdjust)) {
  html = html.replace(oldAdjust, oldAdjust); // keep same logic, it reads real heights
  console.log('adjustTagBarTop: ✓ (mantido)');
}

// 6. Adiciona stagger animation delay nos cards via JS
// Injeta no render() para adicionar animation-delay escalonado
html = html.replace(
  'grid.appendChild(card);',
  'card.style.animationDelay=(filtered.indexOf(d)%20*.04)+"s";grid.appendChild(card);'
);
console.log('Card stagger animation: ✓');

writeFileSync(HTML, html, 'utf8');
console.log('\n✓ Chromatic redesign salvo em', HTML);
