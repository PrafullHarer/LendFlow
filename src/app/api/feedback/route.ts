import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getAuthUserId } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getAuthUserId();
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const feedback = await Feedback.create({
      userId: userId || undefined,
      name: body.name,
      email: body.email,
      message: body.message,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error('Failed to submit feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
