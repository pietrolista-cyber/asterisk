# Correções v2 — Asterisk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar 15 correções de qualidade (Lucide icons, login modal, navbar mobile, layout biblioteca, remoção de MoDACoNSUMO) em 5 arquivos HTML do projeto Asterisk.

**Architecture:** Cada arquivo HTML recebe o mesmo conjunto de patches reutilizáveis: CDN Lucide no `<head>`, CSS de ícones, modal de login, botão fechar no drawer mobile, CSS padronizado de navbar mobile, e correções de JS. A biblioteca tem redesign completo do layout (Correção 7). Arquivos modificados individualmente por task, cada um commitado separadamente.

**Tech Stack:** HTML/CSS/JS inline, Lucide Icons (CDN), Git

---

## Mapeamento de arquivos

| Arquivo | Correções | Notas |
|---------|-----------|-------|
| `Cerebro/cerebro.html` | 0,1,2,3,6,9,10,11,12,13,14,15 | Maior task — inclui chips emoji→Lucide |
| `Insight/insight.html` | 0,1,4,6,13,14 | |
| `Biblioteca/biblioteca.html` | 0,1,5,6,7,12 | Correção 7 = redesign completo |
| `CannesFlix/cannes_cerebro_fixed.html` | 0,1 | Menor task |
| `Sobre/sobre.html` | self-link fix | Lucide e modal já existem |

### Paths relativos importantes

`Cerebro/cerebro.html` está em subpasta → usa `../`:
- Logo: `../CannesFlix/ASTERISK LOGO.png`
- Sobre: `../Sobre/sobre.html`
- Biblioteca: `../Biblioteca/biblioteca.html`
- CannesFlix: `../CannesFlix/cannes_cerebro_fixed.html`
- Insight: `../Insight/insight.html`
- acervo_data.js: `../Biblioteca/acervo_data.js`

---

## Bloco reutilizável: CSS Lucide

Adicionar dentro do `<style>` de **cada** arquivo (exceto `Sobre/sobre.html` que já tem):

```css
i[data-lucide]{display:inline-flex;width:16px;height:16px;stroke-width:1.75;vertical-align:middle;flex-shrink:0}
.chip i[data-lucide]{width:14px;height:14px}
.map-card-icon i[data-lucide],.card-wide-icon i[data-lucide]{width:22px;height:22px}
```

## Bloco reutilizável: CSS navbar mobile (Correção 6)

Substituir o `@media(max-width:768px)` do nav em cada arquivo por:

```css
@media(max-width:768px){
  .global-nav{padding:0 16px !important}
  .nav-divider{display:none}
  .nav-login{display:none}
  .nav-burger{display:flex}
  .nav-links{
    display:none;
    position:fixed;
    top:0;left:0;right:0;bottom:0;
    flex-direction:column;
    gap:2px;
    background:rgba(4,4,12,.97);
    backdrop-filter:blur(48px) saturate(200%);
    -webkit-backdrop-filter:blur(48px) saturate(200%);
    padding:16px;
    padding-top:max(16px, env(safe-area-inset-top));
    padding-bottom:max(24px, env(safe-area-inset-bottom));
    z-index:100;
    overflow-y:auto;
  }
  .nav-links.open{display:flex}
  .nav-link{
    font-size:16px;font-weight:600;padding:16px 20px;
    border-radius:14px;color:rgba(245,245,247,.55);
    letter-spacing:.03em;min-height:52px;
    display:flex;align-items:center;
  }
  .nav-link.active{color:#fff;background:rgba(255,255,255,.07)}
  .nav-link:hover{color:#fff;background:rgba(255,255,255,.05)}
}
```

## Bloco reutilizável: CSS nav-mobile-close

```css
.nav-mobile-close{display:none;align-items:center;gap:8px;padding:14px 20px;background:none;border:none;color:rgba(245,245,247,.45);font-size:13px;font-weight:600;letter-spacing:.06em;cursor:pointer;border-radius:14px;font-family:inherit;margin-bottom:8px;width:100%;text-align:left}
@media(max-width:768px){.nav-mobile-close{display:flex}}
```

## Bloco reutilizável: Modal de Login HTML

Adicionar antes do `</body>` (em cada arquivo):

```html
<div id="login-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <button class="modal-close" onclick="closeLoginModal()" aria-label="Fechar">
      <i data-lucide="x"></i>
    </button>
    <div class="modal-logo"><i data-lucide="sparkles"></i></div>
    <h2 class="modal-title" id="modal-title">Entrar no Asterisk</h2>
    <p class="modal-sub">Acesso antecipado — lista de espera aberta</p>
    <input type="email" id="modal-email" placeholder="seu@email.com" class="modal-input" autocomplete="email"/>
    <button class="modal-btn" onclick="submitWaitlist()">
      Entrar na lista de espera <i data-lucide="arrow-right"></i>
    </button>
  </div>
</div>
<script>lucide.createIcons();</script>
```

## Bloco reutilizável: CSS Modal de Login

```css
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.open{display:flex;animation:float-in .3s ease}
.modal-box{background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px 36px;max-width:400px;width:100%;position:relative}
.modal-close{position:absolute;top:16px;right:16px;color:rgba(245,245,247,.35);background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;transition:color .2s;display:flex;align-items:center}
.modal-close:hover{color:#fff}
.modal-logo{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.modal-logo i[data-lucide]{width:22px;height:22px;color:#fff}
.modal-title{font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-sub{font-size:13px;color:var(--t3,rgba(245,245,247,.32));margin-bottom:24px;line-height:1.5}
.modal-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:#f5f5f7;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s;font-family:inherit}
.modal-input:focus{border-color:rgba(191,90,242,.5)}
.modal-btn{width:100%;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}
.modal-btn:hover{opacity:.85}
.modal-btn i[data-lucide]{width:14px;height:14px}
@media(max-width:480px){.modal-box{padding:28px 20px;border-radius:20px}}
```

## Bloco reutilizável: JS Modal de Login

Adicionar dentro do `<script>` principal de cada arquivo:

```js
function openLoginModal(){
  document.getElementById('login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-email').focus(),100);
}
function closeLoginModal(){
  document.getElementById('login-modal').classList.remove('open');
}
function submitWaitlist(){
  const email=document.getElementById('modal-email').value;
  if(!email||!email.includes('@')) return;
  document.querySelector('.modal-btn').textContent='Recebido! Em breve.';
  setTimeout(closeLoginModal,1800);
}
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLoginModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeLoginModal();
});
```

---

## Task 1: cerebro.html — todas as correções

**Files:**
- Modify: `Cerebro/cerebro.html`

- [ ] **Step 1: Adicionar Lucide CDN no `<head>`**

Localizar a última linha do `<head>` (antes de `<style>`) e adicionar:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

- [ ] **Step 2: Adicionar CSS Lucide no `<style>`**

Adicionar no topo do bloco `<style>` (após `:root{...}`):
```css
i[data-lucide]{display:inline-flex;width:16px;height:16px;stroke-width:1.75;vertical-align:middle;flex-shrink:0}
.chip i[data-lucide]{width:14px;height:14px}
.map-card-icon i[data-lucide],.card-wide-icon i[data-lucide]{width:22px;height:22px}
```

- [ ] **Step 3: Adicionar CSS do modal de login**

Adicionar no `<style>` (após o CSS Lucide):
```css
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.open{display:flex;animation:float-in .3s ease}
.modal-box{background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px 36px;max-width:400px;width:100%;position:relative}
.modal-close{position:absolute;top:16px;right:16px;color:rgba(245,245,247,.35);background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;transition:color .2s;display:flex;align-items:center}
.modal-close:hover{color:#fff}
.modal-logo{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.modal-logo i[data-lucide]{width:22px;height:22px;color:#fff}
.modal-title{font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-sub{font-size:13px;color:var(--t3);margin-bottom:24px;line-height:1.5}
.modal-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:#f5f5f7;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s;font-family:inherit}
.modal-input:focus{border-color:rgba(191,90,242,.5)}
.modal-btn{width:100%;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}
.modal-btn:hover{opacity:.85}
.modal-btn i[data-lucide]{width:14px;height:14px}
@media(max-width:480px){.modal-box{padding:28px 20px;border-radius:20px}}
```

- [ ] **Step 4: Adicionar CSS nav-mobile-close e atualizar media query mobile do nav**

No `<style>`, adicionar após `.nav-burger`:
```css
.nav-logo-link{display:flex;align-items:center;margin-right:12px;flex-shrink:0;text-decoration:none}
.nav-logo-img{height:32px;width:auto;filter:brightness(0) invert(1);opacity:.9;transition:opacity .2s}
.nav-logo-img:hover{opacity:1}
.nav-mobile-close{display:none;align-items:center;gap:8px;padding:14px 20px;background:none;border:none;color:rgba(245,245,247,.45);font-size:13px;font-weight:600;letter-spacing:.06em;cursor:pointer;border-radius:14px;font-family:inherit;margin-bottom:8px;width:100%;text-align:left}
```

Localizar o bloco `@media(max-width:768px)` que contém `.nav-links` e `.nav-login` e substituir por:
```css
@media(max-width:768px){
  .global-nav{padding:0 16px !important}
  .nav-divider{display:none}
  .nav-login{display:none}
  .nav-burger{display:flex}
  .nav-logo-img{height:28px}
  .nav-mobile-close{display:flex}
  .nav-links{
    display:none;
    position:fixed;
    top:0;left:0;right:0;bottom:0;
    flex-direction:column;
    gap:2px;
    background:rgba(4,4,12,.97);
    backdrop-filter:blur(48px) saturate(200%);
    -webkit-backdrop-filter:blur(48px) saturate(200%);
    padding:16px;
    padding-top:max(16px, env(safe-area-inset-top));
    padding-bottom:max(24px, env(safe-area-inset-bottom));
    z-index:100;
    overflow-y:auto;
  }
  .nav-links.open{display:flex}
  .nav-link{
    font-size:16px;font-weight:600;padding:16px 20px;
    border-radius:14px;color:rgba(245,245,247,.55);
    letter-spacing:.03em;min-height:52px;
    display:flex;align-items:center;
  }
  .nav-link.active{color:#fff;background:rgba(255,255,255,.07)}
  .nav-link:hover{color:#fff;background:rgba(255,255,255,.05)}
  .chip{min-height:44px;padding:0 14px;display:inline-flex;align-items:center}
}
```

- [ ] **Step 5: Substituir o bloco `<nav class="global-nav">` completo**

Localizar:
```html
<nav class="global-nav">
  <div class="nav-links" id="nav-links">
```
até o `</nav>` correspondente e substituir por:
```html
<nav class="global-nav">
  <a href="cerebro.html" class="nav-logo-link" aria-label="Asterisk — início">
    <img src="../CannesFlix/ASTERISK LOGO.png" alt="Asterisk" class="nav-logo-img">
  </a>
  <div class="nav-links" id="nav-links">
    <button class="nav-mobile-close" onclick="toggleNav()" aria-label="Fechar menu">
      <i data-lucide="x"></i> Fechar
    </button>
    <a href="cerebro.html" class="nav-link active">Cérebro</a>
    <a href="../CannesFlix/cannes_cerebro_fixed.html" class="nav-link">CannesFlix</a>
    <a href="../Insight/insight.html" class="nav-link">Insight</a>
    <a href="../Biblioteca/biblioteca.html" class="nav-link">Biblioteca</a>
    <a href="../Sobre/sobre.html" class="nav-link">Sobre</a>
  </div>
  <div class="nav-divider"></div>
  <button class="nav-login" onclick="openLoginModal()">Login</button>
  <button class="nav-burger" id="nav-burger" onclick="toggleNav()" aria-label="Abrir menu">
    <span></span><span></span><span></span>
  </button>
</nav>
```

- [ ] **Step 6: Substituir os chips de emoji por ícones Lucide**

Cada chip tem `<span class="chip-emoji">EMOJI</span>`. Substituir todos usando este mapeamento:
```
🐾 → <i data-lucide="paw-print" aria-hidden="true"></i>
🍔 → <i data-lucide="utensils" aria-hidden="true"></i>
🍺 → <i data-lucide="beer" aria-hidden="true"></i>
👗 → <i data-lucide="shirt" aria-hidden="true"></i>
💻 → <i data-lucide="laptop" aria-hidden="true"></i>
🎮 → <i data-lucide="gamepad-2" aria-hidden="true"></i>
🧠 → <i data-lucide="brain" aria-hidden="true"></i>
💸 → <i data-lucide="landmark" aria-hidden="true"></i>
👾 → <i data-lucide="users" aria-hidden="true"></i>
🔭 → <i data-lucide="telescope" aria-hidden="true"></i>
📱 → <i data-lucide="smartphone" aria-hidden="true"></i>
🛒 → <i data-lucide="shopping-cart" aria-hidden="true"></i>
🌱 → <i data-lucide="leaf" aria-hidden="true"></i>
🏅 → <i data-lucide="medal" aria-hidden="true"></i>
🎬 → <i data-lucide="clapperboard" aria-hidden="true"></i>
✈️ → <i data-lucide="plane" aria-hidden="true"></i>
🌈 → <i data-lucide="heart-handshake" aria-hidden="true"></i>
🚗 → <i data-lucide="car" aria-hidden="true"></i>
```

Remover a tag `<span class="chip-emoji">` e substituir por `<i data-lucide="...">` diretamente dentro do `<button class="chip">`.

Exemplo — DE:
```html
<button class="chip" data-topic="pets" onclick="selectChip(this)"><span class="chip-emoji">🐾</span>Pets & Animais</button>
```
PARA:
```html
<button class="chip" data-topic="pets" onclick="selectChip(this)"><i data-lucide="paw-print" aria-hidden="true"></i>Pets & Animais</button>
```

- [ ] **Step 7: Adicionar null guard ao toggleNav() e scroll-padding-top**

Localizar:
```js
function toggleNav(){
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('nav-burger');
  links.classList.toggle('open');
  burger.classList.toggle('open');
}
```
Substituir por:
```js
function toggleNav(){
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('nav-burger');
  if(links) links.classList.toggle('open');
  if(burger) burger.classList.toggle('open');
}
```

Adicionar no CSS (na regra `html` ou no topo de `<style>`):
```css
html{scroll-padding-top:260px}
```

- [ ] **Step 8: Corrigir showResult() e selectChip()**

Localizar:
```js
function showResult(topic){
```
Substituir por:
```js
function showResult(topic, displayText){
  const _text = displayText || document.getElementById('chat-input').value || 'Quero pesquisar sobre ' + topic.label;
```

E na linha dentro de showResult que monta o `userMsg.innerHTML`, substituir:
```js
userMsg.innerHTML = `<div class="msg-user-bubble">${document.getElementById('chat-input').value || 'Quero pesquisar sobre ' + topic.label}</div>`;
```
Por:
```js
userMsg.innerHTML = `<div class="msg-user-bubble">${_text}</div>`;
```

E a linha `scrollIntoView`:
```js
setTimeout(() => botMsg.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
```
Por:
```js
setTimeout(() => botMsg.scrollIntoView({ behavior:'smooth', block:'nearest' }), 80);
```

Localizar em `selectChip()`:
```js
showResult(topic);
```
Substituir por:
```js
showResult(topic, 'Quero pesquisar sobre ' + topic.label);
```

- [ ] **Step 9: Mover acervo_data.js para antes do </body> com fallback**

Localizar no `<head>`:
```html
<script src="Biblioteca/acervo_data.js"></script>
```
Remover essa linha do `<head>` e adicionar antes do `</body>`:
```html
<script src="../Biblioteca/acervo_data.js" onerror="window.ACERVO=[]"></script>
```

- [ ] **Step 10: Remover MoDACoNSUMO — title, hero e map-card**

Localizar e substituir:
```html
<title>Cérebro — Asterisk · MoDACoNSUMO</title>
```
Por:
```html
<title>Cérebro — Asterisk</title>
```

Localizar:
```html
<div class="hero-eyebrow">MoDACoNSUMO · Asterisk</div>
```
Por:
```html
<div class="hero-eyebrow">Asterisk</div>
```

Localizar a `<p class="map-card-desc">` que contém "MoDACoNSUMO":
```html
<p class="map-card-desc">Identidade completa da Asterisk e do MoDACoNSUMO. Posicionamento, linha editorial, tom de voz e os princípios que guiam cada peça publicada.</p>
```
Por:
```html
<p class="map-card-desc">Identidade completa da Asterisk. Posicionamento, linha editorial, tom de voz e os princípios que guiam cada peça publicada.</p>
```

- [ ] **Step 11: Adicionar aria-label e autocomplete (Correção 14)**

Localizar o input `id="chat-input"` e adicionar `autocomplete="off" spellcheck="false"`.
Localizar o botão de busca e adicionar `aria-label="Pesquisar território"`.

- [ ] **Step 12: Adicionar modal HTML e JS antes do </body>**

Adicionar antes do `</body>` (antes do script acervo_data que foi movido):
```html
<div id="login-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <button class="modal-close" onclick="closeLoginModal()" aria-label="Fechar">
      <i data-lucide="x"></i>
    </button>
    <div class="modal-logo"><i data-lucide="sparkles"></i></div>
    <h2 class="modal-title" id="modal-title">Entrar no Asterisk</h2>
    <p class="modal-sub">Acesso antecipado — lista de espera aberta</p>
    <input type="email" id="modal-email" placeholder="seu@email.com" class="modal-input" autocomplete="email"/>
    <button class="modal-btn" onclick="submitWaitlist()">
      Entrar na lista de espera <i data-lucide="arrow-right"></i>
    </button>
  </div>
</div>
```

No `<script>` principal, adicionar as funções do modal:
```js
function openLoginModal(){
  document.getElementById('login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-email').focus(),100);
}
function closeLoginModal(){
  document.getElementById('login-modal').classList.remove('open');
}
function submitWaitlist(){
  const email=document.getElementById('modal-email').value;
  if(!email||!email.includes('@')) return;
  document.querySelector('.modal-btn').textContent='Recebido! Em breve.';
  setTimeout(closeLoginModal,1800);
}
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLoginModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeLoginModal();
});
```

Adicionar `<script>lucide.createIcons();</script>` como última linha antes de `</body>`.

- [ ] **Step 13: Verificar com grep**

```bash
grep -c "data-lucide" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
grep "MoDACoNSUMO" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
grep "sobre_apple" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
grep "openLoginModal" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
grep "login-modal" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
grep "nav-mobile-close" C:/Users/pietr/Cerebro/Cerebro/cerebro.html
```
Esperado: `data-lucide` count > 20; MoDACoNSUMO = 0 resultados; sobre_apple = 0; openLoginModal > 0; login-modal > 0; nav-mobile-close > 0.

- [ ] **Step 14: Commit**

```bash
cd "C:/Users/pietr/Cerebro"
git add Cerebro/cerebro.html
git commit -m "feat: cerebro.html — Lucide icons, login modal, nav mobile, remove MoDACoNSUMO"
git push origin main
```

---

## Task 2: insight.html — Correções 0, 1, 4, 6, 13, 14

**Files:**
- Modify: `Insight/insight.html`

- [ ] **Step 1: Adicionar Lucide CDN no `<head>`**

Antes de `<style>` no `<head>`:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

- [ ] **Step 2: Adicionar CSS Lucide + modal + nav-mobile-close no `<style>`**

```css
i[data-lucide]{display:inline-flex;width:16px;height:16px;stroke-width:1.75;vertical-align:middle;flex-shrink:0}
.chip i[data-lucide]{width:14px;height:14px}
.nav-mobile-close{display:none;align-items:center;gap:8px;padding:14px 20px;background:none;border:none;color:rgba(245,245,247,.45);font-size:13px;font-weight:600;cursor:pointer;border-radius:14px;font-family:inherit;width:100%;margin-bottom:8px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.open{display:flex}
.modal-box{background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px 36px;max-width:400px;width:100%;position:relative}
.modal-close{position:absolute;top:16px;right:16px;color:rgba(245,245,247,.35);background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;display:flex;align-items:center}
.modal-close:hover{color:#fff}
.modal-logo{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.modal-logo i[data-lucide]{width:22px;height:22px;color:#fff}
.modal-title{font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-sub{font-size:13px;color:rgba(245,245,247,.32);margin-bottom:24px;line-height:1.5}
.modal-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:#f5f5f7;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s;font-family:inherit}
.modal-input:focus{border-color:rgba(191,90,242,.5)}
.modal-btn{width:100%;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}
.modal-btn:hover{opacity:.85}
.modal-btn i[data-lucide]{width:14px;height:14px}
@media(max-width:480px){.modal-box{padding:28px 20px;border-radius:20px}}
```

- [ ] **Step 3: Atualizar media query mobile do nav (Correção 6)**

Localizar o bloco `@media(max-width:768px){` que contém `.nav-links,.nav-divider,.nav-login{display:none}` e substituir por:
```css
@media(max-width:768px){
  .global-nav{padding:0 16px !important}
  .nav-divider{display:none}
  .nav-login{display:none}
  .nav-burger{display:flex}
  .nav-mobile-close{display:flex}
  .nav-links{
    display:none;
    position:fixed;
    top:0;left:0;right:0;bottom:0;
    flex-direction:column;
    gap:2px;
    background:rgba(4,4,12,.97);
    backdrop-filter:blur(48px) saturate(200%);
    -webkit-backdrop-filter:blur(48px) saturate(200%);
    padding:16px;
    padding-top:max(16px, env(safe-area-inset-top));
    padding-bottom:max(24px, env(safe-area-inset-bottom));
    z-index:100;
    overflow-y:auto;
  }
  .nav-links.open{display:flex}
  .nav-link{
    font-size:16px;font-weight:600;padding:16px 20px;
    border-radius:14px;color:rgba(245,245,247,.55);
    letter-spacing:.03em;min-height:52px;
    display:flex;align-items:center;
  }
  .nav-link.active{color:#fff;background:rgba(255,255,255,.07)}
  .nav-link:hover{color:#fff;background:rgba(255,255,255,.05)}
  .chip{min-height:44px;padding:0 14px;display:inline-flex;align-items:center}
}
```

- [ ] **Step 4: Substituir link login por botão e adicionar close button no drawer**

Localizar `<a href="login.html" class="nav-login">Login</a>` e substituir por:
```html
<button class="nav-login" onclick="openLoginModal()">Login</button>
```

Dentro do `<div class="nav-links" id="nav-links">`, adicionar como PRIMEIRO filho:
```html
<button class="nav-mobile-close" onclick="toggleNav()" aria-label="Fechar menu">
  <i data-lucide="x"></i> Fechar
</button>
```

Corrigir o link do Sobre de `sobre_apple_futurista.html` para `sobre.html`:
```html
<a href="Sobre/sobre.html" class="nav-link">Sobre</a>
```

- [ ] **Step 5: Adicionar autocomplete e aria-label (Correção 14)**

Localizar o `input` de busca e adicionar `autocomplete="off" spellcheck="false"`.
Localizar `.search-btn` e adicionar `aria-label="Pesquisar"`.

- [ ] **Step 6: Adicionar modal HTML e JS antes do `</body>`**

```html
<div id="login-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <button class="modal-close" onclick="closeLoginModal()" aria-label="Fechar">
      <i data-lucide="x"></i>
    </button>
    <div class="modal-logo"><i data-lucide="sparkles"></i></div>
    <h2 class="modal-title" id="modal-title">Entrar no Asterisk</h2>
    <p class="modal-sub">Acesso antecipado — lista de espera aberta</p>
    <input type="email" id="modal-email" placeholder="seu@email.com" class="modal-input" autocomplete="email"/>
    <button class="modal-btn" onclick="submitWaitlist()">
      Entrar na lista de espera <i data-lucide="arrow-right"></i>
    </button>
  </div>
</div>
```

No `<script>` existente, antes do `}` final, adicionar:
```js
function openLoginModal(){
  document.getElementById('login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-email').focus(),100);
}
function closeLoginModal(){
  document.getElementById('login-modal').classList.remove('open');
}
function submitWaitlist(){
  const email=document.getElementById('modal-email').value;
  if(!email||!email.includes('@')) return;
  document.querySelector('.modal-btn').textContent='Recebido! Em breve.';
  setTimeout(closeLoginModal,1800);
}
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLoginModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeLoginModal();
});
```

Adicionar `<script>lucide.createIcons();</script>` como última linha antes de `</body>`.

- [ ] **Step 7: Verificar**

```bash
grep "login-modal\|openLoginModal\|nav-mobile-close\|sobre_apple\|data-lucide" C:/Users/pietr/Cerebro/Insight/insight.html | head -10
```
Esperado: resultados para cada termo exceto sobre_apple (0 resultados).

- [ ] **Step 8: Commit**

```bash
cd "C:/Users/pietr/Cerebro"
git add Insight/insight.html
git commit -m "feat: insight.html — Lucide, login modal, nav mobile, drawer close"
git push origin main
```

---

## Task 3: biblioteca.html — Correções 0, 1, 5, 6, 7, 12

**Files:**
- Modify: `Biblioteca/biblioteca.html`

Esta task inclui a Correção 7 — redesign completo do layout da Biblioteca para o padrão do Insight (lista vertical em vez de grid). O array ESTUDOS[] gerado na sessão anterior é mantido; apenas o HTML/CSS de exibição muda. A lógica de busca doSearch() é preservada; adicionamos filterBy() como alias.

- [ ] **Step 1: Adicionar Lucide CDN no `<head>`**

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

- [ ] **Step 2: Substituir todo o bloco CSS na `<style>` (preserve apenas :root e o ESTUDOS data)**

Manter o `:root{...}` existente. Substituir **todos os outros blocos CSS** (nav, page, cards, modal, etc.) por este CSS atualizado:

```css
*,*:before,*:after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
i[data-lucide]{display:inline-flex;width:16px;height:16px;stroke-width:1.75;vertical-align:middle;flex-shrink:0}
.chip i[data-lucide]{width:14px;height:14px}
.orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;}
.orb1{width:600px;height:600px;top:-200px;left:-200px;background:radial-gradient(circle,rgba(255,31,142,.18),transparent 70%);}
.orb2{width:500px;height:500px;bottom:-100px;right:-100px;background:radial-gradient(circle,rgba(10,132,255,.15),transparent 70%);}
.orb3{width:400px;height:400px;top:40%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(191,90,242,.1),transparent 70%);}
.global-nav{position:sticky;top:0;z-index:60;height:var(--nav-h);display:flex;align-items:center;padding:0 24px;gap:12px;background:rgba(5,5,9,.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.nav-logo img{height:28px;width:auto;}
.nav-links{display:flex;align-items:center;gap:4px;flex:1;}
.nav-link{padding:6px 12px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;color:var(--muted);transition:.2s;}
.nav-link:hover{color:var(--text);background:var(--surface);}
.nav-link.active{color:#fff;background:linear-gradient(135deg,rgba(255,31,142,.2),rgba(191,90,242,.2));border:1px solid rgba(255,31,142,.3);}
.nav-divider{width:1px;height:20px;background:var(--border);}
.nav-login{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--c1),var(--c2));border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;margin-left:auto;}
.nav-burger span{display:block;width:22px;height:2px;background:var(--text);transition:.3s;}
.nav-mobile-close{display:none;align-items:center;gap:8px;padding:14px 20px;background:none;border:none;color:rgba(245,245,247,.45);font-size:13px;font-weight:600;cursor:pointer;border-radius:14px;font-family:'Space Grotesk',sans-serif;width:100%;margin-bottom:8px;}
.page{position:relative;z-index:1;min-height:calc(100vh - 52px);display:flex;flex-direction:column;max-width:900px;margin:0 auto;padding:40px 24px 80px;}
.page-header{margin-bottom:40px;}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--c2);margin-bottom:14px;}
.page-header h1{font-size:clamp(32px,5vw,56px);font-weight:900;letter-spacing:-.02em;line-height:1.05;margin-bottom:14px;}
.page-header p{font-size:15px;color:var(--muted);line-height:1.7;max-width:580px;}
.stats-bar{display:flex;gap:16px;margin-bottom:40px;flex-wrap:wrap;}
.stat{padding:14px 20px;background:var(--surface);border:1px solid var(--border);border-radius:14px;min-width:80px;}
.stat-num{font-family:'Space Mono',monospace;font-size:22px;font-weight:800;letter-spacing:-.01em;line-height:1;color:var(--c1);}
.stat-label{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:4px;}
.search-wrap{position:relative;margin-bottom:24px;}
.search-input{width:100%;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:16px;padding:16px 52px 16px 48px;color:var(--text);font-size:15px;outline:none;transition:border-color .2s;font-family:'Space Grotesk',sans-serif;}
.search-input:focus{border-color:rgba(191,90,242,.5);}
.search-input::placeholder{color:var(--muted);}
.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--muted);pointer-events:none;}
.search-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:36px;height:36px;background:linear-gradient(135deg,var(--c1),var(--c2));border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;}
.search-btn i[data-lucide]{width:16px;height:16px;}
.chips-label{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}
.chips-wrapper{position:relative;margin-bottom:28px;}
.chips-row{display:flex;flex-wrap:wrap;gap:8px;}
.chip{padding:7px 14px;background:var(--surface);border:1px solid var(--border);border-radius:20px;color:var(--muted);font-size:11px;font-weight:600;letter-spacing:.06em;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-family:'Space Grotesk',sans-serif;}
.chip:hover{background:rgba(255,255,255,.1);color:#fff;}
.chip.active{background:linear-gradient(135deg,rgba(255,31,142,.15),rgba(191,90,242,.15));border-color:rgba(191,90,242,.4);color:#fff;}
.results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.results-count{font-family:'Space Mono',monospace;font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.06em;}
.results-count strong{color:var(--c1);}
.export-btn{padding:8px 16px;background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:11px;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:.2s;display:flex;align-items:center;gap:6px;}
.export-btn:hover{color:var(--text);border-color:rgba(255,255,255,.3);}
.results-grid{display:flex;flex-direction:column;gap:10px;}
.result-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px 22px;transition:all .25s cubic-bezier(.34,1.56,.64,1);cursor:pointer;}
.result-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14);transform:translateY(-2px);}
.card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.card-source-badge{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:linear-gradient(135deg,rgba(255,31,142,.12),rgba(191,90,242,.12));border:1px solid rgba(191,90,242,.25);color:#d18fff;}
.card-year{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:.08em;margin-left:auto;}
.card-title{font-size:15px;font-weight:700;color:var(--text);line-height:1.45;margin-bottom:12px;}
.card-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.tag-ref{background:rgba(191,90,242,.1);color:#d18fff;border:1px solid rgba(191,90,242,.2);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:100px;cursor:pointer;transition:.2s;}
.tag-ref:hover{background:rgba(191,90,242,.2);}
.card-cta{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--muted);text-decoration:none;padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);transition:all .2s;cursor:pointer;font-family:'Space Grotesk',sans-serif;}
.card-cta:hover{color:#fff;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08);}
.card-cta i[data-lucide]{width:13px;height:13px;}
.empty{text-align:center;padding:80px 20px;color:var(--muted);}
.empty-icon{font-size:48px;margin-bottom:16px;}
.empty h3{font-size:18px;color:var(--text);margin-bottom:8px;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:200;display:none;align-items:center;justify-content:center;padding:20px;}
.modal-overlay.open{display:flex;}
.modal{background:#0c0c18;border:1px solid rgba(255,255,255,.12);border-radius:28px;width:100%;max-width:860px;max-height:90vh;overflow-y:auto;position:relative;}
.modal-close-detail{position:absolute;top:20px;right:20px;width:38px;height:38px;border:none;background:rgba(255,255,255,.08);border-radius:12px;color:var(--muted);font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;z-index:10;}
.modal-close-detail:hover{background:rgba(255,31,142,.15);color:#fff;}
.modal-cover{height:160px;background:linear-gradient(135deg,rgba(255,31,142,.15),rgba(191,90,242,.15),rgba(10,132,255,.1));display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:24px 28px;border-radius:28px 28px 0 0;}
.modal-badge{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:4px 12px;border-radius:100px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;margin-bottom:10px;display:inline-block;}
.modal-cover h2{font-size:clamp(16px,3vw,22px);font-weight:800;line-height:1.2;}
.modal-body{padding:24px 28px;}
.modal-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.tag{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
.tag-tema{background:rgba(255,31,142,.12);color:#ff6eb5;border:1px solid rgba(255,31,142,.2);}
.tag-fonte{background:rgba(191,90,242,.12);color:#d18fff;border:1px solid rgba(191,90,242,.2);}
.tag-ano{background:var(--surface);color:var(--muted);border:1px solid var(--border);}
.modal-section{margin-bottom:24px;}
.modal-section-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--c2);margin-bottom:10px;}
.modal-desc{font-size:14px;color:rgba(232,232,240,.8);line-height:1.75;}
.modal-insights{display:flex;flex-direction:column;gap:8px;}
.modal-insight-item{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;font-size:13px;color:var(--muted);line-height:1.6;}
.modal-login-box{background:rgba(255,31,142,.06);border:1px solid rgba(255,31,142,.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;}
.modal-login-box p{font-size:14px;color:var(--muted);margin-bottom:14px;}
.modal-login-btn{padding:10px 24px;border-radius:10px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif;}
.modal-login-cta{display:none;}
.modal-login-box{display:none;}
@media(max-width:768px){
  .global-nav{padding:0 16px !important;}
  .nav-divider{display:none;}
  .nav-login{display:none;}
  .nav-burger{display:flex;}
  .nav-mobile-close{display:flex;}
  .nav-links{
    display:none;
    position:fixed;
    top:0;left:0;right:0;bottom:0;
    flex-direction:column;
    gap:2px;
    background:rgba(4,4,12,.97);
    backdrop-filter:blur(48px) saturate(200%);
    -webkit-backdrop-filter:blur(48px) saturate(200%);
    padding:16px;
    padding-top:max(16px, env(safe-area-inset-top));
    padding-bottom:max(24px, env(safe-area-inset-bottom));
    z-index:100;
    overflow-y:auto;
  }
  .nav-links.open{display:flex;}
  .nav-link{font-size:16px;font-weight:600;padding:16px 20px;border-radius:14px;color:rgba(245,245,247,.55);letter-spacing:.03em;min-height:52px;display:flex;align-items:center;}
  .nav-link.active{color:#fff;background:rgba(255,255,255,.07);}
  .page{padding:24px 16px 60px;}
  .stats-bar{gap:10px;}
  .stat{padding:12px 14px;min-width:0;flex:1;}
  .stat-num{font-size:18px;}
  .chips-row{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
  .chips-row::-webkit-scrollbar{display:none;}
  .chip{flex-shrink:0;min-height:44px;}
  .chips-wrapper::after{content:'';position:absolute;right:0;top:0;bottom:6px;width:40px;background:linear-gradient(to right,transparent,var(--bg));pointer-events:none;}
  .result-card{padding:16px 18px;}
  .card-title{font-size:14px;}
  .modal-body{padding:16px;}
  .modal-cover{padding:16px;}
}
```

- [ ] **Step 3: Substituir o HTML da `<nav>` e `<div class="page">`**

Substituir o `<nav class="global-nav">` existente por:
```html
<nav class="global-nav">
  <div class="nav-logo"><a href="../Cerebro/cerebro.html"><img src="../CannesFlix/ASTERISK LOGO.png" alt="Asterisk"></a></div>
  <div class="nav-links" id="nav-links">
    <button class="nav-mobile-close" onclick="document.getElementById('nav-links').classList.remove('open');document.getElementById('nav-burger').classList.remove('active');" aria-label="Fechar menu">
      <i data-lucide="x"></i> Fechar
    </button>
    <a href="../Cerebro/cerebro.html" class="nav-link">Cérebro</a>
    <a href="../CannesFlix/cannes_cerebro_fixed.html" class="nav-link">CannesFlix</a>
    <a href="../Insight/insight.html" class="nav-link">Insight</a>
    <a href="biblioteca.html" class="nav-link active">Biblioteca</a>
    <a href="../Sobre/sobre.html" class="nav-link">Sobre</a>
  </div>
  <div class="nav-divider"></div>
  <button class="nav-login" onclick="openLoginModal()">Login</button>
  <button class="nav-burger" id="nav-burger" onclick="this.classList.toggle('active');document.getElementById('nav-links').classList.toggle('open')" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
```

Substituir o `<div class="page">` header e stats por:
```html
<div class="page">
  <div class="page-header">
    <div class="eyebrow">
      <i data-lucide="library" aria-hidden="true"></i>
      Acervo de Referências
    </div>
    <h1>Biblioteca</h1>
    <p>Trend reports, estudos e publicações de WGSN, McKinsey, OpinionBox e mais de 40 fontes globais. Dados com fonte para embasar qualquer decisão criativa.</p>
  </div>
  <div class="stats-bar">
    <div class="stat"><div class="stat-num" id="total-estudos">185</div><div class="stat-label">publicações</div></div>
    <div class="stat"><div class="stat-num" id="total-fontes">48</div><div class="stat-label">fontes</div></div>
    <div class="stat"><div class="stat-num">2016–2026</div><div class="stat-label">cobertura</div></div>
    <div class="stat"><div class="stat-num" id="total-insights">0</div><div class="stat-label">insights</div></div>
  </div>
```

- [ ] **Step 4: Substituir barra de busca, chips e resultados no HTML**

Substituir a `.search-wrap` existente por:
```html
  <div class="search-wrap">
    <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
    <input type="text" class="search-input" id="search-input"
      placeholder="Buscar por título, fonte ou tema…"
      oninput="doSearch()" autocomplete="off" spellcheck="false"
      aria-label="Buscar na biblioteca">
    <button class="search-btn" onclick="doSearch()" aria-label="Buscar">
      <i data-lucide="arrow-right"></i>
    </button>
  </div>
```

Substituir `.chips-label` + `.chips-row` por:
```html
  <div class="chips-label">Filtrar por tema</div>
  <div class="chips-wrapper">
    <div class="chips-row" id="chips-temas">
      <button class="chip active" onclick="filterBy('todos', this)"><i data-lucide="layout-grid"></i>Todos</button>
      <button class="chip" onclick="filterBy('Consumo', this)"><i data-lucide="shopping-bag"></i>Consumo</button>
      <button class="chip" onclick="filterBy('Marketing', this)"><i data-lucide="megaphone"></i>Marketing</button>
      <button class="chip" onclick="filterBy('Tecnologia', this)"><i data-lucide="laptop"></i>Tecnologia</button>
      <button class="chip" onclick="filterBy('Saúde', this)"><i data-lucide="heart-pulse"></i>Saúde</button>
      <button class="chip" onclick="filterBy('Tendências', this)"><i data-lucide="telescope"></i>Tendências</button>
      <button class="chip" onclick="filterBy('Gerações', this)"><i data-lucide="users"></i>Gerações</button>
      <button class="chip" onclick="filterBy('Mídia', this)"><i data-lucide="smartphone"></i>Mídia</button>
      <button class="chip" onclick="filterBy('Alimentação', this)"><i data-lucide="utensils"></i>Alimentação</button>
      <button class="chip" onclick="filterBy('Games', this)"><i data-lucide="gamepad-2"></i>Games</button>
      <button class="chip" onclick="filterBy('Pets', this)"><i data-lucide="paw-print"></i>Pets</button>
      <button class="chip" onclick="filterBy('Finanças', this)"><i data-lucide="landmark"></i>Finanças</button>
      <button class="chip" onclick="filterBy('Moda', this)"><i data-lucide="shirt"></i>Moda</button>
      <button class="chip" onclick="filterBy('Criatividade', this)"><i data-lucide="sparkles"></i>Criatividade</button>
    </div>
  </div>
```

Substituir `.filter-row` e `.results-header` por:
```html
  <div class="results-header">
    <div class="results-count">Exibindo <strong id="count-label">0</strong> publicações</div>
    <button class="export-btn" onclick="exportCSV()"><i data-lucide="download"></i> Exportar CSV</button>
  </div>
  <div class="results-grid" id="results"></div>
  <div class="empty" id="empty" style="display:none">
    <div class="empty-icon">📚</div>
    <h3>Nenhum estudo encontrado</h3>
    <p>Tente outros termos ou remova alguns filtros.</p>
  </div>
</div>
```

- [ ] **Step 5: Substituir o modal HTML pelo novo modal de estudo**

Substituir o `<div class="modal-overlay" id="modal">` existente por:
```html
<div class="modal-overlay" id="modal" onclick="if(event.target===this)closeModal()">
  <div class="modal" id="modal-content"></div>
</div>
```

Adicionar o modal de login antes do `</body>`:
```html
<div id="login-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box" style="background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px 36px;max-width:400px;width:100%;position:relative;">
    <button class="modal-close-detail" onclick="closeLoginModal()" aria-label="Fechar">
      <i data-lucide="x"></i>
    </button>
    <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
      <i data-lucide="sparkles" style="width:22px;height:22px;color:#fff;"></i>
    </div>
    <h2 style="font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;" id="modal-title">Entrar no Asterisk</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.5;">Acesso antecipado — lista de espera aberta</p>
    <input type="email" id="modal-email" placeholder="seu@email.com" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:var(--text);font-size:14px;margin-bottom:12px;outline:none;font-family:'Space Grotesk',sans-serif;" autocomplete="email"/>
    <button onclick="submitWaitlist()" style="width:100%;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Space Grotesk',sans-serif;">
      Entrar na lista de espera <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
    </button>
  </div>
</div>
<script>lucide.createIcons();</script>
```

- [ ] **Step 6: Atualizar a função renderCards() para o novo layout result-card**

Localizar a função `renderCards(items)` no `<script>` e substituí-la por:
```js
function renderCards(items) {
  const container = document.getElementById('results');
  const empty = document.getElementById('empty');
  document.getElementById('count-label').textContent = items.length;
  if (!items.length) { container.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  container.innerHTML = items.map(e => `
    <div class="result-card" onclick="openModal(${e.id})">
      <div class="card-head">
        <span class="card-source-badge">${e.fonte.split(' · ')[0]}</span>
        <span class="card-year">${e.ano !== '—' ? e.ano : ''}</span>
      </div>
      <div class="card-title">${e.titulo}</div>
      <div class="card-meta">
        <span class="tag-ref">${e.tema}</span>
        ${e.highlights[0] ? `<span class="tag-ref">${e.highlights[0].split('—')[0].trim()}</span>` : ''}
      </div>
      <button class="card-cta">
        <i data-lucide="book-open"></i> Ver detalhes
      </button>
    </div>`).join('');
  lucide.createIcons();
}
```

- [ ] **Step 7: Adicionar função filterBy() ao script**

Após a função `clearAll()`, adicionar:
```js
function filterBy(tema, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if(el) el.classList.add('active');
  activeTema = tema === 'todos' ? '' : tema;
  doSearch();
}
```

- [ ] **Step 8: Adicionar JS do modal de login e atualizar função openModal**

No `<script>`, adicionar funções do login modal:
```js
function openLoginModal(){
  document.getElementById('login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-email').focus(),100);
}
function closeLoginModal(){
  document.getElementById('login-modal').classList.remove('open');
}
function submitWaitlist(){
  const email=document.getElementById('modal-email').value;
  if(!email||!email.includes('@')) return;
  document.querySelectorAll('.modal-btn').forEach(b=>b.textContent='Recebido! Em breve.');
  setTimeout(closeLoginModal,1800);
}
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLoginModal();
});
```

- [ ] **Step 9: Atualizar linha doSearch() para remover filtro de fonte/ano do HTML (já não existe no HTML)**

Na função `doSearch()`, a busca já funciona com ESTUDOS[]. Apenas garantir que a função não tenta acessar `filter-fonte` ou `filter-ano` que não existem mais no HTML. Localizar:

```js
function doSearch() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  const fonte = document.getElementById('filter-fonte').value;
  const ano = document.getElementById('filter-ano').value;
```

Substituir por:
```js
function doSearch() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  const fonte = '';
  const ano = '';
```

- [ ] **Step 10: Verificar**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('C:/Users/pietr/Cerebro/Biblioteca/biblioteca.html', 'utf8');
console.log('Lucide CDN:', html.includes('unpkg.com/lucide') ? 'OK' : 'FALTA');
console.log('login-modal:', html.includes('id=\"login-modal\"') ? 'OK' : 'FALTA');
console.log('filterBy:', html.includes('filterBy') ? 'OK' : 'FALTA');
console.log('result-card:', html.includes('result-card') ? 'OK' : 'FALTA');
console.log('filter-fonte acesso:', html.includes(\"getElementById('filter-fonte')\") ? 'AINDA EXISTE (verificar)' : 'OK removido');
console.log('sobre_apple:', html.includes('sobre_apple') ? 'AINDA EXISTE' : 'OK removido');
"
```

- [ ] **Step 11: Commit**

```bash
cd "C:/Users/pietr/Cerebro"
git add Biblioteca/biblioteca.html
git commit -m "feat: biblioteca.html — Lucide, login modal, redesign layout Insight (Correção 7)"
git push origin main
```

---

## Task 4: cannes_cerebro_fixed.html — Correções 0, 1

**Files:**
- Modify: `CannesFlix/cannes_cerebro_fixed.html`

- [ ] **Step 1: Adicionar Lucide CDN no `<head>`**

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

- [ ] **Step 2: Adicionar CSS Lucide e modal no `<style>`**

```css
i[data-lucide]{display:inline-flex;width:16px;height:16px;stroke-width:1.75;vertical-align:middle;flex-shrink:0}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.open{display:flex}
.modal-box{background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:40px 36px;max-width:400px;width:100%;position:relative}
.modal-close{position:absolute;top:16px;right:16px;color:rgba(245,245,247,.35);background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;display:flex;align-items:center}
.modal-close:hover{color:#fff}
.modal-logo{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.modal-logo i[data-lucide]{width:22px;height:22px;color:#fff}
.modal-title{font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-sub{font-size:13px;color:rgba(245,245,247,.32);margin-bottom:24px;line-height:1.5}
.modal-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;color:#f5f5f7;font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s;font-family:inherit}
.modal-input:focus{border-color:rgba(191,90,242,.5)}
.modal-btn{width:100%;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}
.modal-btn:hover{opacity:.85}
.modal-btn i[data-lucide]{width:14px;height:14px}
@media(max-width:480px){.modal-box{padding:28px 20px;border-radius:20px}}
```

- [ ] **Step 3: Substituir link de login por botão e atualizar link do Sobre**

Localizar:
```html
<a href="../login.html" class="nav-login">Login</a>
```
Substituir por:
```html
<button class="nav-login" onclick="openLoginModal()" style="cursor:pointer;font-family:inherit;">Login</button>
```

Localizar:
```html
<a href="../Sobre/sobre_apple_futurista.html" class="nav-link">Sobre</a>
```
Substituir por:
```html
<a href="../Sobre/sobre.html" class="nav-link">Sobre</a>
```

- [ ] **Step 4: Adicionar modal HTML e JS antes de `</body>`**

```html
<div id="login-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-box">
    <button class="modal-close" onclick="closeLoginModal()" aria-label="Fechar">
      <i data-lucide="x"></i>
    </button>
    <div class="modal-logo"><i data-lucide="sparkles"></i></div>
    <h2 class="modal-title" id="modal-title">Entrar no Asterisk</h2>
    <p class="modal-sub">Acesso antecipado — lista de espera aberta</p>
    <input type="email" id="modal-email" placeholder="seu@email.com" class="modal-input" autocomplete="email"/>
    <button class="modal-btn" onclick="submitWaitlist()">
      Entrar na lista de espera <i data-lucide="arrow-right"></i>
    </button>
  </div>
</div>
<script>
function openLoginModal(){
  document.getElementById('login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-email').focus(),100);
}
function closeLoginModal(){
  document.getElementById('login-modal').classList.remove('open');
}
function submitWaitlist(){
  const email=document.getElementById('modal-email').value;
  if(!email||!email.includes('@')) return;
  document.querySelector('.modal-btn').textContent='Recebido! Em breve.';
  setTimeout(closeLoginModal,1800);
}
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLoginModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeLoginModal();
});
lucide.createIcons();
</script>
```

- [ ] **Step 5: Verificar e commitar**

```bash
grep "login-modal\|openLoginModal\|sobre_apple\|data-lucide" C:/Users/pietr/Cerebro/CannesFlix/cannes_cerebro_fixed.html | head -10
```
Esperado: login-modal e openLoginModal presentes, sobre_apple ausente.

```bash
cd "C:/Users/pietr/Cerebro"
git add CannesFlix/cannes_cerebro_fixed.html
git commit -m "feat: cannes.html — Lucide icons, login modal, link sobre corrigido"
git push origin main
```

---

## Task 5: sobre.html — fix self-link

**Files:**
- Modify: `Sobre/sobre.html`

O `sobre.html` já tem Lucide CDN, modal de login funcional, e nav-login como button. Só precisa corrigir a auto-referência errada.

- [ ] **Step 1: Corrigir self-link**

Localizar:
```html
<a href="sobre_apple_futurista.html" class="nav-link active">Sobre</a>
```
Substituir por:
```html
<a href="sobre.html" class="nav-link active">Sobre</a>
```

- [ ] **Step 2: Verificar e commitar**

```bash
grep "sobre_apple" C:/Users/pietr/Cerebro/Sobre/sobre.html
```
Esperado: nenhum resultado.

```bash
cd "C:/Users/pietr/Cerebro"
git add Sobre/sobre.html
git commit -m "fix: sobre.html — corrige self-link para sobre.html"
git push origin main
```
