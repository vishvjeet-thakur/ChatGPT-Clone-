import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Create a FormData object for the Groq API request
    const groqFormData = new FormData();
    const fileBlob = new Blob([audioBuffer], { type: audioFile.type });
    groqFormData.append('file', fileBlob, 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('response_format', 'text');
    groqFormData.append('language', 'en'); // Specify English language for better accuracy
    groqFormData.append('temperature', '0'); // Use deterministic output

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to transcribe audio');
    }

    const text = await response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe audio" },
      { status: 500 }
    );
  }
} 