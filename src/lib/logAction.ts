import dbConnect from './db';
import { Log } from '@/models/Log';

export async function logAction(action: string, details: string) {
  try {
    await dbConnect();
    await Log.create({ action, details });
  } catch (error) {
    // Fail silently so we don't break main operations if logging fails
    console.error('Failed to write to system log:', error);
  }
}
