import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { messages, memory, temperature } = await request.json()
    console.log("Messages:", messages)
    console.log("Memory:",memory)

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system:
        `You are ChatGPT, a helpful AI assistant created by OpenAI. Respond naturally and helpfully to user queries.
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
