import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { pipeline, env } from '@huggingface/transformers';

// Disable local cache and remote fetching settings if necessary (using defaults here)
env.allowLocalModels = false;
env.useBrowserCache = false;

let extractor: any = null;

// Singleton to avoid reloading the model
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Supabase/gte-small');
  }
  return extractor;
}

// Generate embeddings using open-source HuggingFace model (gte-small)
export async function generateEmbeddings(text: string) {
  const extract = await getExtractor();
  const output = await extract(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function processDocument(buffer: Buffer, type: string) {
  let text = '';

  if (type === 'application/pdf') {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    text = data.text;
  } else {
    text = buffer.toString('utf-8');
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(text);

  // Here we would generate embeddings for each chunk and store in pgvector via Prisma
  const processedChunks = await Promise.all(
    chunks.map(async (chunk) => ({
      content: chunk,
      embedding: await generateEmbeddings(chunk),
    }))
  );

  return processedChunks;
}
