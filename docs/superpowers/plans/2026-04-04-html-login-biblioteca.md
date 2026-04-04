# HTML Login + Biblioteca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir `login.html` pelo conteúdo com Supabase e expandir `biblioteca.html` de 8 para 185 estudos baseados no `acervo_data.js`.

**Architecture:** Dois arquivos HTML são modificados diretamente. O `login.html` recebe o conteúdo completo do `login-supabase.html`. O `biblioteca.html` tem seu array `ESTUDOS[]` inline substituído por 185 entradas geradas a partir do `acervo_data.js`, usando um script Node.js para gerar o JS e colá-lo no HTML.

**Tech Stack:** HTML, CSS, JavaScript inline, Node.js (geração), Supabase JS SDK v2 (login), Git

---

## Mapeamento de arquivos

| Arquivo | Ação |
|---------|------|
| `login.html` | Modificar — substituir conteúdo por login-supabase.html |
| `login-supabase.html` | Manter como backup (sem alteração) |
| `Biblioteca/biblioteca.html` | Modificar — substituir ESTUDOS[] por 185 estudos |
| `Biblioteca/acervo_data.js` | Ler apenas (fonte de dados) |

---

## Task 1: Substituir login.html pelo conteúdo Supabase

**Files:**
- Modify: `login.html` (substituição total de conteúdo)

- [ ] **Step 1: Copiar conteúdo de login-supabase.html para login.html**

```bash
cp "C:/Users/pietr/Cerebro/login-supabase.html" "C:/Users/pietr/Cerebro/login.html"
```

- [ ] **Step 2: Verificar que login.html agora tem o SDK do Supabase**

```bash
grep -c "supabase" "C:/Users/pietr/Cerebro/login.html"
```
Esperado: número maior que 0 (confirma que o SDK está presente)

- [ ] **Step 3: Verificar que o banner de aviso de configuração está presente**

```bash
grep "setup-banner" "C:/Users/pietr/Cerebro/login.html"
```
Esperado: linha com `id="setup-banner"`

- [ ] **Step 4: Commitar e pushar**

```bash
cd "C:/Users/pietr/Cerebro"
git add login.html
git commit -m "feat: login.html agora usa Supabase auth (login/cadastro/OAuth)"
git push origin main
```
Esperado: `main -> main` sem erros

---

## Task 2: Expandir biblioteca.html com 185 estudos

**Files:**
- Modify: `Biblioteca/biblioteca.html` (substituir bloco ESTUDOS[])
- Read: `Biblioteca/acervo_data.js`

### Mapeamento de temas para ícones e cores

| Tema | Ícone | Cor CSS |
|------|-------|---------|
| Consumo | 🛍️ | `var(--c1)` |
| Alimentação | 🍔 | `var(--c5)` |
| Marketing | 📊 | `var(--c3)` |
| Saúde | ❤️ | `var(--c1)` |
| Tecnologia | 🤖 | `var(--c3)` |
| Mídia | 📱 | `var(--c3)` |
| Games | 🎮 | `var(--c4)` |
| Gerações | 👥 | `var(--c2)` |
| Tendências | 🔮 | `var(--c2)` |
| Pets | 🐾 | `var(--c4)` |
| Finanças | 💳 | `var(--c3)` |
| Moda | 👗 | `var(--c2)` |
| Criatividade | 🎯 | `var(--c2)` |

- [ ] **Step 1: Criar script gerador de ESTUDOS[] em Node.js**

Criar o arquivo `Biblioteca/gen_estudos.js` com o seguinte conteúdo:

```js
const fs = require('fs');

// Carregar acervo_data.js
const acervoContent = fs.readFileSync('./acervo_data.js', 'utf8');
eval(acervoContent.replace('const ACERVO', 'global.ACERVO'));

const ICONES = {
  'Consumo':      { icone: '🛍️', cor: 'var(--c1)' },
  'Alimentação':  { icone: '🍔', cor: 'var(--c5)' },
  'Marketing':    { icone: '📊', cor: 'var(--c3)' },
  'Saúde':        { icone: '❤️', cor: 'var(--c1)' },
  'Tecnologia':   { icone: '🤖', cor: 'var(--c3)' },
  'Mídia':        { icone: '📱', cor: 'var(--c3)' },
  'Games':        { icone: '🎮', cor: 'var(--c4)' },
  'Gerações':     { icone: '👥', cor: 'var(--c2)' },
  'Tendências':   { icone: '🔮', cor: 'var(--c2)' },
  'Pets':         { icone: '🐾', cor: 'var(--c4)' },
  'Finanças':     { icone: '💳', cor: 'var(--c3)' },
  'Moda':         { icone: '👗', cor: 'var(--c2)' },
  'Criatividade': { icone: '🎯', cor: 'var(--c2)' },
};

const estudos = ACERVO.map((item, idx) => {
  const { icone, cor } = ICONES[item.theme] || { icone: '📄', cor: 'var(--c2)' };
  const tagsStr = item.tags.join(', ');
  const resumo = `${item.source ? item.source + ' — ' : ''}Estudo sobre ${item.tags.slice(0,3).join(', ')}${item.year ? ' (' + item.year + ')' : ''}.`;

  // Highlights: 3 bullets das tags
  const highlights = [
    `${item.tags[0] || item.theme} — tema central do estudo`,
    `Fonte: ${item.source || 'Referência acadêmica'}${item.year ? ' · ' + item.year : ''}`,
    `Categorias: ${item.tags.slice(0,3).join(' · ')}`,
  ];

  return {
    id: idx + 1,
    titulo: item.title,
    tema: item.theme,
    fonte: item.source || 'Diversas',
    ano: item.year || '—',
    icone,
    cor,
    resumo,
    numInsights: item.tags.length * 2 + 4,
    numSlides: 1,
    highlights,
    slides: [{
      num: 1,
      badge: item.theme,
      titulo: item.title,
      insight: `${item.title} — ${item.source ? 'publicado por ' + item.source : 'estudo de referência'}${item.year ? ' em ' + item.year : ''}. Temas abordados: ${tagsStr}.`,
      data: [],
      tags: item.tags,
      fonte: `${item.source || ''}${item.year ? ' · ' + item.year : ''}`.trim()
    }]
  };
});

const output = 'const ESTUDOS = ' + JSON.stringify(estudos, null, 2) + ';';
fs.writeFileSync('./estudos_generated.js', output);
console.log(`Gerados ${estudos.length} estudos → estudos_generated.js`);
```

- [ ] **Step 2: Rodar o gerador**

```bash
cd "C:/Users/pietr/Cerebro/Biblioteca"
node gen_estudos.js
```
Esperado: `Gerados 185 estudos → estudos_generated.js`

- [ ] **Step 3: Verificar o arquivo gerado**

```bash
head -30 "C:/Users/pietr/Cerebro/Biblioteca/estudos_generated.js"
```
Esperado: início do array `const ESTUDOS = [{ id: 1, titulo: ...`

- [ ] **Step 4: Substituir o bloco ESTUDOS[] no biblioteca.html**

No `Biblioteca/biblioteca.html`, localizar o bloco entre os comentários:
```
// ─────────────────────────────────────────
// BASE DE ESTUDOS
```
e a linha que termina com `];` (linha ~377), seguida de:
```js
let activeFilters = ...
```

Substituir **todo o bloco** `const ESTUDOS = [ ... ];` pelo conteúdo do `estudos_generated.js`.

- [ ] **Step 5: Atualizar os chips de tema na seção de filtros**

No HTML (linha ~213), substituir os chips hardcoded por todos os 13 temas reais. Localizar:
```html
<div class="chips-row" id="chips-temas">
    <button class="chip" onclick="searchBy('tema','Comportamento do Consumidor')">...
    ...
</div>
```

Substituir por:
```html
<div class="chips-row" id="chips-temas">
  <button class="chip" onclick="searchBy('tema','Consumo')"><span>🛍️</span>Consumo</button>
  <button class="chip" onclick="searchBy('tema','Marketing')"><span>📊</span>Marketing</button>
  <button class="chip" onclick="searchBy('tema','Tecnologia')"><span>🤖</span>Tecnologia</button>
  <button class="chip" onclick="searchBy('tema','Saúde')"><span>❤️</span>Saúde</button>
  <button class="chip" onclick="searchBy('tema','Tendências')"><span>🔮</span>Tendências</button>
  <button class="chip" onclick="searchBy('tema','Gerações')"><span>👥</span>Gerações</button>
  <button class="chip" onclick="searchBy('tema','Mídia')"><span>📱</span>Mídia</button>
  <button class="chip" onclick="searchBy('tema','Alimentação')"><span>🍔</span>Alimentação</button>
  <button class="chip" onclick="searchBy('tema','Games')"><span>🎮</span>Games</button>
  <button class="chip" onclick="searchBy('tema','Pets')"><span>🐾</span>Pets</button>
  <button class="chip" onclick="searchBy('tema','Finanças')"><span>💳</span>Finanças</button>
  <button class="chip" onclick="searchBy('tema','Moda')"><span>👗</span>Moda</button>
  <button class="chip" onclick="searchBy('tema','Criatividade')"><span>🎯</span>Criatividade</button>
</div>
```

- [ ] **Step 6: Atualizar o filtro de fontes no select**

Localizar o `<select id="filter-fonte">` (~linha 228) e substituir as `<option>` hardcoded por todas as 49 fontes reais:

```html
<select class="filter-select" id="filter-fonte" onchange="doSearch()">
  <option value="">Todas as fontes</option>
  <option>ABD</option>
  <option>ABRAGAMES</option>
  <option>Acadêmico</option>
  <option>Anistia Internacional</option>
  <option>BARC/TARGIT</option>
  <option>CUFA</option>
  <option>Clickstream</option>
  <option>Deloitte</option>
  <option>Ebit</option>
  <option>Euromonitor</option>
  <option>FTI</option>
  <option>Financial Times</option>
  <option>GWI</option>
  <option>Game XP</option>
  <option>Gartner</option>
  <option>Google</option>
  <option>HubSpot</option>
  <option>Interno</option>
  <option>Kantar</option>
  <option>Lett</option>
  <option>Magazine Luiza</option>
  <option>McKinsey</option>
  <option>Mestre do Adwords</option>
  <option>Ministério da Saúde</option>
  <option>Newzoo</option>
  <option>Ogilvy</option>
  <option>Opinion Research</option>
  <option>OpinionBox</option>
  <option>Pinterest</option>
  <option>PodPesquisa</option>
  <option>PwC</option>
  <option>QSaúde</option>
  <option>Reamp</option>
  <option>Reuters</option>
  <option>SDG</option>
  <option>SEBRAE</option>
  <option>SXSW</option>
  <option>Shutterstock</option>
  <option>Sioux</option>
  <option>TARGIT</option>
  <option>TikTok</option>
  <option>Trend Hunter</option>
  <option>Twitter</option>
  <option>Visa</option>
  <option>WGSN</option>
  <option>WeAreSocial</option>
  <option>Winnin</option>
  <option>YouPix</option>
</select>
```

- [ ] **Step 7: Verificar no browser que os 185 estudos aparecem**

Abrir `Biblioteca/biblioteca.html` no browser. Verificar:
- Contador "Estudos" no stats-bar mostra **185**
- Chips de tema funcionam (clicar num tema filtra os cards)
- Modal abre ao clicar num card
- Busca por texto funciona

- [ ] **Step 8: Remover arquivos temporários e commitar**

```bash
cd "C:/Users/pietr/Cerebro/Biblioteca"
rm gen_estudos.js estudos_generated.js
cd ..
git add Biblioteca/biblioteca.html
git commit -m "feat: biblioteca expandida para 185 estudos do acervo completo"
git push origin main
```
Esperado: `main -> main` sem erros

---

## Task 3: Verificar links de navegação

**Files:**
- Read: `Biblioteca/biblioteca.html`, `login.html`, `Sobre/sobre_apple_futurista.html`, `Cerebro/cerebro.html`

- [ ] **Step 1: Verificar que todas as páginas apontam para `login.html`**

```bash
cd "C:/Users/pietr/Cerebro"
grep -rn "login" --include="*.html" | grep "href" | grep -v "login-supabase"
```
Esperado: todas as referências apontam para `login.html` (sem `login-supabase.html`)

- [ ] **Step 2: Verificar que a nav da Biblioteca aponta para `sobre_apple_futurista.html`**

```bash
grep "sobre" "C:/Users/pietr/Cerebro/Biblioteca/biblioteca.html"
```
Esperado: `../Sobre/sobre_apple_futurista.html`

- [ ] **Step 3: Se houver links errados, corrigir e commitar**

```bash
cd "C:/Users/pietr/Cerebro"
git add -A
git commit -m "fix: corrige links de navegação entre páginas"
git push origin main
```
