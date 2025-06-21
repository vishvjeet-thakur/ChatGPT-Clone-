# ChatGPT Clone

A full-featured ChatGPT clone built with Next.js, TypeScript, and modern web technologies. This application provides a complete chat experience with file uploads, voice recording, code editing, real-time streaming responses using Groq's fast AI models, and intelligent memory management using Mem0 AI.

Deployed on Vercel :  https://chatgpt-clone-five-ecru.vercel.app/

## 🚀 Features

### Core Chat Functionality

- **Real-time streaming responses** - Get instant, streaming responses from Groq's AI models
- **Message history** - Persistent chat history with local storage and database sync
- **Context window management** - Intelligent message trimming to stay within 100k token limit
- **Markdown rendering** - Rich text formatting with code syntax highlighting
- **Code block editing** - Edit and analyze code directly in the chat interface
- **File upload support** - Upload images, PDFs, documents, and text files
- **Voice recording** - Record and transcribe audio messages
- **Responsive design** - Works seamlessly on desktop and mobile devices

### Advanced Features

- **User authentication** - Sign up/sign in with Clerk authentication
- **Local storage support** - Works offline for unsigned users
- **Database integration** - MongoDB for signed users with automatic sync
- **File processing** - AI analyzes uploaded files and extracts content
- **Code analysis** - Dedicated code editor with syntax highlighting
- **Search functionality** - Search through chat history
- **Theme support** - Dark theme optimized for coding and reading
- **Intelligent Memory System** - Persistent memory using Mem0 AI for personalized conversations

### Memory Features (Mem0 AI Integration)

- **Persistent Memory** - AI remembers your preferences, past conversations, and context across sessions
- **Smart Context Retrieval** - Automatically retrieves relevant memories based on current conversation
- **User-Specific Memory** - Each user has their own isolated memory space
- **Automatic Memory Storage** - Conversations are automatically stored for future reference
- **Memory Search** - Intelligent search through past interactions for relevant context
- **Memory Privacy** - User data is isolated and secure with proper authentication

### Technical Features

- **TypeScript** - Full type safety throughout the application
- **Next.js 14** - Latest React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - Professional code editing experience
- **Uploadcare** - Reliable file upload and CDN service
- **Clerk** - Modern authentication solution
- **Groq** - Fast AI inference platform
- **Mem0 AI** - Intelligent memory management system

## Features

### Edit User Messages

- Users can edit their previously sent messages by clicking the **Edit** button below their message.
- After editing, the assistant's response is regenerated based on the updated message.
- A **Cancel** button allows aborting the edit.
- The edit feature is fully ARIA compliant, with accessible labels for all controls.

### Regenerate Assistant Response

- Users can regenerate the assistant's response to any message by clicking the **Regenerate** (circular arrow) button below the assistant's message.
- The assistant will generate a new, slightly varied response using a higher temperature for more creativity.
- The regeneration button is ARIA compliant and accessible to screen readers.

### Accessibility (ARIA Compliance)

The application is designed with comprehensive accessibility features to ensure it's usable by everyone:

#### Screen Reader Support

- **Semantic HTML** - Proper use of headings, landmarks, and semantic elements
- **ARIA Labels** - All interactive elements have descriptive `aria-label` attributes
- **Live Regions** - Assistant responses use `aria-live="polite"` for screen reader announcements
- **Focus Management** - Logical tab order and visible focus indicators
- **Skip Links** - Keyboard navigation shortcuts for main content areas

#### Keyboard Navigation

- **Full Keyboard Support** - All features accessible via keyboard
- **Tab Navigation** - Logical tab order through all interactive elements
- **Keyboard Shortcuts** - Enter to send messages, Escape to cancel operations
- **Focus Indicators** - Clear visual indicators for focused elements

#### Visual Accessibility

- **High Contrast** - Dark theme optimized for readability
- **Color Independence** - Information not conveyed by color alone
- **Text Scaling** - Responsive design supports text scaling up to 200%
- **Clear Typography** - Readable fonts with adequate spacing

#### Interactive Elements

- **Button Labels** - All buttons have descriptive text or aria-labels
- **Form Validation** - Clear error messages and validation feedback
- **Loading States** - Accessible loading indicators and progress feedback
- **Error Handling** - Clear error messages for all failure states

#### Memory and Context Features

- **Memory Status** - Screen readers announce when memory is being retrieved or stored
- **Context Changes** - Users are notified when conversation context changes
- **File Upload Feedback** - Clear feedback for file upload progress and status

## 🏗️ Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend functionality
│   │   ├── memory/        # Mem0 AI memory management
│   │   ├── chat/          # Main chat endpoint
│   │   ├── transcribe/    # Audio transcription
│   │   └── process-file/  # File processing
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main chat interface
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── chat-area.tsx     # Main chat interface with memory integration
│   ├── chat-input.tsx    # Input component with file upload & voice
│   ├── message.tsx       # Individual message display
│   ├── sidebar.tsx       # Chat history sidebar
│   └── code-editor.tsx   # Monaco editor for code editing
├── lib/                  # Utility functions and configurations
├── models/               # MongoDB schemas
└── types/                # TypeScript type definitions
```

### Backend API Routes

- `/api/chat` - Main chat endpoint with streaming responses using Groq
- `/api/chats` - Chat management (CRUD operations)
- `/api/code` - Code analysis and feedback using Groq
- `/api/transcribe` - Audio transcription
- `/api/process-file` - File content extraction
- `/api/generate-title` - Automatic chat title generation using Groq
- `/api/memory` - Memory management using Mem0 AI (search and store interactions)

### Memory System Architecture

The memory system integrates seamlessly with the chat experience:

1. **Memory Retrieval** - When a user sends a message, the system queries Mem0 AI for relevant memories
2. **Context Enhancement** - Retrieved memories are included in the AI prompt for personalized responses
3. **Memory Storage** - After each conversation, interactions are automatically stored in Mem0 AI
4. **User Isolation** - Each user's memories are completely isolated using unique user IDs

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Markdown** - Markdown rendering
- **Monaco Editor** - Code editor component
- **Lucide React** - Icon library

### Backend & Services

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Database for chat storage
- **Clerk** - Authentication service
- **Uploadcare** - File upload and CDN
- **Groq** - Fast AI chat completions and code analysis
- **Mem0 AI** - Intelligent memory management and context retrieval

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database
- Groq API key
- Clerk account
- Uploadcare account
- Mem0 AI API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Groq AI
GROQ_API_KEY=your_groq_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Uploadcare
NEXT_PUBLIC_UPLOADCARE_API_KEY=your_uploadcare_public_key
NEXT_PUBLIC_UPLOADCARE_SECRET_KEY=your_uploadcare_secret_key

# Mem0 AI Memory System
MEM0_API_KEY=your_mem0_api_key
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chatgpt-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and configuration

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🔧 Configuration

### Database Setup

The application uses MongoDB for storing chat data. Ensure your MongoDB connection string is properly configured in the environment variables.

### File Upload Configuration

Uploadcare handles file uploads. Configure your Uploadcare keys in the environment variables to enable file upload functionality.

### Authentication Setup

Clerk provides authentication. Set up your Clerk application and configure the keys in the environment variables.

### Groq AI Setup

Groq provides fast AI inference. Get your API key from [Groq Console](https://console.groq.com/) and configure it in the environment variables.

### Mem0 AI Memory Setup

Mem0 AI provides intelligent memory management. Get your API key from [Mem0 AI](https://mem0.ai/) and configure it in the environment variables. The memory system will automatically:

- Store conversation interactions for authenticated users
- Retrieve relevant memories based on current context
- Provide personalized responses using historical context
- Maintain user privacy with isolated memory spaces

## 📱 Usage

### Basic Chat

1. Type your message in the input field
2. Press Enter or click the send button
3. View the AI's streaming response powered by Groq
4. The system automatically retrieves relevant memories for personalized responses

### Memory-Enhanced Conversations

- **Automatic Memory Retrieval** - The AI automatically searches your conversation history for relevant context
- **Personalized Responses** - Responses are tailored based on your past interactions and preferences
- **Context Continuity** - The AI remembers your preferences, coding styles, and conversation patterns
- **Memory Privacy** - All memories are isolated to your user account and protected by authentication

### File Upload

1. Click the "+" button to select files
2. Supported formats: images, PDFs, text files
3. Files are automatically processed and analyzed by the AI
4. File content is included in memory for future reference

### Voice Recording

1. Click the microphone button to start recording
2. Speak your message
3. Click stop to transcribe and send
4. Voice interactions are stored in memory for context

### Code Editing

1. Click "Edit" on any code block
2. Modify the code in the Monaco editor
3. Click "Save" to analyze the updated code using Groq
4. Code preferences and patterns are remembered for future assistance

### Chat Management

- Use the sidebar to switch between chats
- Search through chat history
- Delete or rename chats
- Memory context is maintained across all chats

## 🏛️ Project Architecture

### State Management

The application uses React Context for global state management through the `ChatProvider`. This manages:

- Current chat and messages
- File uploads
- Editor state
- Authentication state
- Memory integration state

### Data Flow

1. **User Input** → ChatInput component
2. **Memory Retrieval** → Mem0 AI → Relevant context
3. **File Processing** → Uploadcare → AI analysis
4. **Message Creation** → ChatProvider → Database/Local Storage
5. **AI Response** → Groq API → Real-time display
6. **Memory Storage** → Mem0 AI → Future context
7. **State Updates** → React Context → UI updates

### Memory Integration Flow

```
User Message → Memory Search → Context Enhancement → AI Response → Memory Storage
     ↓              ↓                ↓                ↓              ↓
  Input Text   Query Mem0 AI    Include Memory    Generate      Store Interaction
                                    in Prompt      Response      in Mem0 AI
```

### Component Hierarchy

```
App
├── ChatProvider (Context)
├── Layout
│   ├── Sidebar
│   └── ChatArea
│       ├── ChatHeader
│       ├── MessageList
│       │   └── Message
│       │       ├── MessageContent
│       │       ├── MessageActions
│       │       └── MessageAttachments
│       └── ChatInput
│           ├── FileUpload
│           └── VoiceRecorder
└── CodeEditor (Modal)
```

## 🔒 Security Features

- **Authentication** - Secure user authentication with Clerk
- **File validation** - File type and size validation
- **API rate limiting** - Protection against abuse
- **Environment variables** - Secure configuration management
- **CORS protection** - Cross-origin request security
- **Memory isolation** - User-specific memory spaces with authentication
- **Data privacy** - Secure handling of user conversations and preferences

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Groq for fast AI inference
- Mem0 AI for intelligent memory management
- Vercel for Next.js framework
- Clerk for authentication
- Uploadcare for file handling
- Monaco Editor for code editing
- Tailwind CSS for styling

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments for implementation details

---

**Note**: This is a demonstration project. Ensure you comply with Groq's and Mem0 AI's usage policies and implement appropriate rate limiting for production use.
