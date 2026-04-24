# 📄 DocPilot

Converse com seus documentos PDF **instantaneamente**, sem login e sem complicações. DocPilot é uma ferramenta stateless que utiliza IA para responder perguntas sobre PDFs em tempo real usando Retrieval-Augmented Generation (RAG).

![Status](https://img.shields.io/badge/status-MVP-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-2.0-informational)

---

## 🎯 Funcionalidades

- ✨ **Upload Simplificado** – Selecione um PDF com um clique
- ⚡ **Processamento Imediato** – Extração e vetorização instantânea
- 🤖 **Chat com IA** – Faça perguntas sobre o documento e receba respostas contextualizadas
- 📌 **Citações Automáticas** – Respostas incluem referências ao documento
- 🔄 **Trocar Documento** – Reset de sessão sem perder a aplicação
- 🚫 **Sem Login** – Sessão efêmera, dados descartados ao fechar a aba

---

## 🏗️ Arquitetura Técnica

### Stack

| Camada             | Tecnologia                                          | Propósito                                                    |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------ |
| **Frontend**       | [Next.js 16](https://nextjs.org)                    | Interface reativa e otimizada                                |
| **Orquestração**   | [LangChain](https://www.langchain.com/)             | Chain de conversação (RetrievalQA)                           |
| **Banco Vetorial** | [Astra DB](https://www.datastax.com/products/astra) | Armazenamento e busca de embeddings                          |
| **LLM**            | [OpenAI](https://openai.com)                        | Embeddings (`text-embedding-3-small`) + Chat (`gpt-4o-mini`) |
| **Estilos**        | [Tailwind CSS](https://tailwindcss.com)             | Design system responsivo                                     |

### Fluxo de Dados

```
Usuário seleciona PDF
      ↓
[Frontend] Envia arquivo
      ↓
[Server Action] Extrai texto
      ↓
[LangChain] Tokeniza e cria embeddings
      ↓
[OpenAI] Gera vetores (text-embedding-3-small)
      ↓
[Astra DB] Armazena embeddings com session_id
      ↓
Chat pronto! Perguntas → RAG → Respostas citadas
```

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- Contas e credenciais:
    - [OpenAI API Key](https://platform.openai.com/api-keys)
    - [Astra DB](https://astra.datastax.com) (endpoint e token)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/doc-pilot.git
cd doc-pilot
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha o `.env.local` com:

```env
# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk_...

# Astra DB
ASTRA_DB_ENDPOINT=https://xxxxx.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:xxxxx
ASTRA_DB_NAMESPACE=default_keyspace
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador

---

## 📖 Como Usar

### Usuário Final

1. **Acesse o site** – Sem necessidade de login
2. **Carregue um PDF** – Clique em "Selecionar PDF" e escolha seu arquivo
3. **Aguarde o processamento** – Indicador visual ("Lendo documento...") durante a vetorização
4. **Converse** – Faça perguntas no campo de texto do rodapé
5. **Receba respostas** – A IA fornece respostas baseadas no documento com citações
6. **Trocar documento** – Use "Carregar novo arquivo" para resetar a sessão

### Desenvolvedor

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm build

# Iniciar produção
npm start

# Lint
npm run lint

# Seed do banco (dados iniciais)
npm run db:seed
```

---

## 📋 Requisitos Funcionais

### Epico 1: Ingestão Simplificada

| ID    | Funcionalidade                            | Status |
| ----- | ----------------------------------------- | ------ |
| RF-01 | Upload simples via `<input type="file">`  | ✅     |
| RF-02 | Processamento imediato com loader         | ⏳     |
| RF-03 | Reset de sessão ("Carregar novo arquivo") | ⏳     |

### Epico 2: Experiência de Chat (RAG)

| ID    | Funcionalidade                         | Status |
| ----- | -------------------------------------- | ------ |
| RF-04 | Input de pergunta fixo no rodapé       | ⏳     |
| RF-05 | RAG com citação de fonte               | ⏳     |
| RF-06 | Tratamento de erro para PDFs ilegíveis | ⏳     |

---

## 🗂️ Estrutura do Projeto

```
doc-pilot/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial (upload)
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ChatInput.tsx      # Input de pergunta
│   └── ChatMessage.tsx    # Exibição de mensagens
├── scripts/
│   └── dbSeed.ts         # Script de seed do Astra DB
├── public/                # Assets estáticos
├── .env.local            # Variáveis de ambiente (não commitar)
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
├── tailwind.config.ts    # Configuração Tailwind
├── next.config.ts        # Configuração Next.js
└── README.md             # Este arquivo
```

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# OpenAI API (para embeddings e chat)
NEXT_PUBLIC_OPENAI_API_KEY=sua_chave_aqui

# Astra DB (banco vetorial)
ASTRA_DB_ENDPOINT=https://seu-id.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:seu_token_aqui
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=doc_pilot_embeddings
```

---

## 🛠️ Desenvolvimento

### Componentes Principais

- **`app/page.tsx`** – Tela inicial com upload e lógica de estado da aplicação
- **`components/ChatInput.tsx`** – Campo de entrada de perguntas
- **`components/ChatMessage.tsx`** – Renderização de mensagens de chat

### Server Actions

Implementar as seguintes ações no servidor:

- `uploadAndProcessPDF()` – Recebe arquivo, extrai texto, gera embeddings
- `askQuestion()` – Realiza busca vetorial e chama LangChain
- `resetSession()` – Limpa dados da sessão no Astra DB

### Integração com Astra DB

```typescript
import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(process.env.ASTRA_DB_ENDPOINT!);
const collection = db.collection("doc_pilot_embeddings");
```

---

## 🚨 Tratamento de Erros

- **PDF com imagens (sem OCR)** → Mensagem de aviso ao usuário
- **Arquivo corrompido** → Erro na validação
- **Token de API expirado** → Tente novamente ou contacte suporte
- **Limite de requisições** → Rate limit do OpenAI

---

## 📚 Documentação Completa

Para mais detalhes técnicos, consulte:

- [PRD do Projeto](../prompts-e-documentacoes/PRD-DOCPILOT.md)
- [LangChain Docs](https://docs.langchain.com/)
- [Astra DB Documentation](https://docs.datastax.com/en/astra-serverless/databases/vector-search/overview.html)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🌐 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Adicione as variáveis de ambiente no dashboard da Vercel.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📝 Roadmap

- [ ] Suporte a múltiplos PDFs simultâneos
- [ ] Histórico de conversas (com persistência opcional)
- [ ] Exportar conversa como PDF
- [ ] Dark mode
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de desempenho (latência, acurácia)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 💬 Suporte

Tem dúvidas ou encontrou um bug? Abra uma [issue](https://github.com/EvandroBaraka/doc-pilot/issues)!

---

## 🙏 Agradecimentos

- [DataStax](https://www.datastax.com/) – Astra DB
- [OpenAI](https://openai.com) – Modelos de IA
- [LangChain](https://www.langchain.com/) – Framework de orquestração
- [Next.js](https://nextjs.org) – Framework web
