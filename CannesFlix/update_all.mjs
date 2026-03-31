/**
 * update_all.mjs
 * 1. Atualiza sinopse no HTML para usar Coluna L (PT-BR) do Excel
 * 2. Busca vídeo no YouTube para entradas sem thumbnail (Clios, LBB, outros)
 *    → usa thumbnail do YouTube encontrado + atualiza video_embed
 * 3. Verifica todos os embeds YouTube via oEmbed (403 = embedding desabilitado)
 *    → para os desabilitados, busca vídeo alternativo no YouTube
 * 4. Adiciona handler de erro no HTML JS para fallback em nova aba
 */
import { readFileSync, writeFileSync } from 'fs';
import xlsx from 'xlsx';

const HTML   = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
const EXCEL  = 'C:/Users/pietr/Cerebro/Cannes/Cannes_Lions_2022_2023_2025.xlsx';
const UA     = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONC   = 20;
const TO     = 12000;

function ft(url, opts={}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TO) });
}

// ── 1. Lê Excel e monta mapa link → sinopse PT-BR ─────────
console.log('Lendo Excel...');
const wb = xlsx.readFile(EXCEL);
const ws = wb.Sheets['Cannes Lions Database'];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Mapa por link (col F, index 5) → sinopse PT-BR (col L, index 11)
const sinopsePtBR = new Map();
for (const row of rows.slice(1)) {
  const link = (row[5] || '').trim();
  const sinopse = (row[11] || '').trim();
  if (link && sinopse && sinopse !== 'Sinopse não encontrada') {
    sinopsePtBR.set(link, sinopse);
  }
}
console.log(`Sinopses PT-BR carregadas: ${sinopsePtBR.size}`);

// ── 2. Carrega DATA do HTML ───────────────────────────────
let html = readFileSync(HTML, 'utf8');
const dataMatch = html.match(/const DATA=(\[[\s\S]*?\]);/);
const data = JSON.parse(dataMatch[1]);
console.log(`Total entradas: ${data.length}`);

// ── 3. Atualiza sinopse → PT-BR ───────────────────────────
let sinopseUpdated = 0;
for (const d of data) {
  const link = (d.link || '').trim();
  if (sinopsePtBR.has(link)) {
    d.sinopse = sinopsePtBR.get(link);
    sinopseUpdated++;
  } else if (!d.sinopse || d.sinopse === 'Sinopse não encontrada') {
    d.sinopse = '';
  }
}
console.log(`Sinopses atualizadas para PT-BR: ${sinopseUpdated}`);

// ── 4. Pesquisa YouTube por campanha + marca ──────────────
async function searchYouTube(campanha, marca) {
  const query = `${campanha} ${marca} advertisement`;
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
  try {
    const r = await ft(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
    });
    if (!r.ok) return null;
    const pg = await r.text();
    const ids = [...pg.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
    const unique = [...new Set(ids)];
    if (!unique.length) return null;
    return unique[0];
  } catch { return null; }
}

// Testa se um video_embed do YouTube permite embedding
async function checkEmbedEnabled(embedUrl) {
  const m = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (!m) return false;
  try {
    const r = await ft(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${m[1]}&format=json`);
    return r.status === 200;
  } catch { return false; }
}

// ── 5. Entradas sem thumbnail (Clios, LBB, outros) ───────
const noThumb = data.filter(d => !d.thumbnail || !d.thumbnail.trim());
console.log(`\nEntradas sem thumbnail: ${noThumb.length}`);

let foundThumb = 0;
for (let i = 0; i < noThumb.length; i += CONC) {
  const batch = noThumb.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const id = await searchYouTube(d.campanha, d.marca);
    if (id) {
      d.thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      if (!d.video_embed) {
        d.video_embed = `https://www.youtube-nocookie.com/embed/${id}`;
      }
      foundThumb++;
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC, noThumb.length)}/${noThumb.length} | encontrados: ${foundThumb}`);
}
console.log(`\nThumbnails via YouTube search: ${foundThumb}`);

// ── 6. Verifica embeds YouTube (403 = embedding desabilitado) ──
const ytEntries = data.filter(d => d.video_embed && d.video_embed.includes('youtube'));
console.log(`\nVerificando ${ytEntries.length} embeds YouTube...`);

let disabled = 0, fixed = 0;
for (let i = 0; i < ytEntries.length; i += CONC) {
  const batch = ytEntries.slice(i, i + CONC);
  await Promise.all(batch.map(async d => {
    const ok = await checkEmbedEnabled(d.video_embed);
    if (!ok) {
      disabled++;
      // Tenta encontrar vídeo alternativo
      const altId = await searchYouTube(d.campanha, d.marca);
      if (altId) {
        // Verifica se o alternativo também é embeddable
        const altOk = await checkEmbedEnabled(`https://www.youtube-nocookie.com/embed/${altId}`);
        if (altOk) {
          d.video_embed = `https://www.youtube-nocookie.com/embed/${altId}`;
          // Também atualiza thumbnail se não tiver um bom
          if (!d.thumbnail || d.thumbnail.includes('no-preview') || d.thumbnail.includes('sem-preview')) {
            d.thumbnail = `https://i.ytimg.com/vi/${altId}/hqdefault.jpg`;
          }
          fixed++;
        }
      }
    }
  }));
  process.stdout.write(`\r  ${Math.min(i+CONC, ytEntries.length)}/${ytEntries.length} | desabilitados: ${disabled} | corrigidos: ${fixed}`);
}
console.log(`\nEmbeds desabilitados: ${disabled} | Corrigidos com alternativo: ${fixed}`);

// ── 7. Salva DATA atualizado no HTML ─────────────────────
let html2 = readFileSync(HTML, 'utf8');
html2 = html2.replace(/const DATA=\[[\s\S]*?\];/, `const DATA=${JSON.stringify(data)};`);

// ── 8. Adiciona handler de erro para YouTube embeds desabilitados ──
// Injeta postMessage listener que detecta erro 150/151 e faz fallback para nova aba
const errorHandler = `
// YouTube embed error handler — fallback para nova aba se embedding desabilitado
window.addEventListener('message', function(e) {
  try {
    if (e.origin && !e.origin.includes('youtube')) return;
    const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (msg && msg.event === 'onError' && (msg.info === 150 || msg.info === 151 || msg.info === 100)) {
      const iframe = document.querySelector('iframe[src*="' + (msg.id || '') + '"]')
        || [...document.querySelectorAll('iframe')].find(f => f.contentWindow === e.source);
      if (iframe) {
        const src = iframe.src;
        const idMatch = src.match(/embed\\/([a-zA-Z0-9_-]+)/);
        if (idMatch) {
          const ytLink = 'https://www.youtube.com/watch?v=' + idMatch[1];
          const parent = iframe.parentElement;
          parent.innerHTML = \`<a href="\${ytLink}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111;text-decoration:none;gap:12px;"><div style="background:#FF0000;color:#fff;padding:12px 28px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;font-weight:bold;">▶ ASSISTIR NO YOUTUBE</div><span style="color:#666;font-size:10px;font-family:'Courier New',monospace;">embedding desabilitado pelo autor</span></a>\`;
        }
      }
    }
  } catch(err) {}
});
`;

// Insere antes do fechamento do </script> principal (após a definição das funções)
// Procura o último </script> antes de </body>
const insertBefore = '</script>';
const lastScriptIdx = html2.lastIndexOf(insertBefore);
if (lastScriptIdx !== -1 && !html2.includes('YouTube embed error handler')) {
  html2 = html2.substring(0, lastScriptIdx) + errorHandler + html2.substring(lastScriptIdx);
  console.log('\nHandler de erro YouTube adicionado');
}

writeFileSync(HTML, html2, 'utf8');

// ── 9. Resumo final ───────────────────────────────────────
const totalThumb = data.filter(d => d.thumbnail).length;
const semThumb = data.filter(d => !d.thumbnail).length;
const totalSinopse = data.filter(d => d.sinopse && d.sinopse.trim()).length;
console.log('\n═══ Resumo Final ═══');
console.log(`  Sinopses PT-BR no HTML: ${totalSinopse}`);
console.log(`  Com thumbnail: ${totalThumb}`);
console.log(`  Sem thumbnail: ${semThumb}`);
console.log(`    ↳ Clios: ${data.filter(d=>!d.thumbnail&&d.link?.includes('clios')).length}`);
console.log(`    ↳ LBB: ${data.filter(d=>!d.thumbnail&&d.link?.includes('lbbonline')).length}`);
console.log(`    ↳ Outros: ${data.filter(d=>!d.thumbnail&&!d.link?.includes('clios')&&!d.link?.includes('lbbonline')).length}`);
console.log('✓ HTML salvo');
