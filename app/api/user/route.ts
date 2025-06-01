import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/utils/db/actions';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  const user = await getUserByEmail(email);
  return NextResponse.json(user);
}