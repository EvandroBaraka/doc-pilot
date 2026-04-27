import "dotenv/config";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Desestrutura as variáveis de ambiente necessárias para conexões
// Essas variáveis devem estar definidas no arquivo .env
const {
  ASTRA_DB_NAMESPACE, // Namespace do banco de dados Astra
  ASTRA_DB_APPLICATION_TOKEN, // Token de autenticação do Astra DB
  ASTRA_DB_ENDPOINT, // URL/endpoint do Astra DB
  ASTRA_DB_COLLECTION, // Nome da coleção onde os embeddings serão armazenados
  OPENAI_API_KEY, // Chave da API OpenAI para gerar embeddings
} = process.env;

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

/**
 * Array contendo documentos de texto que serão processados
 * Neste caso, contém a Política de Férias da empresa NovaVision
 * Cada documento será dividido em chunks menores para processamento
 */
const docsData = [
  `POLÍTICA DE FÉRIAS

NovaVision Tecnologia

1. Objetivo

A presente Política de Férias tem como objetivo estabelecer diretrizes claras, transparentes e padronizadas para a concessão, programação e usufruto de férias pelos colaboradores da NovaVision Tecnologia, assegurando o cumprimento da legislação trabalhista vigente e promovendo o equilíbrio entre a continuidade das operações da empresa e o bem-estar de seus profissionais.

2. Abrangência

Esta política aplica-se a todos os colaboradores da NovaVision Tecnologia contratados sob o regime da Consolidação das Leis do Trabalho (CLT), independentemente do cargo, área ou nível hierárquico.

3. Base Legal

A Política de Férias da NovaVision Tecnologia está fundamentada nos artigos 129 a 153 da Consolidação das Leis do Trabalho (CLT), bem como em demais dispositivos legais aplicáveis.

4. Período Aquisitivo e Concessivo

4.1. O colaborador adquire o direito a férias após completar 12 (doze) meses de trabalho, denominados período aquisitivo.

4.2. Após o término do período aquisitivo, a empresa terá o prazo de até 12 (doze) meses, denominado período concessivo, para conceder as férias ao colaborador.

5. Duração das Férias

5.1. O período padrão de férias é de 30 (trinta) dias corridos, podendo sofrer reduções conforme previsto em lei, especialmente em casos de faltas injustificadas.

5.2. As férias poderão ser fracionadas em até 3 (três) períodos, desde que:

Um dos períodos não seja inferior a 14 (quatorze) dias corridos;

Os demais períodos não sejam inferiores a 5 (cinco) dias corridos cada;

Haja concordância expressa do colaborador.

6. Programação e Solicitação

6.1. A solicitação de férias deve ser realizada pelo colaborador com antecedência mínima de 30 (trinta) dias, por meio do canal oficial definido pela empresa.

6.2. A aprovação das férias está condicionada à análise da liderança imediata, considerando:

Planejamento da área;

Continuidade das atividades;

Períodos críticos de projetos;

Substituições necessárias.

6.3. A empresa se reserva o direito de ajustar as datas solicitadas, mediante alinhamento prévio com o colaborador.

7. Comunicação e Registro

7.1. As férias aprovadas serão formalmente comunicadas ao colaborador e registradas nos sistemas internos da empresa.

7.2. É responsabilidade do colaborador acompanhar e validar as informações relacionadas ao seu período de férias.

8. Remuneração de Férias

8.1. Durante o período de férias, o colaborador fará jus à sua remuneração normal acrescida do adicional constitucional de 1/3 (um terço).

8.2. O pagamento das férias será efetuado até 2 (dois) dias antes do início do período de gozo, conforme determina a legislação.

9. Abono Pecuniário

9.1. O colaborador poderá optar pela conversão de até 1/3 (um terço) do período de férias em abono pecuniário, desde que a solicitação seja feita até 15 (quinze) dias antes do término do período aquisitivo.

9.2. A concessão do abono está sujeita às regras legais e aos procedimentos internos da empresa.

10. Férias Coletivas

10.1. A NovaVision Tecnologia poderá conceder férias coletivas, de forma total ou parcial, a determinados setores ou à empresa como um todo, mediante comunicação prévia aos colaboradores e aos órgãos competentes, conforme a legislação.

11. Interrupção ou Cancelamento

11.1. Em situações excepcionais, por necessidade imperiosa da empresa, as férias poderão ser interrompidas ou remarcadas, respeitando-se a legislação vigente e mediante acordo com o colaborador.

12. Disposições Gerais

12.1. Durante o período de férias, o colaborador não deverá exercer atividades profissionais relacionadas à NovaVision Tecnologia.

12.2. Casos omissos ou situações não previstas nesta política serão analisados pelo setor de Recursos Humanos, em conjunto com a diretoria, à luz da legislação aplicável.

13. Vigência

Esta Política de Férias entra em vigor na data de sua publicação e poderá ser revisada a qualquer tempo, conforme necessidade da empresa ou alterações legais.`,
];

/**
 * Define os tipos de métricas de similaridade disponíveis para busca vetorial
 * - cosine: Calcula o ângulo entre vetores (melhor para direção)
 * - euclidean: Calcula a distância euclidiana entre pontos (melhor para magnitude)
 * - dot_product: Produto escalar (melhor para embeddings de alta dimensão)
 */
type SimilarityMetric = "cosine" | "euclidean" | "dot_product";

/**
 * Função assíncrona que cria uma coleção (tabela) no Astra DB para armazenar embeddings
 * @param similarityMetric - Métrica de similaridade a usar (padrão: dot_product)
 *
 * O que acontece:
 * 1. Cria uma coleção com suporte a busca vetorial
 * 2. Define dimensão 1536 (tamanho do embedding do OpenAI text-embedding-3-small)
 * 3. Define a métrica de similaridade para busca
 */
const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product",
) => {
  // Cria a coleção no Astra DB com configurações de vector search
  const response = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536, // Tamanho do vetor de embedding (OpenAI padrão: 1536)
      metric: similarityMetric, // Métrica usada para medir similaridade entre vetores
    },
  });

  console.log(response);
};

/**
 * RECURSIVE CHARACTER TEXT SPLITTER (Divisor de Texto Recursivo)
 *
 * Este é um dos componentes mais importantes do pipeline RAG (Retrieval-Augmented Generation)
 *
 * O que faz:
 * - Divide textos grandes em pedaços menores (chunks) de forma inteligente
 * - Mantém o contexto preservando estrutura semântica do texto
 * - Evita cortar frases ou parágrafos no meio
 *
 * Por que é necessário:
 * - Modelos de IA têm limite de tokens que podem processar
 * - Chunks menores geram embeddings mais precisos e relevantes
 * - Facilita buscas semânticas mais eficientes
 *
 * Configuração:
 */
const splitter = new RecursiveCharacterTextSplitter({
  /**
   * chunkSize: 512 caracteres
   * Define o tamanho máximo desejado para cada chunk
   * 512 caracteres ≈ 128 tokens (em média 1 token = 4 caracteres)
   * Ideal para manter contexto suficiente sem ser excessivo
   */
  chunkSize: 512,

  /**
   * chunkOverlap: 100 caracteres
   * Define quanto de sobreposição (overlap) entre chunks consecutivos
   * 100 caracteres de sobreposição garantem contexto entre chunks
   * Evita perder informações quando um chunk termina e outro começa
   *
   * Exemplo:
   * Chunk 1: "...Lorem ipsum dolor sit amet consectetur...ÚLTIMO 100 CHARS"
   * Chunk 2: "PRIMEIRO 100 CHARS...elit sed do eiusmod tempor..."
   * Os últimos 100 caracteres de Chunk 1 se repetem no início de Chunk 2
   */
  chunkOverlap: 100,
});

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  console.log(`Carregando dados de ${docsData.length} documentos...`);

  // aqui entra a parte do langchain para dividir, criar embeddings e salvar no Astra DB
  const chunks = await splitter.splitText(docsData[0]);

  console.log("chunks", chunks);

  for await (const chunk of chunks) {
    // cria os embeddings para cada chunk
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-3-small", // modelo de embedding leve e eficiente
      input: chunk, // array de chunks de texto
      encoding_format: "float", // formato de saída como array de floats
    });

    const vector = embeddings.data[0].embedding; // pega o vetor do primeiro chunk

    // salva cada chunk com seu embedding no Astra DB
    const responseDb = await collection.insertOne({
      $vector: vector, // vetor de embedding
      text: chunk, // texto do chunk
    });

    console.log("responseDb", responseDb);
  }
};

createCollection().then(() => loadSampleData());
