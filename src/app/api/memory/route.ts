import { NextRequest, NextResponse } from 'next/server';
import MemoryClient from 'mem0ai';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! });

  // If 'query' is present, do a search. If 'interaction' is present, do an add.
  if (body.query && body.userId) {
    try {
      const result = await client.search(body.query, { user_id: body.userId });
      return NextResponse.json(result);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (body.interaction && body.userId) {
    try {
      const result = await client.add(body.interaction, { user_id: body.userId });
      return NextResponse.json(result);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}