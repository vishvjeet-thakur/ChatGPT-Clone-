import { getDocument } from 'pdfjs-dist';
import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { url, mimeType }: { url: string; mimeType: string } = await req.json();
    console.log("url",url)

    if (mimeType.startsWith('image/')) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "Describe this image in detail, focusing on key objects, actions, and the overall scene. Be concise and precise. Do not include any introductory or concluding phrases, just the description."
              },
              { type: 'image_url', image_url: { url } }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.5,
        max_completion_tokens: 500,
      });

      const description = chatCompletion.choices[0].message.content;
      return NextResponse.json({ type: 'image', content: description });
    }

    // ✅ PDF Handling using pdfjs-dist
    if (mimeType === 'application/pdf') {
      const response = await fetch(url);
      console.log(response)
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return NextResponse.json({ type: 'pdf', content: fullText.trim().slice(0, 3000) });
    }

    // ✅ Plain text files
    if (mimeType.startsWith('text/')) {
      const response = await fetch(url);
      const text = await response.text();
      return NextResponse.json({ type: 'text', content: text.slice(0, 3000) });
    }

    // ❌ Other binary files
    return NextResponse.json({
      type: 'file',
      content: `This file type (${mimeType}) is not supported for preview, but has been uploaded.`,
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
