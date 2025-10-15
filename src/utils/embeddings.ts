/**
 * Utility functions for text embeddings and document chunking
 * Uses Google's text-embedding-004 model for semantic chunking
 */

interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

interface ChunkWithEmbedding {
  text: string;
  embedding: number[];
  startIndex: number;
  endIndex: number;
}

/**
 * Get embedding for a text chunk using Google's text-embedding-004 model
 */
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  // Ensure text doesn't exceed byte limit (Google's limit is 20KB for embeddings)
  // Using very conservative limit to account for JSON overhead and UTF-8 encoding
  const maxBytes = 10000; // Very conservative limit to avoid API errors
  const encoder = new TextEncoder();
  let truncatedText = text;
  
  // Check if text exceeds byte limit and truncate if necessary
  let encoded = encoder.encode(text);
  if (encoded.length > maxBytes) {
    // Truncate to fit within byte limit, accounting for potential multibyte characters
    const decoder = new TextDecoder();
    truncatedText = decoder.decode(encoded.slice(0, maxBytes));
    // Remove any incomplete character at the end
    truncatedText = truncatedText.replace(/[\uD800-\uDFFF]$/, '');
    console.warn(`Text truncated from ${encoded.length} to ${maxBytes} bytes for embedding`);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: truncatedText }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Embedding API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Split text into chunks based on token limit
 * Aims for smaller chunks to avoid embedding API limits
 * Using very conservative chunk size to stay well under API limits
 */
function splitIntoChunks(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Add some overlap for context continuity
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Chunk a large document and compute embeddings for semantic retrieval
 */
export async function chunkDocumentWithEmbeddings(
  document: string,
  apiKey: string,
  maxChunkSize: number = 1500
): Promise<ChunkWithEmbedding[]> {
  // Split document into manageable chunks
  const textChunks = splitIntoChunks(document, maxChunkSize);
  
  // Compute embeddings for each chunk
  const chunksWithEmbeddings: ChunkWithEmbedding[] = [];
  let currentIndex = 0;
  
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    try {
      const embedding = await getEmbedding(chunk, apiKey);
      chunksWithEmbeddings.push({
        text: chunk,
        embedding,
        startIndex: currentIndex,
        endIndex: currentIndex + chunk.length,
      });
      currentIndex += chunk.length + 2; // +2 for paragraph break
      
      // Add longer delay between requests to avoid rate limiting
      if (i < textChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error computing embedding for chunk:', error);
      // Include chunk without embedding for completeness
      chunksWithEmbeddings.push({
        text: chunk,
        embedding: [],
        startIndex: currentIndex,
        endIndex: currentIndex + chunk.length,
      });
      currentIndex += chunk.length + 2;
    }
  }
  
  return chunksWithEmbeddings;
}

/**
 * Retrieve the most relevant chunks based on a query
 */
export async function retrieveRelevantChunks(
  query: string,
  chunks: ChunkWithEmbedding[],
  apiKey: string,
  topK: number = 5
): Promise<string[]> {
  // Get embedding for the query
  const queryEmbedding = await getEmbedding(query, apiKey);
  
  // Calculate similarity scores for each chunk
  const scoredChunks = chunks
    .filter(chunk => chunk.embedding.length > 0) // Only consider chunks with embeddings
    .map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score) // Sort by descending similarity
    .slice(0, topK); // Take top K chunks
  
  return scoredChunks.map(sc => sc.chunk.text);
}

/**
 * Process a large document for generation by chunking and retrieving relevant sections
 * This is the main entry point for document processing
 */
export async function processLargeDocument(
  document: string,
  query: string,
  apiKey: string,
  maxTokens: number = 20000
): Promise<string> {
  // If document is small enough, return as-is
  if (document.length < maxTokens) {
    return document;
  }
  
  // Chunk the document with embeddings
  const chunks = await chunkDocumentWithEmbeddings(document, apiKey);
  
  // Retrieve most relevant chunks based on the query/specification
  const relevantChunks = await retrieveRelevantChunks(query, chunks, apiKey, 5);
  
  // Combine relevant chunks into a single context
  return relevantChunks.join('\n\n---\n\n');
}
