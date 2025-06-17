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
        "Generate a concise, descriptive title (maximum 5 words) for a chat based on the first message. If the message includes uploaded files or images described within tags like <uploaded_content>...</uploaded_content>, use those descriptions too to infer the main topic. If there is no meaningful user message but only uploaded content, summarize what the uploads are about and generate a relevant title. Return only the plain text title without quotes or special characters. Sometimes uploaded content are the main topics so generate title accordingly. ",
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
