const fs = require('fs');
const content = fs.readFileSync('CannesFlix/cannes_cerebro_fixed.html', 'utf8');

const findField = (text, field) => {
    const pattern = new RegExp('"' + field + '":"((?:[^"\\]|\\.)*)"');
    const m = text.match(pattern);
    return m ? m[1].replace(/\\"/g, '"').replace(/\n/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#\d+;/g, '').replace(/&#x[0-9a-f]+;/gi, '') : '';
};

const recordSplit = content.split(/(?=\{"ano":")/);
let insightRows = [];
let processedCount = 0;

for (const block of recordSplit) {
    if (!block.includes('"sinopse"')) continue;

    const ano = findField(block, 'ano');
    const premiacao = findField(block, 'premiacao');
    const campanha = findField(block, 'campanha');
    const marca = findField(block, 'marca');
    const segmento = findField(block, 'segmento');
    const sinopse = findField(block, 'sinopse');

    const isPlaceholder = !sinopse ||
        sinopse.includes('Aproveite v\u00eddeos e m\u00fasicas') ||
        sinopse.includes('Uso do artigo definido') ||
        sinopse.includes('Art Direction, Graphic Design') ||
        sinopse.includes('CP-1252') || sinopse.includes('UTF-8') ||
        sinopse.includes('Lu Xun') || sinopse.includes('SECOP') ||
        sinopse.length < 60;

    if (isPlaceholder) continue;

    const numericTest = /\d[\d.,]*\s*(%|mil(?:h[oõ]es?|hares?)?|bilh[oõ]es?|pessoas?|usu[aá]rios?|mulheres?|homens?|crian[cç]as?|mortes?|casos?|vezes?|anos?|dias?|horas?|kg|km|litros?|reais|d[oó]lares?|euros?)|\d{4,}|\d+\s*(de cada|em cada)/i;
    if (!numericTest.test(sinopse)) continue;
    processedCount++;

    const sentences = sinopse.replace(/\n/g, '. ').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && /\d/.test(s));

    for (const sentence of sentences.slice(0, 4)) {
        const nums = sentence.match(/\d[\d.,]*\s*(%|mil(?:h[oõ]es?|hares?)?|bilh[oõ]es?|pessoas?|usu[aá]rios?|mulheres?|homens?|crian[cç]as?|mortes?|casos?|vezes?|anos?|dias?|horas?|kg|km|litros?|reais|d[oó]lares?|euros?)|\d{4,}|\d+\s*(de cada|em cada)/gi);
        if (!nums || !nums.length) continue;

        const relevantNums = nums.filter(n => /[%a-zA-Z+]/.test(n) || parseInt(n.replace(/\D/g,'')) >= 1000);
        if (!relevantNums.length) continue;

        insightRows.push({
            dado: sentence,
            numeros: relevantNums.join(' | '),
            marca: marca || 'N/D',
            segmento: segmento || 'N/D',
            campanha: campanha || 'N/D',
            ano: ano || 'N/D',
            premiacao: premiacao || 'N/D',
            referencia: 'CannesFlix — "' + campanha + '" (' + marca + ', ' + ano + ', ' + premiacao + ')'
        });
    }
}

console.log('Registros com dados: ' + processedCount);
console.log('Total linhas: ' + insightRows.length);

fs.writeFileSync('insights_data.json', JSON.stringify(insightRows, null, 2));

const escape = s => '"' + (s||'').replace(/"/g, '""') + '"';
const csvHeader = 'DADO NUMÉRICO,NÚMERO(S),MARCA,SEGMENTO,CAMPANHA,ANO,PREMIAÇÃO,REFERÊNCIA\n';
const csvRows = insightRows.map(r => [escape(r.dado), escape(r.numeros), escape(r.marca), escape(r.segmento), escape(r.campanha), escape(r.ano), escape(r.premiacao), escape(r.referencia)].join(','));
fs.writeFileSync('insights_data.csv', '\uFEFF' + csvHeader + csvRows.join('\n'), 'utf8');
console.log('Gerado: insights_data.json e insights_data.csv');
