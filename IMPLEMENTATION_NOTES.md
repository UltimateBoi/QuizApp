# Embedding-based Document Chunking

This implementation adds intelligent document processing using Google's text-embedding-004 model.

## What was changed:

1. **Updated Model Endpoint**: Changed from `gemini-pro` to `gemini-2.5-flash` in both:
   - `BulkFlashcardGenerator.tsx`
   - `BulkQuizGenerator.tsx`

2. **Created Embeddings Utility** (`src/utils/embeddings.ts`):
   - Uses text-embedding-004 for semantic chunking
   - Implements cosine similarity for relevance ranking
   - Provides fallback to simple truncation if embedding fails

3. **Integration in Generators**:
   - Both bulk generators now use `processLargeDocument()` for files > 20KB
   - Automatically chunks documents and retrieves most relevant sections
   - Semantic search ensures the most relevant content is passed to generation

## How it works:

### For Large Documents (> 20KB):
1. Document is split into chunks (~4000 chars each)
2. Each chunk gets an embedding vector using text-embedding-004
3. User's specification/query also gets an embedding
4. Chunks are ranked by cosine similarity to the query
5. Top 5 most relevant chunks are combined and sent to gemini-2.5-flash

### For Small Documents:
- Passed directly to the generation model without processing

## Benefits:

- **Better Context**: Only relevant sections are used for generation
- **Token Efficiency**: Stays within API limits while processing large docs
- **Semantic Understanding**: Uses embeddings to find truly relevant content
- **Graceful Degradation**: Falls back to truncation if embeddings fail

## API Usage:

The implementation uses two Google APIs:
1. **text-embedding-004**: For creating embeddings and semantic search
2. **gemini-2.5-flash**: For generating quizzes/flashcards

Both use the same API key provided by the user.
