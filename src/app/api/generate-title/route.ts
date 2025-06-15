import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system:
        "Generate a concise, descriptive title (max 5 words) for a chat based on the first message. The title should capture the main topic or intent of the conversation. Do not include any quotes or special characters in the title. Return only the plain text title.",
      temperature: 0.7,
      maxTokens: 1000,
    })
    
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Title generation  error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
