import { DataAPIClient } from "@datastax/astra-db-ts";
import "dotenv/config";
import { OpenAI } from "openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_APPLICATION_TOKEN,
    ASTRA_DB_ENDPOINT,
    ASTRA_DB_COLLECTION,
    OPENAI_API_KEY,
} = process.env;

// Validar variáveis de ambiente
if (
    !ASTRA_DB_NAMESPACE ||
    !ASTRA_DB_APPLICATION_TOKEN ||
    !ASTRA_DB_ENDPOINT ||
    !ASTRA_DB_COLLECTION ||
    !OPENAI_API_KEY
) {
    throw new Error(
        "Variáveis de ambiente obrigatórias não configuradas. Verifique o arquivo .env",
    );
}

console.log(ASTRA_DB_COLLECTION);

// conexão OpenAI
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// conexão Astra DB
const astraClient = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = astraClient.db(ASTRA_DB_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });

const docsData = [`# **NovaVision Tecnologia**

## **Política Corporativa de Férias**

---

### **1. Objetivo**

A presente Política de Férias da **NovaVision Tecnologia** tem como objetivo estabelecer diretrizes claras, transparentes e padronizadas para a concessão, planejamento, aprovação e usufruto das férias dos colaboradores, assegurando o cumprimento da legislação vigente, o bem-estar dos profissionais e a continuidade das operações da empresa.

---

### **2. Abrangência**

Esta política aplica-se a todos os colaboradores da NovaVision Tecnologia, independentemente de cargo, função, regime de contratação ou unidade de atuação, respeitando eventuais particularidades contratuais.

---

### **3. Princípios Gerais**

A NovaVision Tecnologia reconhece a importância do descanso periódico para a saúde física e mental dos colaboradores, bem como para a manutenção da produtividade e qualidade do trabalho. Dessa forma, esta política baseia-se nos seguintes princípios:

* Respeito à legislação trabalhista vigente
* Planejamento antecipado e organização das equipes
* Equilíbrio entre necessidades do colaborador e da empresa
* Transparência nos critérios de aprovação
* Promoção do bem-estar e qualidade de vida

---

### **4. Direito às Férias**

Todo colaborador terá direito a um período de férias remuneradas após completar 12 (doze) meses de trabalho (período aquisitivo), conforme previsto na legislação.

O período de gozo das férias deverá ocorrer dentro dos 12 (doze) meses subsequentes (período concessivo).

---

### **5. Duração das Férias**

A duração das férias poderá variar conforme a legislação aplicável e a assiduidade do colaborador, podendo ser:

* 30 dias corridos
* Períodos reduzidos, conforme faltas injustificadas (quando aplicável por lei)

---

### **6. Fracionamento das Férias**

As férias poderão ser fracionadas em até 3 (três) períodos, desde que:

* Haja concordância do colaborador
* Um dos períodos tenha, no mínimo, 14 dias corridos
* Os demais períodos não sejam inferiores a 5 dias corridos cada

---

### **7. Planejamento de Férias**

#### **7.1. Responsabilidade do Colaborador**

O colaborador deverá:

* Planejar suas férias com antecedência mínima de 60 dias
* Registrar a solicitação no sistema interno da empresa
* Alinhar previamente com sua liderança direta

#### **7.2. Responsabilidade da Liderança**

A liderança deverá:

* Avaliar o impacto da ausência na equipe
* Garantir a continuidade das atividades
* Aprovar ou propor ajustes no período solicitado

---

### **8. Aprovação das Férias**

A aprovação das férias considerará:

* Necessidades operacionais da área
* Disponibilidade da equipe
* Prioridade de solicitações (ordem de pedido)
* Períodos críticos da empresa

A NovaVision Tecnologia se reserva o direito de ajustar datas solicitadas, mediante justificativa e alinhamento com o colaborador.

---

### **9. Comunicação e Formalização**

Após aprovação:

* O colaborador será formalmente comunicado
* O período será registrado no sistema corporativo
* A área de Recursos Humanos realizará os trâmites legais e administrativos

---

### **10. Remuneração de Férias**

O pagamento das férias será realizado conforme legislação vigente, incluindo:

* Remuneração correspondente ao período de férias
* Adicional constitucional de 1/3

O pagamento será efetuado até 2 (dois) dias antes do início do período de férias.

---

### **11. Venda de Férias (Abono Pecuniário)**

O colaborador poderá optar pela conversão de até 1/3 do período de férias em abono pecuniário, desde que:

* Solicite formalmente com antecedência mínima de 15 dias antes do término do período aquisitivo
* Haja aprovação conforme diretrizes internas

---

### **12. Alteração ou Cancelamento de Férias**

A alteração ou cancelamento de férias poderá ocorrer em situações excepcionais, tais como:

* Necessidade crítica da empresa
* Situações emergenciais

Nestes casos:

* O colaborador será comunicado com antecedência
* Eventuais prejuízos comprovados poderão ser analisados pela empresa

---

### **13. Férias Coletivas**

A empresa poderá instituir férias coletivas, parcial ou total, conforme necessidade estratégica, comunicando previamente os colaboradores e respeitando os prazos legais.

---

### **14. Colaboradores em Período de Experiência**

Colaboradores em período de experiência poderão ter regras específicas para concessão de férias, conforme legislação e políticas internas.

---

### **15. Interrupção das Férias**

As férias poderão ser interrompidas apenas em situações excepcionais e devidamente justificadas, mediante concordância do colaborador, conforme legislação aplicável.

---

### **16. Disposições Gerais**

* O não cumprimento desta política poderá resultar em medidas administrativas
* Casos omissos serão analisados pelo setor de Recursos Humanos
* Esta política poderá ser revisada a qualquer momento, visando melhorias contínuas

---

### **17. Vigência**

Esta política entra em vigor na data de sua publicação e permanece válida por prazo indeterminado, até que nova versão seja oficialmente divulgada.

---

### **18. Considerações Finais**

A NovaVision Tecnologia reforça seu compromisso com o bem-estar de seus colaboradores, entendendo que o descanso adequado é fundamental para o desenvolvimento profissional, inovação e sustentabilidade organizacional.

---

**NovaVision Tecnologia**
Departamento de Recursos Humanos
`];

type SimilarityMetric = "cosine" | "euclidean" | "dot_product";

// dot_product = é recomendado para embeddings de alta dimensão, como os da OpenAI, pois pode capturar melhor as relações semânticas entre os vetores. Cosine é útil para comparar a direção dos vetores, mas pode ser menos eficaz em alta dimensão. Euclidean mede a distância real entre os vetores, mas pode ser afetado pela magnitude dos vetores. Para embeddings de alta dimensão, dot_product geralmente é a melhor escolha.

// createCollection = cria a coleção no Astra DB com a métrica de similaridade especificada.
const createCollection = async (
    similarityMetric: SimilarityMetric = "dot_product",
) => {
    const response = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536, // dimensão dos embeddings da OpenAI
            metric: similarityMetric,
        },
    });

    console.log("Collection criada:", response);
};

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

const loadSampleData = async () => {
    const collection = db.collection(ASTRA_DB_COLLECTION);

    console.log(`Carregando dados de ${docsData.length} documentos...`);

    const chunks = await splitter.splitText(docsData[0]);

    console.log("chunks", chunks);

    //criar os embeddings para cada chunk
    const embeddings = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks,
        encoding_format: "float",
    });

    //pega o vetor do primeiro chunk (apenas para teste)
    const vector = embeddings.data[0].embedding;

    const responseDb = await collection.insertOne({
        $vector: vector, // vetor de embedding para busca vetorial
        text: chunks, // armazenar o texto original para referência
    })

    console.log("responseDb", responseDb);
};


createCollection().then(() => loadSampleData());