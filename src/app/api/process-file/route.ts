
import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import PDFParser from 'pdf2json';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
}); 

export async function POST(req: Request) {
  try {
    const { url, mimeType }: { url: string; mimeType: string } = await req.json();
    console.log("url", url);

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

    // ✅ PDF Handling using pdf2json
    if (mimeType === 'application/pdf') {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
      
        const buffer = await response.arrayBuffer();
        const tempFilePath = path.join(os.tmpdir(), `pdf-${Date.now()}.pdf`);
        await fs.writeFile(tempFilePath, Buffer.from(buffer));
      
        const pdfParser = new PDFParser();
      
        const extractedText: string = await new Promise((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", err => {
            reject(err.parserError);
          });
      
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
              const pages = pdfData?.Pages;
              if (!pages || !Array.isArray(pages)) {
                return reject(new Error('Invalid PDF structure: no pages found'));
              }
      
              let result = '';
              for (const page of pages) {
                for (const textItem of page.Texts) {
                  for (const r of textItem.R) {
                    result += decodeURIComponent(r.T) + ' ';
                  }
                }
                result += '\n';
              }
      
              resolve(result.trim());
            } catch (err) {
              reject(err);
            }
          });
      
          pdfParser.loadPDF(tempFilePath);
        });
      
        return NextResponse.json({ type: 'pdf', content: extractedText.slice(0, 3000) });
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
