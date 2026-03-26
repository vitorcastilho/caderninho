# Snippets Canônicos para Protótipos HTML

> Referência para uso em todos os protótipos HTML. Extraído da implementação real em `Sidebar.tsx` e `BottomNavigation.tsx`.

---

## 1. CSS Variables (obrigatório em todos os protótipos)

```css
:root {
  /* Stone & Indigo — paleta canônica */
  --bg: #FAFAF9;
  --surface: #FFFFFF;
  --border: #E7E5E4;
  --border-hover: #D6D3D1;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
  --text-tertiary: #A8A29E;
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --primary-light: #EEF2FF;
  --primary-fg: #FFFFFF;

  /* Semânticas */
  --positive: #22C55E;
  --positive-bg: #DCFCE7;
  --positive-text: #166534;
  --attention: #EAB308;
  --attention-bg: #FEF9C3;
  --attention-text: #854D0E;
  --alert: #F97316;
  --alert-bg: #FFF7ED;
  --alert-text: #9A3412;
  --critical: #DC2626;
  --critical-bg: #FEE2E2;
  --critical-text: #991B1B;
  --info: #3B82F6;
  --info-bg: #DBEAFE;
  --info-text: #1E40AF;

  /* Radius */
  --radius-button: 8px;
  --radius-input: 8px;
  --radius-card: 12px;
  --radius-card-inner: 8px;
  --radius-badge: 100px;

  /* Sidebar */
  --sidebar-width: 220px;
  --sidebar-collapsed: 56px;

  /* Bottom Nav */
  --bottom-nav-height: 56px;
  --fab-size: 48px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: var(--text-primary);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
```

---

## 2. Sidebar Desktop (220px expandido)

### HTML

```html
<aside class="sidebar">
  <!-- Logo -->
  <div class="sidebar-logo">
    <span class="sidebar-logo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/></svg></span>
    <span class="sidebar-logo-text">Caderninho</span>
  </div>
  <div class="sidebar-separator"></div>

  <!-- Navegação -->
  <nav class="sidebar-nav">
    <div class="sidebar-section">
      <div class="sidebar-section-label">Navegação</div>
      <ul class="sidebar-items">
        <li><a href="#" class="sidebar-item active">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Dashboard</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>
          <span>Orçamentos</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          <span>Checklist</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          <span>Projeção</span>
        </a></li>
      </ul>
    </div>

    <div class="sidebar-separator"></div>

    <div class="sidebar-section">
      <div class="sidebar-section-label">Configurações</div>
      <ul class="sidebar-items">
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h5"/></svg>
          <span>Contas</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Cartões</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Investimentos</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
          <span>Receitas</span>
        </a></li>
        <li><a href="#" class="sidebar-item">
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
          <span>Categorias</span>
        </a></li>
      </ul>
    </div>
  </nav>

  <!-- Footer: Usuário -->
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="sidebar-avatar">V</div>
      <div class="sidebar-user-info">
        <span class="sidebar-user-name">Vitor</span>
        <span class="sidebar-user-role">Administrador</span>
      </div>
    </div>
  </div>
</aside>
```

### CSS

```css
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 40;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 20px 16px 16px;
  gap: 4px;
}

.sidebar-logo-icon {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--primary);
}

.sidebar-separator {
  height: 1px;
  background: var(--border);
  margin: 4px 16px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-section {
  padding: 0;
}

.sidebar-section-label {
  padding: 16px 16px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.sidebar-items {
  list-style: none;
  margin: 0;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-button);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 150ms ease-in-out;
}

.sidebar-item:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding: 12px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-role {
  font-size: 11px;
  color: var(--text-tertiary);
}
```

---

## 3. Bottom Nav Mobile (56px, 5 itens + FAB + Sair)

### HTML

```html
<nav class="bottom-nav">
  <a href="#" class="bottom-nav-item active">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    <span>Dashboard</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    <span>Cartões</span>
  </a>
  <a href="#" class="bottom-nav-fab">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
    <span class="bottom-nav-fab-label">Registrar</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
    <span>Checklist</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
    <span>Projeção</span>
  </a>
  <button class="bottom-nav-item" onclick="handleLogout()">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
    <span>Sair</span>
  </button>
</nav>
```

### CSS

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  min-width: 64px;
  min-height: 44px;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 10px;
  font-weight: 500;
  transition: color 150ms ease-in-out;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-icon {
  width: 20px;
  height: 20px;
}

.bottom-nav-fab {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  margin-top: -16px;
}

.bottom-nav-fab svg {
  width: var(--fab-size);
  height: var(--fab-size);
  padding: 12px;
  background: var(--primary);
  color: var(--primary-fg);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
}

.bottom-nav-fab-label {
  margin-top: 2px;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
}
```

---

## 4. Regras de Formatação

### Valores Monetários

```
Formato: R$ X.XXX,XX (sempre 2 decimais, espaço após R$)
Negativo: -R$ X.XXX,XX
CSS: font-variant-numeric: tabular-nums (aplicar nos elementos com valores, NÃO no body)
```

### Percentuais

```
Formato: XX,XX% (sempre 2 decimais)
CSS: font-variant-numeric: tabular-nums
```

### tabular-nums (aplicar seletivamente)

```css
.value, .amount, .percentage, [data-numeric] {
  font-variant-numeric: tabular-nums;
}
```

---

## 5. Layout Padrão Desktop

```
┌─────────────────────────────────────────┐
│ sidebar (220px) │ main content          │
│                 │                       │
│ 📖 Caderninho   │  [page content]       │
│ ─────────       │                       │
│ NAVEGAÇÃO       │                       │
│ Dashboard       │                       │
│ Orçamentos      │                       │
│ Checklist       │                       │
│ Projeção        │                       │
│ ─────────       │                       │
│ CONFIGURAÇÕES   │                       │
│ Contas          │                       │
│ Cartões         │                       │
│ Investimentos   │                       │
│ Receitas        │                       │
│ Categorias      │                       │
│ ─────────       │                       │
│ [V] Vitor       │                       │
│ Administrador   │                       │
└─────────────────────────────────────────┘
```

## 6. Layout Padrão Mobile

```
┌──────────────────────┐
│ [page content]       │
│                      │
│                      │
│                      │
├──────────────────────┤
│ Dash │ Cartões│[FAB+]│
│ Check│Projeção│ Sair │
└──────────────────────┘
  bottom nav (56px)
  FAB central 48px, -mt-4
  6 itens: Dash, Cartões, [+], Check, Projeção, Sair
```
