# 📋 Prompt: Tela Inicial do DocPilot - Chat Responsivo

## 🎯 Objetivo

Construir uma **tela inicial de chat responsiva** para o DocPilot que funcione perfeitamente em dispositivos móveis, tablets e desktops. A interface segue o design system estabelecido com a paleta de cores primária (#13a4ec) e utiliza componentes reutilizáveis.

---

## 📐 Especificações Técnicas

### Stack Utilizado
- **Framework**: Next.js 16.1.5
- **Linguagem**: TypeScript 5 (Strict Mode)
- **UI Framework**: Tailwind CSS 4
- **Componentes**: React 19.2
- **Ícones**: Material Symbols Outlined (Google Fonts)
- **Idioma**: Português Brasileiro (pt-BR)

### Paleta de Cores
```
Primária: #13a4ec (Azul)
Background Light: #f9fafb (Cinza claro)
Background Dark: #0f1419 (Cinza escuro)
Texto Light: #111618
Texto Dark: #ffffff
```

### Breakpoints Tailwind (Mobile-First)
```
xs: 0px (mobile default)
sm: 640px (smartphone grande)
md: 768px (tablet)
lg: 1024px (desktop pequeno)
xl: 1280px (desktop grande)
```

---

## 🏗️ Arquitetura de Componentes

### 1. **ChatMessage** (`components/ChatMessage.tsx`)
Renderiza uma mensagem individual da conversa.

#### Props
```typescript
interface ChatMessageProps {
  role: 'ai' | 'user';        // Quem enviou a mensagem
  content: string;             // Conteúdo da mensagem
  isLoading?: boolean;         // Estado de carregamento (3 pontinhos)
  source?: { page: number };   // Página do PDF (apenas IA)
}
```

#### Responsividade Implementada
- **Avatar**: 8×8 (mobile) → 10×10 (sm+)
- **Tamanho fonte**: xs (mobile) → sm (sm+)
- **Max-width da bolha**: 85% (mobile) → 80% (sm) → 70% (md) → 60% (lg)
- **Padding**: Reduzido em mobile, aumentado em sm+
- **Gap**: 12px (mobile) → 16px (sm+)
- **Badges**: Fonte pequena em mobile

#### Diferenças Visuais
- **IA**: Bolha com border, fundo branco/slate-900, avatar esquerda
- **Usuário**: Bolha azul (#13a4ec), avatar direita, sem border

### 2. **ChatInput** (`components/ChatInput.tsx`)
Componente de entrada de texto com validação e envio.

#### Responsividade Implementada
- **Layout**: Coluna (mobile) → Linha (sm+)
- **Input**: Preenche a largura, flex-grow em sm+
- **Botão "Enviar"**: Apenas ícone (mobile), com texto (sm+)
- **Button "Add"**: Oculto em mobile, visível em sm+
- **Footer**: Padding adaptativo (16px mobile → 24px sm+)
- **Desclaimer**: xs em mobile, [11px] em sm+
- **Arredondamento**: xl (mobile) → 2xl (sm+)

#### Estados
- **Disabled**: Opacidade reduzida
- **Hover**: Cor primária mais escura
- **Focus**: Ring 2px com primary/20
- **Empty**: Botão disabled

### 3. **Home/Page** (`app/page.tsx`)
Página principal com orquestração de componentes.

#### Estrutura de Layout
```
┌─────────────────────────────────────────┐
│  Header (Sticky, Logo + Título)         │
├─────────────────────────────────────────┤
│                                         │
│  Main (Área de Mensagens - Scroll)      │
│  - Mensagens renderizadas com scroll    │
│  - Auto-scroll para nova mensagem       │
│  - Padding responsivo                   │
│                                         │
├─────────────────────────────────────────┤
│  Footer (Fixed, Input de Chat)          │
│  - Fixado no bottom                     │
│  - Backdrop blur                        │
│  - Responsive com max-width             │
└─────────────────────────────────────────┘
```

#### Responsividade
- **Header**: px-4 (mobile) → px-6 (sm) → px-20 (md+)
- **Main**: max-w-3xl com padding adaptativo
- **Footer**: Padding 16px (mobile) → 24px (sm+)
- **Espaçamento entre mensagens**: 24px (mobile) → 32px (sm+)
- **pb (padding-bottom)**: 144px (mobile) → 160px (sm+) para evitar overlap com footer

---

## 🎨 Características de Design

### Header
- ✅ Sticky positioning
- ✅ Backdrop blur
- ✅ Border bottom
- ✅ Logo + Ícone + Título
- ✅ Tema claro/escuro
- ✅ Z-index 50 para sobrepor main

### Chat Messages
- ✅ Bolhas assimétricas (canto superior esquerdo/direito cortado)
- ✅ Avatares diferenciados (IA = smart_toy, User = account_circle)
- ✅ Labels acima das bolhas
- ✅ Badge de fonte (IA)
- ✅ Loading com 3 pontinhos animados
- ✅ Suporte a tema claro/escuro
- ✅ Alinhamento automático (IA esquerda, User direita)

### Input
- ✅ Campo de texto com placeholder
- ✅ Botão enviar com ícone
- ✅ Validação (só envia se houver texto)
- ✅ Disclaimer abaixo
- ✅ Backdrop blur
- ✅ Focus ring
- ✅ Botão "Add" (desktop)
- ✅ Layout responsivo (coluna → linha)

---

## 📱 Testes de Responsividade

### Mobile (375px - iPhone SE)
```
┌──────────────┐
│   Header     │  Compacto, gap pequeno
├──────────────┤
│              │
│  Messages    │  max-w: 85%, bolhas menores
│  (overflow)  │  Scroll ativo, pb:144px
│              │
├──────────────┤
│   Input      │  Coluna, ícone só
│   (Fixed)    │  no botão
└──────────────┘
```

### Tablet (768px - iPad)
```
┌─────────────────────────┐
│      Header             │  Mais espaço
├─────────────────────────┤
│                         │
│    Messages             │  max-w: 70%, layout otimizado
│    (centered, max-w)    │  Mais confortável ler
│                         │
├─────────────────────────┤
│    Input (inline)       │  Botão "Add" visível
│    Responde a foco      │
└─────────────────────────┘
```

### Desktop (1024px+)
```
┌─────────────────────────────────────────┐
│          Header (px-20)                 │
├─────────────────────────────────────────┤
│                                         │
│              Messages                   │  max-w: 60%, bolhas maiores
│         (centered, max-w-3xl)           │  Tipografia completa
│                                         │
├─────────────────────────────────────────┤
│     Input (max-w-2xl, inline)           │  "Enviar" com texto
│  Add | Input | Send                     │
└─────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Estado

```typescript
// Estado das mensagens
interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  source?: { page: number };
  isLoading?: boolean;
}

// Sequência de eventos:
1. Usuário digita e envia mensagem
2. Mensagem "user" é adicionada ao array
3. Loading message "ai" é adicionada
4. Após ~1500ms, loading é substituído por resposta real
5. Auto-scroll para bottom
```

---

## 🚀 Como Executar

### Desenvolvimento
```bash
cd c:\Users\Ricardo\Desktop\formacao-ia\doc-pilot
npm run dev
# Acesse http://localhost:3000
```

### Build Production
```bash
npm run build
npm run start
```

### Lint & Validação
```bash
npm run lint
# TypeScript já valida no build
```

---

## 📝 Notas Importantes

### Integração com IA (Placeholder)
A resposta é simulada com `setTimeout(1500ms)`. Para integrar com **Gemini/LangChain**:

```typescript
const handleSendMessage = async (message: string) => {
  // ... adicionar mensagem do usuário ...
  
  // Chamar API real
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  
  // ... atualizar com resposta real ...
};
```

### Persistência
Atualmente as mensagens são limpas ao atualizar a página. Para adicionar persistência:
- Usar `localStorage` para salvar histórico
- Implementar Context API/Zustand para state management global
- Adicionar rota de API para salvar no banco de dados

### Acessibilidade
- ✅ Semântica HTML correta (header, main, footer)
- ✅ Contraste de cores WCAG AA+
- ✅ Material Symbols acessíveis
- ⚠️ TODO: Adicionar ARIA labels se necessário

---

## 📦 Estrutura Final

```
doc-pilot/
├── app/
│   ├── layout.tsx          (Layout base)
│   ├── page.tsx            (Tela inicial - REFATORADA)
│   └── globals.css
├── components/
│   ├── ChatMessage.tsx     (REFATORADO - Responsivo)
│   └── ChatInput.tsx       (REFATORADO - Responsivo)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Checklist de Implementação

- [x] Refatorar ChatMessage com breakpoints responsivos
- [x] Refatorar ChatInput com layout responsivo
- [x] Refatorar page.tsx com scroll automático
- [x] Testar build (npm run build)
- [x] Adicionar mensagem inicial de boas-vindas
- [x] Validar Tailwind classes (xs, sm, md, lg, xl)
- [x] Implementar auto-scroll para novas mensagens
- [x] Adicionar loading state visual
- [x] Testar tema claro/escuro
- [x] Validar espaçamento em todos os breakpoints
- [x] Documento de referência (este arquivo)

---

## 🎓 Próximos Passos (Opcional)

1. **Upload de PDF**: Adicionar componente de drag-and-drop
2. **Histórico**: Salvar conversas em localStorage/database
3. **IA Real**: Integrar com Gemini ou LangChain
4. **User Auth**: Implementar autenticação
5. **Temas**: Sistema de temas customizáveis
6. **Mobile**: PWA para instalar como app
7. **Analytics**: Tracking de eventos

---

## 📞 Referências

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Responsive](https://tailwindcss.com/docs/responsive-design)
- [Material Symbols](https://fonts.google.com/icons)
- [React Hooks](https://react.dev/reference/react/hooks)
