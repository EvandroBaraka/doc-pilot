/**
 * 🔒 ROUTE HANDLER - Executa APENAS no servidor
 *
 * Por que no servidor e não no cliente?
 * ✅ Credenciais da API (OPENAI_API_KEY, tokens do Astra DB) NUNCA são expostas ao cliente
 * ✅ Chamadas à OpenAI e Astra DB são feitas de forma segura
 * ✅ O cliente (navegador) nunca tem acesso direto ao banco de dados ou APIs externas
 * ✅ Você pode controlar rate limiting, logging e autenticação em um único lugar
 */

import "dotenv/config";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

// Desestrutura as variáveis de ambiente necessárias para conexões
// Essas variáveis devem estar definidas no arquivo .env
const {
  ASTRA_DB_NAMESPACE, // Namespace do banco de dados Astra
  ASTRA_DB_APPLICATION_TOKEN, // Token de autenticação do Astra DB
  ASTRA_DB_ENDPOINT, // URL/endpoint do Astra DB
  ASTRA_DB_COLLECTION, // Nome da coleção onde os embeddings serão armazenados
  OPENAI_API_KEY, // Chave da API OpenAI para gerar embeddings
} = process.env;

console.log("OPENAI_API_KEY", OPENAI_API_KEY);

/**
 * Inicializa o cliente OpenAI com a chave de API
 * Será usado para gerar embeddings (representações vetoriais) dos textos
 * Embedding é essencial para busca semântica por similaridade
 */
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Inicializa o cliente do Astra DB (banco de dados vetorial)
 * O Astra DB é otimizado para armazenar e buscar vetores (embeddings)
 */
const astraClient = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

/**
 * Conecta ao banco de dados específico no Astra usando o namespace
 * O namespace é um espaço lógico isolado dentro do Astra DB
 */
const db = astraClient.db(ASTRA_DB_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    console.log("Received messages:", messages);

    const latestMessage = messages[messages.length - 1]?.content;
    let docsContext = "";

    // ========================================================================
    // ETAPA 1️⃣: CRIAR EMBEDDING
    // Converter a pergunta em um vetor numérico (embedding)
    // Este vetor será usado para buscar documentos similares no BD
    // ======================================================================== //

    const latestMessageEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    // ========================================================================
    // ETAPA 2️⃣: BUSCAR DOCUMENTOS SIMILARES (RAG)
    // Usar vector search para encontrar os documentos mais relevantes comparando com a mensagem do usuário
    // ======================================================================== //

    try {
      const collection = db.collection(ASTRA_DB_COLLECTION);

      const similarDocs = await collection.find(null, {
        sort: {
          // ordenar por similaridade
          $vector: latestMessageEmbedding.data[0].embedding,
        },
        limit: 10, // número de documentos similares a retornar
      });

      const documents = await similarDocs.toArray();
      console.log("Documentos encontrados:", documents.length);
      console.log("Documentos:", JSON.stringify(documents, null, 2));
      
      const docsMap = documents.map((doc) => doc.text);

      docsContext = JSON.stringify(docsMap);
    } catch (error) {
      console.error("Erro ao buscar documentos similares:", error);
    }

    console.log("DocsContext final:", docsContext);

    // ========================================================================
    // ETAPA 3️⃣: MONTAR PROMPT DO SISTEMA
    // Criar um prompt que inclui:
    // - Instruções para o modelo
    // - Contexto dos documentos (RAG)
    // - A pergunta do usuário
    // ======================================================================== //

    const systemPrompt = {
      role: "system" as const,
      content: `Você é um assistente de IA especializado em tudo sobre a empresa NovaVision. Você conhece profundamente todos os documentos e informações da empresa. Use o contexto fornecido para aumentar seu conhecimento sobre a NovaVision.

O contexto fornecerá as informações mais recentes e precisas da empresa, incluindo políticas, procedimentos, dados operacionais e outras informações relevantes.

Se o contexto não incluir a informação que você precisa responder, baseie-se no seu conhecimento existente sobre a NovaVision e não mencione a fonte de suas informações ou o que o contexto inclui ou não.

Formate as respostas usando markdown quando apropriado e não retorne imagens.

---

INÍCIO DO CONTEXTO
${docsContext}
FIM DO CONTEXTO

---

PERGUNTA: ${latestMessage}

`,

    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemPrompt, ...messages], // system prompt + histórico de msgs
    });

    const assistantMessage = response.choices[0].message.content;

    console.log("assistantMessage", assistantMessage);

    return new Response(JSON.stringify({ message: assistantMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erro no endpoint /api/chat:", errorMessage);
    return new Response(
      JSON.stringify({
        error: "Falha ao processar a solicitação",
        details:
          "Não foi possível gerar uma resposta. Por favor, tente novamente mais tarde.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
