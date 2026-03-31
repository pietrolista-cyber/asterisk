/**
 * fix_all.mjs
 * 1. Corrige YouTube para executar inline (iframe) no card e no modal
 * 2. Corrige dimensão do iframe no card (position:absolute;inset:0)
 * 3. Busca thumbnails faltantes: GIF animado > poster de vídeo > imagem estática
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML  = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONC  = 25;
const TO    = 12000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

// ── 1. Carrega HTML ───────────────────────────────────────
let html = readFileSync(HTML, 'utf8');

// ── 2. Fix CSS: card-thumb iframe → position:absolute ────
// Garante que o iframe sempre preencha o container 16:9 corretamente
html = html.replace(
  '.card-thumb iframe{width:100%;height:100%;border:none;display:block}',
  '.card-thumb iframe{position:absolute;inset:0;width:100%;height:100%;border:none;display:block}'
);
console.log('CSS card-thumb iframe: ✓');

// ── 3. Fix JS: playInCard — YouTube executa inline ────────
const OLD_PLAY = `function playInCard(el,e){e.stopPropagation();const embed=el.dataset.embed;if(!embed)return;if(embed.includes('youtube')){window.open(el.dataset.link,'_blank','noopener');return;}const params='?autoplay=1';el.innerHTML=\`<iframe src="\${embed}\${params}" allowfullscreen allow="autoplay;accelerometer;encrypted-media;gyroscope;picture-in-picture" style="width:100%;height:100%;border:none;display:block;"></iframe>\`;el.onclick=null;}`;
const NEW_PLAY = `function playInCard(el,e){e.stopPropagation();const embed=el.dataset.embed;if(!embed)return;const params=embed.includes('youtube')?'?autoplay=1&rel=0':'?autoplay=1';el.style.position='relative';el.innerHTML=\`<iframe src="\${embed}\${params}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>\`;el.onclick=null;}`;

if (html.includes(OLD_PLAY)) {
  html = html.replace(OLD_PLAY, NEW_PLAY);
  console.log('playInCard YouTube inline: ✓');
} else {
  console.warn('playInCard: âncora não encontrada — patch direto');
  // Patch direto: substitui só a parte do youtube new tab
  html = html.replace(
    `if(embed.includes('youtube')){window.open(el.dataset.link,'_blank','noopener');return;}`,
    ``
  );
  // Fix params para incluir youtube
  html = html.replace(
    `const params='?autoplay=1';el.innerHTML=\`<iframe src="\${embed}\${params}"`,
    `const params=embed.includes('youtube')?'?autoplay=1&rel=0':'?autoplay=1';el.style.position='relative';el.innerHTML=\`<iframe src="\${embed}\${params}"`
  );
  // Fix style do iframe para absolute
  html = html.replace(
    `style="width:100%;height:100%;border:none;display:block;"></iframe>\``,
    `style="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;"></iframe>\``
  );
  console.log('playInCard (patch direto): ✓');
}

// ── 4. Fix JS: openModal — YouTube executa inline ─────────
const OLD_MODAL_YT = `if(d.video_embed.includes('youtube')){const thumb=d.thumbnail?\`<img src="\${d.thumbnail}" alt="\${d.campanha}" style="width:100%;height:100%;object-fit:cover;display:block;">\`:'';mm.innerHTML=\`\${thumb}<a href="\${d.link}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);text-decoration:none;"><div style="background:#FF1F8E;color:#000;padding:14px 32px;font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">▶ ASSISTIR NO YOUTUBE</div></a>\`;}else{`;
const NEW_MODAL_YT = `if(d.video_embed.includes('youtube')){mm.innerHTML=\`<iframe src="\${d.video_embed}?autoplay=1&rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe>\`;}else{`;

if (html.includes(OLD_MODAL_YT)) {
  html = html.replace(OLD_MODAL_YT, NEW_MODAL_YT);
  console.log('openModal YouTube inline: ✓');
} else {
  console.warn('openModal YT: âncora não encontrada — tentando patch parcial');
  // Try to find and fix the youtube branch in openModal
  html = html.replace(
    /if\(d\.video_embed\.includes\('youtube'\)\)\{[^}]+▶ ASSISTIR NO YOUTUBE[^}]+\}\}else\{/,
    `if(d.video_embed.includes('youtube')){mm.innerHTML=\`<iframe src="\${d.video_embed}?autoplay=1&rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe>\`;}else{`
  );
  console.log('openModal (regex patch): ✓');
}

// Salva HTML com fixes JS/CSS já aplicados
writeFileSync(HTML, html, 'utf8');
console.log('HTML salvo com fixes de YouTube e dimensão\n');

// ── 5. Busca thumbnails faltantes ─────────────────────────
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);

const noThumb = data.filter(d =>
  (!d.thumbnail || !d.thumbnail.trim()) &&
  d.link && !d.link.includes('clios.com') && !d.link.includes('lbbonline.com')
);
console.log(`Entradas sem thumbnail a buscar (exc. Clios/LBB): ${noThumb.length}`);

// Resolve URL relativa para absoluta
function toAbsolute(base, rel) {
  if (!rel) return null;
  if (rel.startsWith('//')) return 'https:' + rel;
  if (rel.startsWith('http')) return rel;
  try {
    return new URL(rel, base).href;
  } catch { return null; }
}

async function fetchThumb(entry) {
  const link = entry.link.trim();

  // Vimeo oEmbed
  if (link.includes('vimeo.com')) {
    try {
      const r = await ft(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(link)}`);
      if (r.ok) {
        const j = await r.json();
        const t = (j.thumbnail_url||'').replace(/_\d+x\d+/,'_1280');
        if (t) return t;
      }
    } catch {}
  }

  // D&AD: busca imagem do CMS
  if (link.includes('dandad.org')) {
    try {
      const r = await ft(link, { headers:{'User-Agent':UA,'Referer':'https://www.dandad.org/'} });
      if (r.ok) {
        const html2 = await r.text();
        const m = html2.match(/"psrc"\s*:\s*"(https:\/\/cms\.dandad\.org\/images\/[^"]+)"/);
        if (m) return m[1];
        const m2 = html2.match(/https:\/\/cms\.dandad\.org\/images\/[^"'\s,)]+\.(jpeg|jpg|png|webp)/i);
        if (m2) return m2[0];
      }
    } catch {}
  }

  // Fetch genérico: GIF animado > poster de vídeo > og:image > 1ª imagem grande
  try {
    const r = await ft(link, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': (() => { try { return new URL(link).origin+'/'; } catch { return ''; } })()
      },
      redirect: 'follow',
    });
    if (!r.ok) return null;
    const pg = await r.text();

    // 1. GIF animado (prioridade máxima)
    const gifMatches = [...pg.matchAll(/src=["']([^"']+\.gif[^"']*?)["']/gi)]
      .map(m => toAbsolute(link, m[1]))
      .filter(Boolean)
      .filter(u => !u.includes('tracking') && !u.includes('pixel') && !u.includes('1x1'));
    if (gifMatches.length) return gifMatches[0];

    // 2. Poster de vídeo (<video poster="...">)
    const posterM = pg.match(/<video[^>]+poster=["']([^"']+)["']/i);
    if (posterM) { const p = toAbsolute(link, posterM[1]); if (p) return p; }

    // 3. WebP / imagem de vídeo no meta
    const ogM = pg.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']{10,})["']/i)
              || pg.match(/<meta[^>]+content=["']([^"']{10,})["'][^>]+property=["']og:image["']/i)
              || pg.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']{10,})["']/i)
              || pg.match(/<meta[^>]+content=["']([^"']{10,})["'][^>]+name=["']twitter:image["']/i);
    if (ogM) { const p = toAbsolute(link, ogM[1]); if (p) return p; }

    // 4. Primeira imagem grande (>200px por heurística de URL)
    const imgs = [...pg.matchAll(/<img[^>]+src=["']([^"']{10,})["'][^>]*>/gi)]
      .map(m => ({src: toAbsolute(link, m[1]), full: m[0]}))
      .filter(({src}) => src && /\.(jpe?g|png|webp|gif)/i.test(src)
        && !src.includes('logo') && !src.includes('icon')
        && !src.includes('avatar') && !src.includes('sprite')
        && !src.includes('1x1') && !src.includes('pixel')
        && !src.includes('tracking'));
    if (imgs.length) return imgs[0].src;

    return null;
  } catch { return null; }
}

// Batch runner
let done = 0, found = 0;
for (let i = 0; i < noThumb.length; i += CONC) {
  const batch = noThumb.slice(i, i + CONC);
  const results = await Promise.all(batch.map(e => fetchThumb(e)));
  results.forEach((thumb, idx) => {
    if (thumb) { batch[idx].thumbnail = thumb; found++; }
  });
  done += batch.length;
  process.stdout.write(`\r  ${done}/${noThumb.length} | encontrados: ${found}`);
}
console.log(`\nThumbnails novos: ${found}`);

// ── 6. Salva DATA atualizado no HTML ──────────────────────
let html2 = readFileSync(HTML, 'utf8');
html2 = html2.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);
writeFileSync(HTML, html2, 'utf8');

const total = data.filter(d => d.thumbnail).length;
const semThumb = data.filter(d => !d.thumbnail).length;
console.log(`\nResumo thumbnails:`);
console.log(`  Com thumbnail: ${total}`);
console.log(`  Sem thumbnail: ${semThumb} (Clios ${data.filter(d=>!d.thumbnail&&d.link?.includes('clios')).length} + LBB ${data.filter(d=>!d.thumbnail&&d.link?.includes('lbbonline')).length} + sem acesso)`);
console.log('✓ HTML salvo');
