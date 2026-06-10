import { NextResponse } from 'next/server';
import { getTwilioConfigStatus } from '@/lib/twilio';

export async function GET() {
  const status = getTwilioConfigStatus();

  return NextResponse.json({
    success: true,
    twilio: {
      ...status,
      recipients: ['+393663153304'],
    },
  });
}
