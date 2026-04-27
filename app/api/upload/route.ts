/**
 * 🔒 ROUTE HANDLER - Upload de Documentos (DOCX/PDF)
 *
 * Funcionalidade:
 * ✅ Recebe arquivo DOCX ou PDF via multipart form
 * ✅ Valida tipo e tamanho do arquivo
 * ✅ Salva o arquivo na pasta /upload-de-arquivos
 * ✅ Extrai texto do documento
 * ✅ Chunka o texto
 * ✅ Gera embeddings com OpenAI
 * ✅ Armazena no Astra DB para busca semântica
 */

import "dotenv/config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import JSZip from "jszip";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Para DOCX - usar uma biblioteca simples de parsing
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    const docFile = zip.file("word/document.xml");
    if (!docFile) throw new Error("Formato DOCX inválido");

    const xmlContent = await docFile.async("text");

    // Extrair texto removendo tags XML
    const text = xmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (error) {
    throw new Error(`Erro ao extrair texto do DOCX: ${error}`);
  }
}

// Para PDF
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Usar dynamic import para pdf-parse
    const pdfModule = await import("pdf-parse");
    const pdfParse =
      (pdfModule as Record<string, unknown>).default || pdfModule;
    const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(
      buffer,
    );
    return data.text;
  } catch (error) {
    throw new Error(`Erro ao extrair texto do PDF: ${error}`);
  }
}

// Chunking com RecursiveCharacterTextSplitter
async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
  });

  return await splitter.splitText(text);
}

// Inicializar clientes
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDbClient = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const database = astraDbClient.db(process.env.ASTRA_DB_ENDPOINT, {
  keyspace: process.env.ASTRA_DB_NAMESPACE,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Nenhum arquivo fornecido" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validar tipo de arquivo
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Tipo de arquivo inválido. Apenas DOCX e PDF são aceitos.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validar tamanho máximo (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          error: "Arquivo muito grande. Máximo 50MB.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar pasta de uploads se não existir
    const uploadsPath = join(process.cwd(), "upload-de-arquivos");
    try {
      await mkdir(uploadsPath, { recursive: true });
    } catch (error) {
      console.error("Erro ao criar diretório:", error);
    }

    // Salvar arquivo em disco
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = join(uploadsPath, fileName);

    await writeFile(filePath, buffer);
    console.log(`Arquivo salvo: ${filePath}`);

    // ========================================================================
    // ETAPA 1️⃣: EXTRAIR TEXTO DO DOCUMENTO
    // ======================================================================== //

    let extractedText = "";

    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPdf(buffer);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await extractTextFromDocx(buffer);
    }

    if (!extractedText.trim()) {
      return new Response(
        JSON.stringify({
          error: "Não foi possível extrair texto do documento.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(`Texto extraído: ${extractedText.length} caracteres`);

    // ========================================================================
    // ETAPA 2️⃣: CHUNKAR O TEXTO
    // ======================================================================== //

    const chunks = await chunkText(extractedText);
    console.log(`Documento dividido em ${chunks.length} chunks`);

    // ========================================================================
    // ETAPA 3️⃣: GERAR EMBEDDINGS E ARMAZENAR NO ASTRA DB
    // ======================================================================== //

    const collection = database.collection(process.env.ASTRA_DB_COLLECTION);

    try {

        console.log("chunks gerados", chunks);

      for await (const chunk of chunks) {
        // Gerar embedding para o chunk
        const embedding = await openaiClient.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
          encoding_format: "float",
        });

        // Armazenar no Astra DB
        await collection.insertOne({
          $vector: embedding.data[0].embedding,
          text: chunk,
        });
      }
    } catch (error) {
      console.error(`Erro ao processar chunk: ${error}`);
    }

    console.log(`Chunks armazenados com sucesso`);

    return new Response(
      JSON.stringify({
        message: "Arquivo processado com sucesso",
        fileName: file.name,
        storedFileName: fileName,
        textLength: extractedText.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erro no endpoint /api/upload:", errorMessage);

    return new Response(
      JSON.stringify({
        error: "Falha ao processar upload",
        details: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
