import { NextResponse } from 'next/server';
import { calculateRisk } from '@/lib/risk-assessment';

export async function POST(request: Request) {
  try {
    const { contractAddress, blockchain } = await request.json();

    if (!contractAddress || !blockchain) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress and blockchain' },
        { status: 400 }
      );
    }

    // Basic validation
    if (typeof contractAddress !== 'string' || typeof blockchain !== 'string') {
        return NextResponse.json(
            { error: 'Invalid parameter types' },
            { status: 400 }
        );
    }

    // TODO: Add a mapping from UI-friendly blockchain names to the IDs used by the APIs
    // For now, assume the frontend sends the correct ID (e.g., 'ethereum')
    const riskReport = await calculateRisk({ contractAddress, blockchain });

    return NextResponse.json(riskReport);

  } catch (error) {
    console.error('Error in risk assessment API route:', error);

    // Return a generic error message to the client
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
