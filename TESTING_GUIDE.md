# Testing Guide for Embedding-based Document Chunking

## Overview
This document explains how to test the new embedding-based document chunking feature.

## Prerequisites
- A valid Google Gemini API key
- Access to the QuizApp interface

## Testing the Feature

### Test 1: Small Document (No Chunking)
1. Navigate to "Bulk Generate Flashcards" or "Bulk Generate Quiz"
2. Enter your API key
3. Upload a small text file (<20KB)
4. Enter a specification (e.g., "Computer Science basics")
5. Click "Generate"
6. **Expected**: Document is processed normally without chunking

### Test 2: Large Document (With Embeddings)
1. Navigate to "Bulk Generate Flashcards" or "Bulk Generate Quiz"
2. Enter your API key
3. Upload a large text file (>20KB)
   - You can create one by copying/pasting multiple chapters or sections
4. Enter a specific specification (e.g., "Data structures and algorithms")
5. Click "Generate"
6. **Expected**: 
   - Document is automatically chunked
   - Most relevant sections are retrieved based on your specification
   - Generated content is focused on your query
   - Check browser console for any embedding-related logs

### Test 3: Model Endpoint Update
1. Try generating with the updated endpoint
2. **Expected**: No errors from the API
3. Successful generation using `gemini-2.5-flash` model

### Test 4: Fallback Mechanism
To test the fallback (requires controlled failure):
1. Use an invalid/expired API key temporarily
2. Upload a large document
3. **Expected**: Should fall back to simple truncation with a console warning

## Verification Points

### UI Indicators
- Help text mentions: "Large documents (>20KB) are automatically processed using semantic chunking"
- API limits section mentions: "Gemini 2.5 Flash with text-embedding-004"

### Console Output
When processing large documents, you should see:
- No errors related to embeddings (if successful)
- Warning message if fallback is triggered: "Failed to use embeddings, falling back to truncation"

### Generated Content Quality
For large documents:
- Content should be relevant to your specification/query
- Shouldn't include unrelated sections from the document
- Should maintain coherence and context

## Sample Test Documents

### Small Document (for baseline)
```
Create a text file with 2-3 paragraphs about a topic (< 5KB)
```

### Large Document (to trigger embeddings)
```
Create or find a text file with:
- Multiple chapters or sections
- At least 25KB of content
- Diverse topics within a subject area
```

Good sources:
- Lecture notes compilation
- Multiple Wikipedia articles combined
- Study guide PDFs converted to text
- Technical documentation

## API Calls Made

When processing a large document with embeddings:
1. **text-embedding-004 API**: Called for each chunk (5-7 times typically)
2. **text-embedding-004 API**: Called once for the query/specification
3. **gemini-2.5-flash API**: Called once for generation with processed content

## Performance Expectations

- Small documents: Instant (no additional processing)
- Large documents (20-50KB): 5-10 seconds for embedding computation
- Very large documents (50-100KB): 10-20 seconds for embedding computation

## Troubleshooting

### "Embedding API error" message
- Check API key is valid
- Verify API key has access to text-embedding-004 model
- Check rate limits (15 RPM for free tier)

### Generation fails after successful embedding
- Check gemini-2.5-flash model endpoint is accessible
- Verify token limits aren't exceeded
- Check API key quotas

### Fallback to truncation
- If embeddings fail, system automatically truncates to first 20KB
- This is normal behavior when embeddings aren't available
- Check console for specific error message

## Expected Results

### Success Criteria
✓ Builds without errors
✓ No TypeScript type errors
✓ Small documents process normally
✓ Large documents trigger embedding-based chunking
✓ Generated content is relevant to user's specification
✓ Fallback works when embeddings fail
✓ Model endpoint update (gemini-2.5-flash) works

### What Changed
- Model endpoint: `gemini-pro` → `gemini-2.5-flash`
- Large file handling: Simple truncation → Semantic chunking with embeddings
- Document processing: Direct pass-through → Intelligent retrieval of relevant sections
