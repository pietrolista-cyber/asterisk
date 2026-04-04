# Design: Atualização HTML — Login, Sobre e Biblioteca
**Data:** 2026-04-04  
**Projeto:** Asterisk / MoDACoNSUMO  
**Repositório:** github.com/pietrolista-cyber/asterisk

---

## Escopo

Três arquivos HTML precisam ser atualizados e publicados no repositório GitHub:

1. `login.html` — substituir pelo conteúdo Supabase
2. `Sobre/sobre_apple_futurista.html` — já está no GitHub, sem mudanças
3. `Biblioteca/biblioteca.html` — expandir de 8 para 184 estudos

---

## 1. Login (`login.html`)

### O que muda
- O conteúdo de `login.html` é **substituído** pelo conteúdo completo de `login-supabase.html`
- Mantém o filename `login.html` pois todas as páginas já referenciam esse path
- Credenciais Supabase ficam como placeholder (`SEU-PROJETO.supabase.co` / `sua-anon-key-aqui`) — o banner de aviso já está embutido no HTML
- O arquivo `login-supabase.html` é mantido localmente como backup, sem referência na navegação

### Funcionalidades incluídas
- Tabs Login / Criar conta
- Login social: Google + Microsoft (via Supabase OAuth)
- Formulário email + senha com validação
- Recuperação de senha por email
- Redirecionamento para `cerebro.html` após login bem-sucedido
- Mensagens de erro traduzidas para pt-BR

### Commit
- Arquivo: `login.html`
- Push para `origin/main`

---

## 2. Sobre

Nenhuma alteração necessária. `Sobre/sobre_apple_futurista.html` já está rastreado e up to date no repositório.

A navegação nas páginas deve referenciar `Sobre/sobre_apple_futurista.html`.

---

## 3. Biblioteca (`Biblioteca/biblioteca.html`)

### O que muda
O array `ESTUDOS[]` inline (atualmente com 8 estudos hardcoded) é substituído por **184 estudos** gerados a partir do `Biblioteca/acervo_data.js`.

### Estrutura de cada estudo
```js
{
  id: Number,
  titulo: String,        // de acervo_data.js title
  tema: String,          // mapeado de acervo_data.js theme
  fonte: String,         // de acervo_data.js source
  ano: String,           // de acervo_data.js year
  icone: String,         // emoji por categoria
  cor: String,           // cor CSS por categoria
  resumo: String,        // gerado: "Relatório [fonte] sobre [tema/tags]"
  numInsights: Number,   // estimado por categoria
  numSlides: Number,     // fixo: 1
  highlights: String[],  // 3 bullets das tags do acervo
  slides: [{
    num: 1,
    badge: String,       // tema do estudo
    titulo: String,      // título do estudo
    insight: String,     // "Consulte este estudo na íntegra para insights..."
    data: [],
    tags: String[],      // tags do acervo_data.js
    fonte: String        // fonte + ano
  }]
}
```

### Mapeamento de ícones por categoria
| Tema | Ícone | Cor |
|------|-------|-----|
| Consumo / Comportamento | 🛍️ | `--c1` |
| Marketing Digital / Mídia | 📱 | `--c3` |
| Gerações / Gen Z | 👥 | `--c2` |
| Tendências | 🔮 | `--c2` |
| Saúde & Bem-Estar | ❤️ | `--c1` |
| Tecnologia | 🤖 | `--c3` |
| Alimentação | 🍔 | `--c5` |
| Games | 🎮 | `--c4` |
| Pets | 🐾 | `--c4` |
| Fintech / Bancos | 💳 | `--c3` |
| Cannes Lions | 🏆 | `--c5` |
| Sustentabilidade | 🌱 | `--c4` |
| Agências / Campanhas | 🎯 | `--c2` |

### Stats atualizados
- Total de estudos: **184** (dinâmico via `ESTUDOS.length`)
- Total de insights: calculado via `reduce`
- Filtros de fonte e tema: gerados dinamicamente a partir dos dados reais

### O que NÃO muda
- Layout, CSS, lógica de busca/filtro, modal, export CSV — tudo permanece igual
- Nenhum link externo (NotebookLM ou outro) é adicionado

### Commit
- Arquivo: `Biblioteca/biblioteca.html`
- Push para `origin/main`

---

## Ordem de execução

1. Substituir `login.html` → commit + push
2. Expandir `Biblioteca/biblioteca.html` com 184 estudos → commit + push
3. Verificar links de navegação entre páginas

---

## Fora do escopo
- Configuração real das credenciais Supabase (adiado pelo usuário)
- Alterações na página Sobre
