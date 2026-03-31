/**
 * fix_yt_embeds.mjs
 * 1. Verifica TODOS os embeds YouTube via oEmbed (200 = ok, outro = bloqueado)
 * 2. Para os bloqueados: limpa video_embed (mantém link YouTube + thumbnail)
 * 3. Atualiza JS do HTML:
 *    - playInCard: se sem embed mas link YouTube → abre nova aba com UI bonito
 *    - openModal: se sem embed mas link YouTube → thumbnail clicável + botão ASSISTIR
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const CONC = 30;
const TO   = 10000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

// ── Carrega DATA ──────────────────────────────────────────
let html = readFileSync(HTML, 'utf8');
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);

const ytEntries = data.filter(d => d.video_embed && d.video_embed.includes('youtube'));
console.log(`Verificando ${ytEntries.length} embeds YouTube via oEmbed...`);

// ── Checa oEmbed em lotes ─────────────────────────────────
let checked = 0, blocked = 0, cleared = 0;

for (let i = 0; i < ytEntries.length; i += CONC) {
  const batch = ytEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const m = d.video_embed.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (!m) { d.video_embed = ''; cleared++; return; }
    const videoId = m[1];
    try {
      const r = await ft(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (r.status !== 200) {
        d.video_embed = ''; // limpa — embedding desabilitado
        blocked++;
        cleared++;
      }
    } catch {
      // timeout/erro de rede — mantém embed (pode funcionar no browser)
    }
    checked++;
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC, ytEntries.length)}/${ytEntries.length} | bloqueados: ${blocked}`);
}
console.log(`\nTotal verificados: ${checked} | Bloqueados (embed removido): ${blocked}`);

// ── Salva DATA atualizado ─────────────────────────────────
html = html.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);

// ── Atualiza playInCard ───────────────────────────────────
// Novo comportamento: sem embed E link youtube → abre nova aba com ícone
const oldPlayInCard = `function playInCard(el,e){e.stopPropagation();const embed=el.dataset.embed;if(!embed)return;const params=embed.includes('youtube')?'?autoplay=1&rel=0':'?autoplay=1';el.style.position='relative';el.innerHTML=\`<iframe src="\${embed}\${params}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>\`;el.onclick=null;}`;

const newPlayInCard = `function playInCard(el,e){e.stopPropagation();const embed=el.dataset.embed;const link=el.dataset.link||'';if(!embed){if(link)window.open(link,'_blank','noopener');return;}const params=embed.includes('youtube')?'?autoplay=1&rel=0':'?autoplay=1';el.style.position='relative';el.innerHTML=\`<iframe src="\${embed}\${params}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>\`;el.onclick=null;}`;

if (html.includes(oldPlayInCard)) {
  html = html.replace(oldPlayInCard, newPlayInCard);
  console.log('playInCard: ✓');
} else {
  console.warn('playInCard âncora não encontrada — patch por regex');
  html = html.replace(
    /function playInCard\(el,e\)\{e\.stopPropagation\(\);const embed=el\.dataset\.embed;if\(!embed\)return;/,
    `function playInCard(el,e){e.stopPropagation();const embed=el.dataset.embed;const link=el.dataset.link||'';if(!embed){if(link)window.open(link,'_blank','noopener');return;}`
  );
  console.log('playInCard patch regex: ✓');
}

// ── Atualiza openModal ────────────────────────────────────
// Quando video_embed está vazio mas link é YouTube → thumbnail + botão bonito
const oldOpenModal = `function openModal(d){const mm=document.getElementById('modal-media');if(d.video_embed){if(d.video_embed.includes('youtube')){mm.innerHTML=\`<iframe src="\${d.video_embed}?autoplay=1&rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe>\`;}else{const params='?autoplay=1';mm.innerHTML=\`<iframe src="\${d.video_embed}\${params}" allowfullscreen allow="autoplay;accelerometer;encrypted-media;gyroscope;picture-in-picture"></iframe>\`;}}else if(d.thumbnail){mm.innerHTML=\`<img src="\${d.thumbnail}" alt="\${d.campanha}">\`;}else{`;

const newOpenModal = `function openModal(d){const mm=document.getElementById('modal-media');if(d.video_embed){if(d.video_embed.includes('youtube')){mm.innerHTML=\`<iframe src="\${d.video_embed}?autoplay=1&rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe>\`;}else{const params='?autoplay=1';mm.innerHTML=\`<iframe src="\${d.video_embed}\${params}" allowfullscreen allow="autoplay;accelerometer;encrypted-media;gyroscope;picture-in-picture"></iframe>\`;}}else if(d.link&&d.link.includes('youtube')){const thumb=d.thumbnail?\`<img src="\${d.thumbnail}" alt="\${d.campanha}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">\`:'';mm.innerHTML=\`\${thumb}<a href="\${d.link}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.65);text-decoration:none;gap:10px;"><svg width="64" height="64" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M45 24 27 14v20" fill="#fff"/></svg><span style="color:#fff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;background:#FF0000;padding:8px 20px;">▶ ASSISTIR NO YOUTUBE</span></a>\`;}else if(d.thumbnail){mm.innerHTML=\`<img src="\${d.thumbnail}" alt="\${d.campanha}">\`;}else{`;

if (html.includes(oldOpenModal)) {
  html = html.replace(oldOpenModal, newOpenModal);
  console.log('openModal: ✓');
} else {
  console.warn('openModal âncora não encontrada — usando regex');
  // Patch: adiciona o bloco youtube-sem-embed antes do else if(d.thumbnail)
  html = html.replace(
    /}else if\(d\.thumbnail\)\{mm\.innerHTML=`<img src="\$\{d\.thumbnail\}" alt="\$\{d\.campanha\}"`>/,
    `}else if(d.link&&d.link.includes('youtube')){const thumb=d.thumbnail?\`<img src="\${d.thumbnail}" alt="\${d.campanha}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">\`:'';mm.innerHTML=\`\${thumb}<a href="\${d.link}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.65);text-decoration:none;gap:10px;"><svg width="64" height="64" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M45 24 27 14v20" fill="#fff"/></svg><span style="color:#fff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;background:#FF0000;padding:8px 20px;">▶ ASSISTIR NO YOUTUBE</span></a>\`;}else if(d.thumbnail){mm.innerHTML=\`<img src="\${d.thumbnail}" alt="\${d.campanha}">`
  );
  console.log('openModal patch regex: ✓');
}

// ── Também atualiza o play-overlay do card para vídeos sem embed ──
// Adiciona badge YT no overlay quando não há embed
const oldBuildCard = `function buildCardMedia(d){if(d.thumbnail){return\`<div class="card-thumb" data-embed="\${d.video_embed}" data-link="\${d.link}" onclick="playInCard(this,event)"><img src="\${d.thumbnail}" alt="\${d.campanha}" loading="lazy" onerror="this.parentElement.innerHTML=noThumbHTML('\${d.link.replace(/'/g,\\"\\\\'\\")}')"><div class="play-overlay"><div class="play-btn">\${PLAY_SVG}</div></div></div>\``;

const newBuildCard = `function buildCardMedia(d){if(d.thumbnail){const ytNoEmbed=!d.video_embed&&d.link&&d.link.includes('youtube');const overlayLabel=ytNoEmbed?'<span style="position:absolute;bottom:6px;right:6px;background:#FF0000;color:#fff;font-size:8px;padding:2px 6px;letter-spacing:1px;font-family:\\'Courier New\\',monospace;opacity:.9">YT ↗</span>':'';return\`<div class="card-thumb" data-embed="\${d.video_embed}" data-link="\${d.link}" onclick="playInCard(this,event)"><img src="\${d.thumbnail}" alt="\${d.campanha}" loading="lazy" onerror="this.parentElement.innerHTML=noThumbHTML('\${d.link.replace(/'/g,\\"\\\\'\\")}')"><div class="play-overlay"><div class="play-btn">\${PLAY_SVG}</div></div>\${overlayLabel}</div>\``;

if (html.includes(oldBuildCard)) {
  html = html.replace(oldBuildCard, newBuildCard);
  console.log('buildCardMedia: ✓');
} else {
  console.warn('buildCardMedia âncora não encontrada — pulando badge YT');
}

// ── Salva ─────────────────────────────────────────────────
writeFileSync(HTML, html, 'utf8');

const ytOk   = data.filter(d => d.video_embed && d.video_embed.includes('youtube')).length;
const ytLink = data.filter(d => !d.video_embed && d.link && d.link.includes('youtube')).length;
const vimeo  = data.filter(d => d.video_embed && d.video_embed.includes('vimeo')).length;
console.log(`\n═══ Resumo ═══`);
console.log(`  YouTube embed OK (inline):       ${ytOk}`);
console.log(`  YouTube sem embed (abre nova aba): ${ytLink}`);
console.log(`  Vimeo embed:                      ${vimeo}`);
console.log('✓ HTML salvo');
