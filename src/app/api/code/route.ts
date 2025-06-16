import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json()

    const prompt = `Analyze this ${language} code and provide:
    1. Give the exact Output that will be displayed on terminal if it is ran, or type of error with reason.
    1. A brief explanation of what the code does
    2. Any potential improvements or corrections
    3. Best practices that could be applied
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    Format your response in markdown with clear sections.`


    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages:[
        {
        role: 'user',
        content: prompt,
        }
     ,
     { role:"system",
      content:
        "You are a code review assistant. Provide clear, concise explanations and suggestions in markdown format.",
     }
      ],
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
