# Component Documentation

This document provides detailed documentation for all React components in the ChatGPT Clone application.

## Overview

The application is built with a modular component architecture using React 18, TypeScript, and Tailwind CSS. Components are organized by functionality and follow consistent patterns for props, state management, and styling. The application uses Groq for fast AI inference instead of OpenAI.

## Component Architecture

```
src/components/
├── ui/                    # Base UI components
├── chat-area.tsx         # Main chat interface
├── chat-input.tsx        # Input with file upload & voice
├── chat-provider.tsx     # Global state management
├── message.tsx           # Individual message display
├── sidebar.tsx           # Chat history sidebar
├── code-editor.tsx       # Monaco editor for code
├── voice-recorder.tsx    # Audio recording component
├── file-viewer-dialog.tsx # File preview modal
└── search-dialog.tsx     # Chat search functionality
```

## Core Components

### 1. ChatProvider

**File:** `src/components/chat-provider.tsx`

**Purpose:** Global state management for the entire chat application.

**Features:**

- Chat history management
- Message handling and streaming
- File upload state
- Code editor state
- Authentication state sync
- Local storage and database persistence

**Key Methods:**

- `createNewChat()` - Creates a new chat session
- `addMessage()` - Adds messages to current chat
- `setMessage()` - Updates message content (for streaming)
- `selectChat()` - Switches between chats
- `deleteChat()` - Removes chat from history

**Usage:**

```tsx
import { useChat } from "@/components/chat-provider";

function MyComponent() {
  const { chats, currentChatId, addMessage, createNewChat } = useChat();

  // Component logic
}
```

---

### 2. ChatArea

**File:** `src/components/chat-area.tsx`

**Purpose:** Main chat interface that orchestrates all chat functionality.

**Props:**

```tsx
interface ChatAreaProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}
```

**Features:**

- Message display and history
- Real-time streaming responses using Groq
- File upload and processing
- Code editing capabilities
- User authentication integration
- Responsive design

**Key Functionality:**

- Auto-scrolling to latest messages
- File processing and AI analysis
- Streaming response handling with Groq
- Code editor integration
- Chat title generation using Groq
- Error handling and fallbacks

**Usage:**

```tsx
<ChatArea sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
```

---

### 3. ChatInput

**File:** `src/components/chat-input.tsx`

**Purpose:** Comprehensive input component with file upload and voice recording.

**Props:**

```tsx
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}
```

**Features:**

- Text input with auto-resizing
- File uploads with preview and loading states
- Voice recording and transcription using Groq
- Real-time file processing
- Responsive design

**Key Functionality:**

- Immediate file upload feedback with loading spinners
- Support for multiple file types (images, PDFs, documents)
- Voice recording with automatic transcription via Groq
- File preview with delete functionality
- File viewer dialog for viewing uploaded content
- Disabled states during processing

**Usage:**

```tsx
<ChatInput
  input={input}
  setInput={setInput}
  isLoading={isLoading}
  onSubmit={handleSubmit}
  onKeyDown={handleKeyDown}
/>
```

---

### 4. Message

**File:** `src/components/message.tsx`

**Purpose:** Displays individual chat messages with rich formatting.

**Props:**

```tsx
interface MessageProps {
  message: Message;
  isLoading?: boolean;
  onToggleSideBar?: () => void;
  sidebarOpen?: boolean;
}
```

**Features:**

- Markdown rendering with syntax highlighting
- Code block editing capabilities
- File attachment display
- Message actions (copy, edit, etc.)
- Loading states for streaming responses
- Responsive design

**Key Functionality:**

- React Markdown with custom components
- Code syntax highlighting
- File preview and download
- Message copying and editing
- Typing indicators
- Error handling

**Usage:**

```tsx
<Message
  message={message}
  isLoading={isLoading}
  onToggleSideBar={toggleSidebar}
  sidebarOpen={sidebarOpen}
/>
```

---

### 5. Sidebar

**File:** `src/components/sidebar.tsx`

**Purpose:** Chat history sidebar with search and management features.

**Props:**

```tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**

- Chat history display
- Search functionality
- Chat management (create, delete, rename)
- User authentication
- Responsive design

**Key Functionality:**

- Chat list with titles and timestamps
- Real-time search through chat history
- Chat creation and deletion
- User profile management
- Mobile-responsive design

**Usage:**

```tsx
<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
```

---

### 6. CodeEditor

**File:** `src/components/code-editor.tsx`

**Purpose:** Monaco editor for code editing and analysis using Groq.

**Props:**

```tsx
interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language: string;
  onSidebarToggle?: () => void;
  onSave: (code: string) => void;
}
```

**Features:**

- Monaco editor integration
- Syntax highlighting for 40+ languages
- Code analysis and feedback using Groq
- Save and copy functionality
- Responsive design

**Key Functionality:**

- Professional code editing experience
- Language-specific syntax highlighting
- Code formatting and validation
- Integration with Groq AI code analysis
- Keyboard shortcuts and accessibility

**Usage:**

```tsx
<CodeEditor
  isOpen={isEditorOpen}
  onClose={closeEditor}
  initialCode={code}
  language="javascript"
  onSave={handleSaveCode}
/>
```

---

### 7. VoiceRecorder

**File:** `src/components/voice-recorder.tsx`

**Purpose:** Audio recording component with waveform visualization and Groq transcription.

**Props:**

```tsx
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
}
```

**Features:**

- Audio recording with WebRTC
- Real-time waveform visualization
- Recording controls (start, stop, cancel)
- Audio format handling
- Error handling
- Groq transcription integration

**Key Functionality:**

- Browser-based audio recording
- Waveform visualization using Web Audio API
- Automatic transcription via Groq
- Recording state management
- Mobile device support

**Usage:**

```tsx
<VoiceRecorder
  onRecordingComplete={handleRecordingComplete}
  onCancel={handleCancel}
/>
```

---

### 8. FileViewerDialog

**File:** `src/components/file-viewer-dialog.tsx`

**Purpose:** Modal dialog for viewing uploaded files.

**Props:**

```tsx
interface FileViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: { url: string; mimeType: string } | null;
}
```

**Features:**

- Image preview with zoom
- Document viewer for PDFs
- Text file display
- Download functionality
- Responsive design

**Key Functionality:**

- Multiple file type support
- Image zoom and pan
- PDF document viewing
- Text file syntax highlighting
- Download and sharing options

**Usage:**

```tsx
<FileViewerDialog
  isOpen={isFileViewerOpen}
  onClose={closeFileViewer}
  file={selectedFile}
/>
```

---

### 9. SearchDialog

**File:** `src/components/search-dialog.tsx`

**Purpose:** Search functionality for chat history.

**Props:**

```tsx
interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**

- Real-time search through messages
- Search result highlighting
- Navigation between results
- Keyboard shortcuts
- Responsive design

**Key Functionality:**

- Full-text search across all chats
- Search result previews
- Jump to message functionality
- Search filters and options
- Performance optimization

**Usage:**

```tsx
<SearchDialog isOpen={isSearchOpen} onClose={closeSearch} />
```

---

## UI Components

### Base UI Components

Located in `src/components/ui/`, these are reusable base components built with Radix UI and Tailwind CSS:

#### Button

```tsx
<Button variant="default" size="sm">
  Click me
</Button>
```

#### Input

```tsx
<Input type="text" placeholder="Enter text..." className="w-full" />
```

#### Textarea

```tsx
<Textarea placeholder="Enter message..." className="resize-none" />
```

#### Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content here
  </DialogContent>
</Dialog>
```

#### ScrollArea

```tsx
<ScrollArea className="h-96">
  <div>Scrollable content</div>
</ScrollArea>
```

#### DropdownMenu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Option 1</DropdownMenuItem>
    <DropdownMenuItem>Option 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Component Patterns

### 1. Props Interface Pattern

All components use TypeScript interfaces for props:

```tsx
interface ComponentProps {
  // Required props
  requiredProp: string;

  // Optional props with defaults
  optionalProp?: number;

  // Function props
  onAction: (data: any) => void;

  // Boolean flags
  isEnabled?: boolean;
}
```

### 2. State Management Pattern

Components follow consistent state management patterns:

```tsx
function Component({ prop1, prop2 }: ComponentProps) {
  // Local state
  const [localState, setLocalState] = useState(initialValue);

  // Context state
  const { globalState, setGlobalState } = useChat();

  // Refs
  const elementRef = useRef<HTMLElement>(null);

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // Event handlers
  const handleAction = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  return <div>JSX</div>;
}
```

### 3. Error Boundary Pattern

Components implement error boundaries for graceful error handling:

```tsx
function ComponentWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Component />
    </ErrorBoundary>
  );
}
```

### 4. Loading State Pattern

Components show appropriate loading states:

```tsx
function Component({ isLoading }: Props) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <MainContent />;
}
```

---

## Styling Patterns

### 1. Tailwind CSS Classes

Components use Tailwind CSS for styling with consistent patterns:

```tsx
// Layout classes
className = "flex items-center justify-between";

// Spacing classes
className = "p-4 m-2 space-y-4";

// Color classes
className = "bg-gray-800 text-white hover:bg-gray-700";

// Responsive classes
className = "w-full md:w-1/2 lg:w-1/3";

// Dark mode classes
className = "bg-white dark:bg-gray-900";
```

### 2. Conditional Styling

```tsx
className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)}
```

### 3. Custom CSS Variables

```tsx
style={{
  backgroundColor: "rgb(49,48,49)",
  borderColor: "rgb(96,96,64)"
}}
```

---

## Performance Optimization

### 1. React.memo

Components are wrapped with React.memo for performance:

```tsx
export const Component = React.memo(function Component({ prop }: Props) {
  return <div>Content</div>;
});
```

### 2. useCallback and useMemo

Expensive operations are memoized:

```tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(prop);
}, [prop]);

const handleAction = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 3. Lazy Loading

Large components are lazy loaded:

```tsx
const CodeEditor = lazy(() => import("./code-editor"));
```

---

## Accessibility

### 1. ARIA Labels

Components include proper ARIA labels:

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>
```

### 2. Keyboard Navigation

Components support keyboard navigation:

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleAction();
  }
};
```

### 3. Focus Management

Components manage focus properly:

```tsx
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

---

## Testing

### 1. Component Testing

Components can be tested with React Testing Library:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";

test("renders component", () => {
  render(<Component prop="value" />);
  expect(screen.getByText("Content")).toBeInTheDocument();
});
```

### 2. Integration Testing

Test component interactions:

```tsx
test("handles user interaction", () => {
  const mockHandler = jest.fn();
  render(<Component onAction={mockHandler} />);

  fireEvent.click(screen.getByRole("button"));
  expect(mockHandler).toHaveBeenCalled();
});
```

---

## Best Practices

### 1. Component Organization

- Keep components focused and single-purpose
- Use descriptive component names
- Group related components together
- Separate UI and logic components

### 2. Props Design

- Use TypeScript interfaces for all props
- Provide sensible defaults for optional props
- Keep props minimal and focused
- Use composition over configuration

### 3. State Management

- Use local state for component-specific data
- Use context for global state
- Avoid prop drilling
- Keep state as close to usage as possible

### 4. Error Handling

- Implement error boundaries
- Provide fallback UI
- Log errors appropriately
- Handle edge cases gracefully

### 5. Performance

- Use React.memo for expensive components
- Memoize callbacks and values
- Lazy load large components
- Optimize re-renders

---

## Future Enhancements

Planned component improvements:

- **Virtual scrolling** for large message lists
- **Drag and drop** file upload
- **Real-time collaboration** features
- **Advanced code editing** capabilities
- **Accessibility improvements**
- **Mobile-specific optimizations**
