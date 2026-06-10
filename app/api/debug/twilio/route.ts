import { NextResponse } from 'next/server';
import { getTwilioConfigStatus, sendOrderNotification } from '@/lib/twilio';

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

export async function POST() {
  const status = getTwilioConfigStatus();
  if (!status.configured) {
    return NextResponse.json(
      { success: false, message: 'Twilio non configurato', missing: status.missing },
      { status: 500 }
    );
  }

  const testOrder = {
    _id: { toString: () => 'test-debug-order' },
    location: 'camera',
    customerName: 'Test Debug',
    locationDetail: 'Test',
    items: [{ productId: 'test', name: 'Cocktail Test', price: 10, quantity: 1 }],
    total: 10,
    pickup_time: null,
  };

  const result = await sendOrderNotification(testOrder);

  return NextResponse.json({
    success: result.success,
    result,
  }, { status: result.success ? 200 : 500 });
}
