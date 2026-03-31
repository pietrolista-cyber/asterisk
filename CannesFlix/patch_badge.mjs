import { readFileSync, writeFileSync } from 'fs';
let html = readFileSync('C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html', 'utf8');

// Find the exact pattern in buildCardMedia
const OLD = `</div></div>\`;}else if(d.video_embed){`;
const NEW = `</div>\${(!d.video_embed&&d.link&&d.link.includes('youtube'))?'<span style="position:absolute;bottom:6px;right:6px;background:#FF0000;color:#fff;font-size:8px;padding:2px 6px;letter-spacing:1px;font-family:monospace">YT ↗</span>':''}</div>\`;}else if(d.video_embed){`;

if (html.includes(OLD)) {
  html = html.replace(OLD, NEW);
  console.log('buildCardMedia badge YT: ✓');
} else {
  // Try alternative
  const idx = html.indexOf('PLAY_SVG}');
  console.log('PLAY_SVG context:', html.substring(idx, idx + 80));
}

writeFileSync('C:/Users/pietr/Cerebro/Cannes/cannes_cerebro_fixed.html', html, 'utf8');
console.log('Done');
