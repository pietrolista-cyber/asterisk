import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('CannesFlix/cannes_cerebro_fixed.html', 'utf8');

function extractField(block, field) {
    const marker = `"${field}":"`;
    const start = block.indexOf(marker);
    if (start === -1) return 'N/D';
    let pos = start + marker.length;
    let result = '';
    while (pos < block.length) {
        const ch = block[pos];
        if (ch === '"') break;
        if (ch === '\\') { pos++; result += block[pos] || ''; pos++; continue; }
        result += ch;
        pos++;
    }
    return result.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#\d+;/g, '').replace(/&#x[\da-f]+;/gi, '');
}

const blocks = content.split('{"ano":"');
const rows = [];
let goodCount = 0;

for (let i = 1; i < blocks.length; i++) {
    const block = '{"ano":"' + blocks[i];
    const sinopse = extractField(block, 'sinopse');

    if (!sinopse || sinopse.length < 60) continue;
    if (sinopse.includes('Aproveite v') && sinopse.includes('deos e m')) continue;
    if (sinopse.includes('Uso do artigo') || sinopse.includes('CP-1252') || sinopse.includes('Lu Xun') || sinopse.includes('Adobe Illustrator')) continue;
    if (!/\d[\d.,]*\s*(%|mil|bilh|pessoa|usu|mulher|homen|crian|mort|caso|vez|hora|kg|km|litro|real|d.lar|euro)/i.test(sinopse)) continue;

    goodCount++;
    const ano = extractField(block, 'ano');
    const premiacao = extractField(block, 'premiacao');
    const campanha = extractField(block, 'campanha');
    const marca = extractField(block, 'marca');
    const segmento = extractField(block, 'segmento');

    const sentences = sinopse.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 20 && /\d/.test(s));

    for (const s of sentences.slice(0, 4)) {
        const nums = s.match(/\d[\d.,]+\s*(%|mil[^\s,.]*|bilh[^\s,.]*|pessoa[^\s,.]*|usu[^\s,.]*|mulher[^\s,.]*|homen[^\s,.]*|crian[^\s,.]*|mort[^\s,.]*|caso[^\s,.]*|vez[^\s,.]*|hora[^\s,.]*|kg|km|litro[^\s,.]*|d.lar[^\s,.]*|euro[^\s,.]*)|\d{4,}/gi);
        if (!nums) continue;
        const rel = nums.filter(n => /[%a-zA-Z]/.test(n) || parseInt(n.replace(/\D/g, '')) >= 1000);
        if (!rel.length) continue;

        rows.push({
            dado: s,
            numeros: rel.join(' | '),
            marca,
            segmento,
            campanha,
            ano,
            premiacao,
            referencia: `CannesFlix — "${campanha}" (${marca}, ${ano}, ${premiacao})`
        });
    }
}

console.log(`Registros com dados: ${goodCount} | Total linhas: ${rows.length}`);
writeFileSync('insights_data.json', JSON.stringify(rows, null, 2));

const esc = s => `"${(s || '').replace(/"/g, '""')}"`;
const header = 'DADO NUMÉRICO,NÚMERO(S),MARCA,SEGMENTO,CAMPANHA,ANO,PREMIAÇÃO,REFERÊNCIA\n';
const csv = rows.map(r => [esc(r.dado), esc(r.numeros), esc(r.marca), esc(r.segmento), esc(r.campanha), esc(r.ano), esc(r.premiacao), esc(r.referencia)].join(','));
writeFileSync('insights_data.csv', '\uFEFF' + header + csv.join('\n'), 'utf8');
console.log('Gerado: insights_data.json e insights_data.csv');
