# ChatGPT Clone

A full-featured ChatGPT clone built with Next.js, TypeScript, and modern web technologies. This application provides a complete chat experience with file uploads, voice recording, code editing, and real-time streaming responses using Groq's fast AI models.

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

### Technical Features

- **TypeScript** - Full type safety throughout the application
- **Next.js 14** - Latest React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - Professional code editing experience
- **Uploadcare** - Reliable file upload and CDN service
- **Clerk** - Modern authentication solution
- **Groq** - Fast AI inference platform

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

- The application is designed to be accessible:
  - All interactive elements (buttons, inputs, etc.) have appropriate `aria-label` attributes.
  - Live assistant responses use `aria-live="polite"` so screen readers announce updates.
  - Navigation and layout use ARIA landmark roles (`role="main"`, `role="navigation"`, etc.).
  - Icon-only buttons are labeled for assistive technology.

## 🏗️ Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend functionality
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main chat interface
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── chat-area.tsx     # Main chat interface
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

## 📱 Usage

### Basic Chat

1. Type your message in the input field
2. Press Enter or click the send button
3. View the AI's streaming response powered by Groq

### File Upload

1. Click the "+" button to select files
2. Supported formats: images, PDFs, text files
3. Files are automatically processed and analyzed by the AI

### Voice Recording

1. Click the microphone button to start recording
2. Speak your message
3. Click stop to transcribe and send

### Code Editing

1. Click "Edit" on any code block
2. Modify the code in the Monaco editor
3. Click "Save" to analyze the updated code using Groq

### Chat Management

- Use the sidebar to switch between chats
- Search through chat history
- Delete or rename chats

## 🏛️ Project Architecture

### State Management

The application uses React Context for global state management through the `ChatProvider`. This manages:

- Current chat and messages
- File uploads
- Editor state
- Authentication state

### Data Flow

1. **User Input** → ChatInput component
2. **File Processing** → Uploadcare → AI analysis
3. **Message Creation** → ChatProvider → Database/Local Storage
4. **AI Response** → Groq API → Real-time display
5. **State Updates** → React Context → UI updates

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

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments for implementation details

---

**Note**: This is a demonstration project. Ensure you comply with Groq's usage policies and implement appropriate rate limiting for production use.
