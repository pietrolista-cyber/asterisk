/**
 * check_yt_embeds.mjs
 * Verifica quais YouTube embeds estão bloqueados (erro 153/embedding desabilitado)
 * via oEmbed API e limpa o video_embed deles no HTML
 * Usa concorrência de 10 requests paralelos
 */
import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html';
let html = readFileSync(HTML, 'utf8');

const dataStart = html.indexOf('const DATA=[') + 'const DATA='.length;
const dataEnd   = html.indexOf('const PLAY_SVG=');
const raw  = html.substring(dataStart, dataEnd).trim().replace(/;$/, '');
const data = JSON.parse(raw);

// Extrai ID do YouTube de uma URL de embed
function ytId(embedUrl) {
  const m = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Checa via oEmbed se o vídeo pode ser embebido
// 200 = OK, 401/403 = embedding desabilitado
async function isEmbeddable(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res.ok; // true = embeddable
  } catch {
    return true; // timeout/network error → assume OK para não remover desnecessariamente
  }
}

// Processa em lotes com concorrência
async function checkInBatches(items, concurrency = 10) {
  const blocked = [];
  let done = 0;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async ({ idx, id }) => {
        const ok = await isEmbeddable(id);
        return { idx, id, ok };
      })
    );
    results.forEach(r => {
      if (!r.ok) blocked.push(r);
    });
    done += batch.length;
    process.stdout.write(`\r  Verificado: ${done}/${items.length} | Bloqueados: ${blocked.length}  `);
  }
  console.log('');
  return blocked;
}

// Monta lista de vídeos YT com embed
const ytItems = [];
data.forEach((d, idx) => {
  if (!d.video_embed || !d.video_embed.includes('youtube')) return;
  const id = ytId(d.video_embed);
  if (id) ytItems.push({ idx, id });
});

console.log(`Verificando ${ytItems.length} embeds do YouTube via oEmbed...\n`);
const blocked = await checkInBatches(ytItems, 10);

console.log(`\nBloqueados: ${blocked.length} de ${ytItems.length}`);

if (blocked.length === 0) {
  console.log('Nenhum embed bloqueado encontrado.');
  process.exit(0);
}

// Limpa video_embed dos bloqueados no DATA array
blocked.forEach(({ idx }) => {
  data[idx].video_embed = null;
});

// Reconstrói o DATA no HTML
const newData = JSON.stringify(data);
html = html.substring(0, dataStart) + newData + ';\n' + html.substring(dataEnd);

writeFileSync(HTML, html, 'utf8');
console.log(`✓ ${blocked.length} embeds bloqueados removidos — mostrarão thumbnail + botão YT`);
console.log('IDs bloqueados:', blocked.map(b => b.id).join(', '));
