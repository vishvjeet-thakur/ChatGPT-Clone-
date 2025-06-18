import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Chat } from '@/models/chat';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, messages } = await req.json();
    await connectDB();

    const chat = new Chat({
      id,
      userId,
      title,
      messages
    });

    await chat.save();
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, title, messages } = await req.json();
    await connectDB();

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { title, messages },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await req.json();
    await connectDB();

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
} 