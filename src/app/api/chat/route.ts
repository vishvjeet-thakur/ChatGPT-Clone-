import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { messages, memory, temperature } = await request.json()
    type Message = { role: string; content: string }
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      system:
        `You are ChatGPT, a helpful and intelligent AI assistant developed by OpenAI. Your responses should be natural, helpful, and contextually aware based on the user's queries and memory data provided.
Always respond in a **structured format** using clear **headings**, **subheadings**, **bullet points**, and **numbered lists** where appropriate. Use **horizontal rules** (---) to visually separate sections and enhance readability.
Handle user inputs as follows:
- Treat anything enclosed in <uploaded_content>{content}</uploaded_content> as uploaded content.
- If the uploaded content is empty, politely ask the user to upload it again **without referencing the tag directly**.
Always maintain a professional, warm, and conversational tone. Keep explanations concise yet comprehensive.
Use the provided memory and context  to personalize responses when relevant.
Never mention or explain internal syntax, formatting, or tags to the user.
Follow these principles consistently across all responses.

         Here is relevant memory/context for this user: ${memory} `,
      temperature: temperature? temperature: 0.7,
      maxTokens: 1000,
    })
    
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
