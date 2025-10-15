/**
 * Large Document Processing Utility
 * Handles documents that exceed API limits through intelligent chunking and summarization
 */

interface DocumentChunk {
  text: string;
  index: number;
  title?: string;
}

interface ProcessingStrategy {
  name: string;
  description: string;
  maxSize: number;
}

/**
 * Detect document structure and extract key sections
 */
function extractDocumentStructure(text: string): {
  title?: string;
  sections: { title: string; content: string }[];
  keyPoints: string[];
} {
  const sections: { title: string; content: string }[] = [];
  const keyPoints: string[] = [];
  
  // Extract title (first line or first heading)
  const lines = text.split('\n');
  const title = lines[0]?.trim() || 'Document';
  
  // Look for section headings (lines that are short and capitalized, or start with numbers/bullets)
  const sectionPattern = /^(?:\d+\.|\#|Chapter|Section|Part|Topic|\*\*)/i;
  let currentSection: { title: string; content: string } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check if this looks like a section heading
    if (sectionPattern.test(line) && line.length < 100) {
      // Save previous section if exists
      if (currentSection && currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line.replace(/^\*\*|\*\*$/g, '').trim(),
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
    
    // Extract key points (lines with bullets, numbers, or key indicators)
    if (/^[\-\*•]\s|^\d+\.|key|important|note:|remember:|definition:/i.test(line)) {
      keyPoints.push(line);
    }
  }
  
  // Add last section
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  return { title, sections, keyPoints };
}

/**
 * Intelligently compress text while preserving meaning
 */
function compressText(text: string, targetSize: number): string {
  if (text.length <= targetSize) return text;
  
  // Strategy 1: Remove excessive whitespace and formatting
  let compressed = text
    .replace(/\n{3,}/g, '\n\n')  // Reduce multiple newlines
    .replace(/[ \t]{2,}/g, ' ')   // Reduce multiple spaces
    .trim();
  
  if (compressed.length <= targetSize) return compressed;
  
  // Strategy 2: Extract and prioritize important content
  const structure = extractDocumentStructure(compressed);
  
  // Build compressed version prioritizing sections with more content
  const sortedSections = structure.sections
    .sort((a, b) => b.content.length - a.content.length);
  
  let result = structure.title ? `# ${structure.title}\n\n` : '';
  
  // Add key points first (they're usually most important)
  if (structure.keyPoints.length > 0) {
    result += '## Key Points:\n';
    result += structure.keyPoints.slice(0, 20).join('\n') + '\n\n';
  }
  
  // Add sections until we hit the target size
  const remainingSize = targetSize - result.length;
  const sizePerSection = Math.floor(remainingSize / Math.min(sortedSections.length, 10));
  
  for (let i = 0; i < sortedSections.length && result.length < targetSize - 1000; i++) {
    const section = sortedSections[i];
    result += `## ${section.title}\n`;
    
    // Truncate section content if needed
    const contentToAdd = section.content.length > sizePerSection 
      ? section.content.substring(0, sizePerSection) + '...\n\n'
      : section.content + '\n\n';
    
    if (result.length + contentToAdd.length <= targetSize) {
      result += contentToAdd;
    } else {
      result += section.content.substring(0, targetSize - result.length - 100) + '...';
      break;
    }
  }
  
  return result;
}

/**
 * Create a summary of key topics from the document
 */
function extractKeyTopics(text: string, maxTopics: number = 10): string[] {
  const structure = extractDocumentStructure(text);
  const topics: string[] = [];
  
  // Add section titles as topics
  topics.push(...structure.sections.map(s => s.title).slice(0, maxTopics));
  
  // Extract potential topics from key points
  structure.keyPoints.forEach(point => {
    const topic = point
      .replace(/^[\-\*•]\s|^\d+\./, '')
      .split(/:|;|\./)[0]
      .trim();
    
    if (topic.length > 10 && topic.length < 100) {
      topics.push(topic);
    }
  });
  
  // Remove duplicates and return top topics
  return [...new Set(topics)].slice(0, maxTopics);
}

/**
 * Split document into manageable chunks with context preservation
 */
function splitDocumentIntoChunks(text: string, chunkSize: number = 15000): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const structure = extractDocumentStructure(text);
  
  // If we have sections, chunk by section
  if (structure.sections.length > 0) {
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const section of structure.sections) {
      const sectionText = `## ${section.title}\n${section.content}\n\n`;
      
      // If section alone is too large, split it
      if (sectionText.length > chunkSize) {
        if (currentChunk) {
          chunks.push({
            text: currentChunk,
            index: chunkIndex++,
            title: `Part ${chunkIndex}`
          });
          currentChunk = '';
        }
        
        // Split large section into smaller pieces
        const pieces = sectionText.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
        pieces.forEach(piece => {
          chunks.push({
            text: piece,
            index: chunkIndex++,
            title: section.title
          });
        });
      } else if (currentChunk.length + sectionText.length > chunkSize) {
        // Save current chunk and start new one
        chunks.push({
          text: currentChunk,
          index: chunkIndex++,
          title: `Part ${chunkIndex}`
        });
        currentChunk = sectionText;
      } else {
        currentChunk += sectionText;
      }
    }
    
    if (currentChunk) {
      chunks.push({
        text: currentChunk,
        index: chunkIndex,
        title: `Part ${chunkIndex + 1}`
      });
    }
  } else {
    // No structure detected, split by size
    const regex = new RegExp(`.{1,${chunkSize}}(?:\n|$)`, 'g');
    const pieces = text.match(regex) || [];
    
    pieces.forEach((piece, index) => {
      chunks.push({
        text: piece,
        index,
        title: `Part ${index + 1}`
      });
    });
  }
  
  return chunks;
}

/**
 * Main processor for large documents
 * Returns optimized content that fits within API limits
 */
export async function processLargeDocumentSmart(
  documentText: string,
  userQuery: string,
  maxOutputSize: number = 15000
): Promise<{
  processedText: string;
  strategy: string;
  originalSize: number;
  processedSize: number;
  chunks?: DocumentChunk[];
  topics?: string[];
}> {
  const originalSize = documentText.length;
  
  // Strategy 1: If document is already small enough, return as-is
  if (originalSize <= maxOutputSize) {
    return {
      processedText: documentText,
      strategy: 'no-processing',
      originalSize,
      processedSize: originalSize
    };
  }
  
  // Strategy 2: Try intelligent compression
  console.log(`📄 Processing large document: ${(originalSize / 1024).toFixed(2)}KB`);
  console.log(`🎯 Target size: ${(maxOutputSize / 1024).toFixed(2)}KB`);
  
  const compressed = compressText(documentText, maxOutputSize);
  
  if (compressed.length <= maxOutputSize) {
    console.log(`✅ Compression successful: ${(compressed.length / 1024).toFixed(2)}KB`);
    return {
      processedText: compressed,
      strategy: 'compression',
      originalSize,
      processedSize: compressed.length
    };
  }
  
  // Strategy 3: Extract key topics and create topic-based summary
  console.log('📊 Extracting key topics for focused generation');
  const topics = extractKeyTopics(documentText);
  const chunks = splitDocumentIntoChunks(documentText, maxOutputSize);
  
  // Create a summary that includes:
  // 1. Key topics list
  // 2. Most relevant chunks based on user query
  let summary = `# Document Summary (${topics.length} key topics from ${(originalSize / 1024).toFixed(2)}KB document)\n\n`;
  summary += `## Key Topics:\n${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
  
  // Add user query context
  if (userQuery) {
    summary += `## User Focus: ${userQuery}\n\n`;
  }
  
  // Add most relevant chunks (prioritize beginning and chunks matching query)
  summary += `## Document Content:\n\n`;
  
  const relevantChunks = chunks.slice(0, 3); // Take first 3 chunks
  const remainingSize = maxOutputSize - summary.length;
  const sizePerChunk = Math.floor(remainingSize / relevantChunks.length);
  
  for (const chunk of relevantChunks) {
    const chunkPreview = chunk.text.substring(0, sizePerChunk);
    summary += `### ${chunk.title || `Section ${chunk.index + 1}`}\n${chunkPreview}${chunk.text.length > sizePerChunk ? '...' : ''}\n\n`;
  }
  
  console.log(`✅ Created smart summary: ${(summary.length / 1024).toFixed(2)}KB with ${topics.length} topics`);
  
  return {
    processedText: summary.substring(0, maxOutputSize),
    strategy: 'topic-extraction',
    originalSize,
    processedSize: summary.length,
    chunks,
    topics
  };
}

/**
 * Generate quizzes in batches for very large documents
 * This splits the document into chunks and generates quizzes for each chunk separately
 */
export function prepareMultiChunkGeneration(
  documentText: string,
  specification: string,
  maxChunkSize: number = 15000
): {
  chunks: DocumentChunk[];
  generatePrompt: (chunkIndex: number) => string;
  totalChunks: number;
} {
  const chunks = splitDocumentIntoChunks(documentText, maxChunkSize);
  
  return {
    chunks,
    totalChunks: chunks.length,
    generatePrompt: (chunkIndex: number) => {
      const chunk = chunks[chunkIndex];
      return `Generate quizzes for ${chunk.title || `Part ${chunkIndex + 1}`} of a larger document.

Specification: ${specification}

Content:
${chunk.text}

Create 2-3 quizzes covering the key concepts in this section.`;
    }
  };
}

/**
 * Estimate API token usage (rough approximation)
 */
export function estimateTokenUsage(text: string): {
  estimatedTokens: number;
  estimatedCost: string;
  withinFreeQuota: boolean;
} {
  // Rough estimate: 1 token ≈ 4 characters
  const estimatedTokens = Math.ceil(text.length / 4);
  const withinFreeQuota = estimatedTokens < 15000; // Conservative free tier limit
  
  // Gemini Flash is very cheap, but calculate anyway
  const costPer1MTokens = 0.075; // $0.075 per 1M input tokens
  const estimatedCost = ((estimatedTokens / 1000000) * costPer1MTokens).toFixed(6);
  
  return {
    estimatedTokens,
    estimatedCost: `$${estimatedCost}`,
    withinFreeQuota
  };
}
