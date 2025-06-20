import { NextRequest, NextResponse } from 'next/server';
import MemoryClient from 'mem0ai';

async function retryAsync<T>(fn: () => Promise<T>, maxRetries = 3, delay = 300): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! });
  
  // If 'query' is present, do a search. If 'interaction' is present, do an add.
  if (body.query && body.userId) {
    try {
      const result = await retryAsync(() => client.search(body.query, { user_id: body.userId }), 3, 300);
      return NextResponse.json(result);
    } catch (error: unknown) {
      const err = error as Error;
      return NextResponse.json({ error: err.message || 'Memory service unavailable after retries.' }, { status: 500 });
    }
  } else if (body.interaction && body.userId) {
    try {
      const result = await retryAsync(() => client.add(body.interaction, { user_id: body.userId }), 3, 300);
      return NextResponse.json(result);
    } catch (error: unknown) {
      const err = error as Error;
      return NextResponse.json({ error: err.message || 'Memory service unavailable after retries.' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}