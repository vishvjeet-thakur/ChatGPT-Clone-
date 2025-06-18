# API Documentation

This document provides comprehensive documentation for all API endpoints in the ChatGPT Clone application.

## Overview

The application uses Next.js API routes to handle backend functionality. All endpoints are located in the `src/app/api/` directory and provide serverless functions for:

- Chat completions with streaming responses using Groq
- File processing and analysis
- Audio transcription
- Code analysis using Groq
- Chat management (CRUD operations)
- Authentication and user management

## Base URL

All API endpoints are relative to the application base URL:

- Development: `http://localhost:3000/api/`
- Production: `https://your-domain.com/api/`

## Authentication

Most endpoints require authentication via Clerk. The authentication is handled automatically by the frontend, and user information is available in the request context.

## Endpoints

### 1. Chat Completions

#### `POST /api/chat`

Handles chat completions with streaming responses from Groq.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "assistantMessageId": "uuid-string"
}
```

**Response:**

- **Content-Type:** `text/plain`
- **Stream:** Yes (Server-Sent Events)
- **Body:** Streaming text response from Groq

**Features:**

- Real-time streaming responses using Groq's fast inference
- Message history context
- Error handling with fallback messages
- Rate limiting protection

**Example Usage:**

```javascript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello" }],
    assistantMessageId: "msg-123",
  }),
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

---

### 2. File Processing

#### `POST /api/process-file`

Processes uploaded files and extracts content for AI analysis.

**Request Body:**

```json
{
  "url": "https://uploadcare.com/file-url",
  "mimeType": "image/jpeg"
}
```

**Response:**

```json
{
  "content": "Extracted text content from file",
  "type": "image|document|text"
}
```

**Supported File Types:**

- **Images:** JPEG, PNG, GIF, WebP (OCR processing)
- **Documents:** PDF, DOC, DOCX (text extraction)
- **Text:** TXT files (direct content)

**Features:**

- Automatic file type detection
- OCR for images using Groq's vision capabilities
- PDF text extraction
- Document parsing
- Error handling for unsupported formats

---

### 3. Audio Transcription

#### `POST /api/transcribe`

Transcribes audio recordings to text.

**Request Body:**

- **Content-Type:** `multipart/form-data`
- **Field:** `audio` (WebM audio file)

**Response:**

```json
{
  "text": "Transcribed text from audio"
}
```

**Features:**

- WebM audio format support
- Groq Whisper API integration
- Automatic language detection
- Error handling for audio processing

**Example Usage:**

```javascript
const formData = new FormData();
formData.append("audio", audioBlob);

const response = await fetch("/api/transcribe", {
  method: "POST",
  body: formData,
});

const { text } = await response.json();
```

---

### 4. Code Analysis

#### `POST /api/code`

Analyzes and provides feedback on code using Groq.

**Request Body:**

```json
{
  "code": "function hello() { console.log('Hello World'); }",
  "language": "javascript"
}
```

**Response:**

- **Content-Type:** `text/plain`
- **Stream:** Yes (Server-Sent Events)
- **Body:** Streaming code analysis and suggestions

**Features:**

- Syntax highlighting support
- Code quality analysis using Groq's code understanding
- Bug detection
- Performance suggestions
- Best practices recommendations

**Supported Languages:**

- JavaScript, TypeScript
- Python, Java, C++
- HTML, CSS, SQL
- And many more via Groq's code understanding

---

### 5. Chat Management

#### `GET /api/chats`

Retrieves all chats for the authenticated user.

**Response:**

```json
[
  {
    "_id": "mongodb-id",
    "id": "local-uuid",
    "title": "Chat Title",
    "messages": [...],
    "userId": "clerk-user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Features:**

- User-specific chat retrieval
- Pagination support (future)
- Sorting by recent activity
- Error handling for database issues

---

#### `POST /api/chats`

Creates a new chat.

**Request Body:**

```json
{
  "id": "local-uuid",
  "title": "New Chat",
  "messages": []
}
```

**Response:**

```json
{
  "_id": "mongodb-id",
  "id": "local-uuid",
  "title": "New Chat",
  "messages": [],
  "userId": "clerk-user-id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### `PUT /api/chats`

Updates an existing chat.

**Request Body:**

```json
{
  "chatId": "mongodb-id",
  "title": "Updated Title",
  "messages": [...]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Chat updated successfully"
}
```

---

#### `DELETE /api/chats`

Deletes a chat.

**Request Body:**

```json
{
  "chatId": "mongodb-id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

### 6. Title Generation

#### `POST /api/generate-title`

Generates a title for a chat based on the first message using Groq.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, I need help with JavaScript"
    }
  ]
}
```

**Response:**

- **Content-Type:** `text/plain`
- **Stream:** Yes (Server-Sent Events)
- **Body:** Streaming title generation

**Features:**

- Automatic title generation using Groq
- Context-aware naming
- Streaming response for real-time feedback
- Fallback to "New Chat" if generation fails

---

## Error Handling

All API endpoints implement consistent error handling:

### Error Response Format

```json
{
  "error": "Error message description",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error (server issues)

### Error Handling Examples

```javascript
try {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  // Handle successful response
} catch (error) {
  console.error("API Error:", error.message);
  // Handle error in UI
}
```

## Rate Limiting

The application implements rate limiting to prevent abuse:

- **Chat completions:** 10 requests per minute per user
- **File uploads:** 20 files per hour per user
- **Transcription:** 30 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

## Security Features

### Input Validation

- Request body validation using Zod schemas
- File type and size validation
- SQL injection prevention
- XSS protection

### Authentication

- Clerk JWT token validation
- User session management
- Role-based access control

### Data Protection

- Environment variable usage for sensitive data
- HTTPS enforcement in production
- CORS configuration
- Request sanitization

## Environment Variables

Required environment variables for API functionality:

```env
# Groq AI
GROQ_API_KEY=your_groq_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Uploadcare
NEXT_PUBLIC_UPLOADCARE_API_KEY=your_uploadcare_public_key
NEXT_PUBLIC_UPLOADCARE_SECRET_KEY=your_uploadcare_secret_key
```

## Testing

API endpoints can be tested using tools like:

- **Postman** - For manual testing
- **curl** - For command-line testing
- **Jest** - For automated testing

### Example curl Commands

```bash
# Test chat completion
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"assistantMessageId":"test-123"}'

# Test file processing
curl -X POST http://localhost:3000/api/process-file \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/file.jpg","mimeType":"image/jpeg"}'

# Test transcription
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
```

## Monitoring and Logging

API endpoints include comprehensive logging:

- Request/response logging
- Error tracking
- Performance monitoring
- User activity tracking

Logs are available in:

- Development: Console output
- Production: Cloud logging services

## Performance Optimization

- **Caching:** Redis caching for frequently accessed data
- **Compression:** Gzip compression for responses
- **CDN:** Static asset delivery via CDN
- **Database:** Connection pooling and query optimization
- **Streaming:** Real-time response streaming with Groq

## Future Enhancements

Planned API improvements:

- **WebSocket support** for real-time chat
- **File upload progress** tracking
- **Advanced search** functionality
- **Chat export** features
- **Multi-language** support
- **Analytics** and usage tracking
