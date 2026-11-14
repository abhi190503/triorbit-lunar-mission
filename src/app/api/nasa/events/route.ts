import { NextResponse } from 'next/server';
import { fetchNASAEvents } from '@/lib/nasa/donki';

/**
 * GET /api/nasa/events
 *
 * Server-side Route Handler for NASA DONKI space weather observations.
 * Conforms strictly to docs/INTERFACES.md §4:
 * - Reads NASA_API_KEY securely from server-only environment
 * - Applies bounded request execution with AbortController timeout
 * - Normalizes authentic observations into canonical NASAEvent schema
 * - Provides verified-fallback provenance when upstream is offline/rate-limited
 * - Returns mandatory scientific disclaimer regarding lunar surface radiation
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const response = await fetchNASAEvents({
      apiKey: process.env.NASA_API_KEY,
      startDate,
      endDate,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    // Ultimate defensive catch to ensure the client never crashes
    const fallbackResponse = await fetchNASAEvents({
      timeoutMs: 0, // Force instant fallback
    });

    return NextResponse.json(fallbackResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }
}
