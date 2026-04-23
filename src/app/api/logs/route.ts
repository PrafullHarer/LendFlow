import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Log } from '@/models/Log';
import { getAuthUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch top 100 most recent logs for this user only
    const logs = await Log.find({ userId }).sort({ timestamp: -1 }).limit(100).lean();
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
