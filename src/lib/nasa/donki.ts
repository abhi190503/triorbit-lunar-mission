import fallbackData from '../../data/nasa/verified-events.json';

/**
 * NASA Space Weather observation record (from NASA DONKI Open API).
 * Historical metadata, not a direct measurement of lunar surface dose.
 * Aligns strictly with docs/INTERFACES.md.
 */
export interface NASAEvent {
  id: string;
  type: 'FLR' | 'SEP';
  occurredAt: string;
  title: string;
  sourceUrl: string;
  classType?: string;
  source: 'NASA DONKI';
}

/**
 * Shared API route response contract for GET /api/nasa/events.
 * Conforms to docs/INTERFACES.md §4.
 */
export interface NASAEventsResponse {
  events: NASAEvent[];
  provenance: 'live' | 'verified-fallback';
  retrievedAt: string;
  caution: string;
}

export const NASA_SCIENTIFIC_CAUTION =
  'NASA DONKI records interplanetary space weather observations; they do not represent biological radiation absorption on the lunar surface.';

const DEFAULT_TIMEOUT_MS = 4000;
const DONKI_BASE_URL = 'https://api.nasa.gov/DONKI';

// Default historical window corresponding to the verified May 2024 solar storm sequence
const DEFAULT_START_DATE = '2024-05-11';
const DEFAULT_END_DATE = '2024-05-12';

/**
 * Raw DONKI SEP response item structure (from NASA GSFC / CCMC).
 */
interface RawDonkiSEPItem {
  sepID?: unknown;
  eventTime?: unknown;
  instruments?: Array<{ displayName?: unknown }>;
  link?: unknown;
}

/**
 * Raw DONKI FLR response item structure (from NASA GSFC / CCMC).
 */
interface RawDonkiFLRItem {
  flrID?: unknown;
  beginTime?: unknown;
  peakTime?: unknown;
  classType?: unknown;
  link?: unknown;
}

/**
 * Validates whether an unknown value is a valid ISO-8601 or parseable date string.
 */
function isValidDateString(val: unknown): val is string {
  if (typeof val !== 'string' || val.trim().length === 0) return false;
  const parsed = Date.parse(val);
  return !Number.isNaN(parsed);
}

/**
 * Validates whether an unknown value is a valid HTTPS URL string.
 */
function isValidHttpsUrl(val: unknown): val is string {
  if (typeof val !== 'string' || val.trim().length === 0) return false;
  try {
    const url = new URL(val);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes and validates a raw DONKI SEP item into a canonical NASAEvent.
 */
export function normalizeSEPEvent(item: unknown): NASAEvent | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as RawDonkiSEPItem;

  if (typeof raw.sepID !== 'string' || raw.sepID.trim().length === 0) return null;
  if (!isValidDateString(raw.eventTime)) return null;
  if (!isValidHttpsUrl(raw.link)) return null;

  const id = raw.sepID.trim();
  const occurredAt = new Date(raw.eventTime).toISOString();
  const sourceUrl = raw.link.trim();

  // Extract instrument display name if available
  let instrumentName = '';
  if (Array.isArray(raw.instruments) && raw.instruments.length > 0) {
    const first = raw.instruments[0];
    if (first && typeof first.displayName === 'string' && first.displayName.trim().length > 0) {
      instrumentName = first.displayName.trim();
    }
  }

  const title = instrumentName
    ? `${instrumentName} Solar Energetic Particle Event`
    : 'Solar Energetic Particle (SEP) Event';

  return {
    id,
    type: 'SEP',
    occurredAt,
    title,
    sourceUrl,
    source: 'NASA DONKI',
  };
}

/**
 * Normalizes and validates a raw DONKI FLR item into a canonical NASAEvent.
 */
export function normalizeFLREvent(item: unknown): NASAEvent | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as RawDonkiFLRItem;

  if (typeof raw.flrID !== 'string' || raw.flrID.trim().length === 0) return null;
  if (!isValidDateString(raw.beginTime)) return null;
  if (!isValidHttpsUrl(raw.link)) return null;

  const id = raw.flrID.trim();
  const occurredAt = new Date(raw.beginTime).toISOString();
  const sourceUrl = raw.link.trim();
  const classType =
    typeof raw.classType === 'string' && raw.classType.trim().length > 0
      ? raw.classType.trim()
      : undefined;

  const title = classType
    ? `Solar Flare Event (Class ${classType})`
    : 'Solar Flare (FLR) Event';

  const event: NASAEvent = {
    id,
    type: 'FLR',
    occurredAt,
    title,
    sourceUrl,
    source: 'NASA DONKI',
  };

  if (classType) {
    event.classType = classType;
  }

  return event;
}

/**
 * Safely loads and validates the bundled verified fallback events fixture.
 */
export function getVerifiedFallbackEvents(): NASAEvent[] {
  if (!Array.isArray(fallbackData)) {
    return [];
  }

  const validated: NASAEvent[] = [];
  for (const rawItem of fallbackData) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const item = rawItem as Record<string, unknown>;

    if (
      typeof item.id === 'string' &&
      (item.type === 'FLR' || item.type === 'SEP') &&
      typeof item.occurredAt === 'string' &&
      typeof item.title === 'string' &&
      typeof item.sourceUrl === 'string' &&
      item.source === 'NASA DONKI'
    ) {
      const event: NASAEvent = {
        id: item.id,
        type: item.type,
        occurredAt: item.occurredAt,
        title: item.title,
        sourceUrl: item.sourceUrl,
        source: 'NASA DONKI',
      };
      if (typeof item.classType === 'string' && item.classType.trim().length > 0) {
        event.classType = item.classType.trim();
      }
      validated.push(event);
    }
  }

  return validated;
}

export interface FetchNASAEventsOptions {
  apiKey?: string;
  startDate?: string;
  endDate?: string;
  timeoutMs?: number;
  endpoint?: 'SEP' | 'FLR';
}

/**
 * Fetches NASA DONKI space weather events from api.nasa.gov.
 * Gracefully and securely falls back to verified offline fixture on:
 * - Missing or invalid API key
 * - Network errors / DNS failures
 * - Bounded request timeouts
 * - Upstream 4xx / 5xx HTTP responses
 * - Malformed JSON or unparseable event payloads
 *
 * Never throws an unhandled rejection and never leaks secrets in responses.
 */
export async function fetchNASAEvents(
  options: FetchNASAEventsOptions = {}
): Promise<NASAEventsResponse> {
  const apiKey = (options.apiKey || process.env.NASA_API_KEY || 'DEMO_KEY').trim();
  const startDate = options.startDate || DEFAULT_START_DATE;
  const endDate = options.endDate || DEFAULT_END_DATE;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const endpoint = options.endpoint || 'SEP';

  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    api_key: apiKey,
  });

  const requestUrl = `${DONKI_BASE_URL}/${endpoint}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return {
        events: getVerifiedFallbackEvents(),
        provenance: 'verified-fallback',
        retrievedAt: new Date().toISOString(),
        caution: NASA_SCIENTIFIC_CAUTION,
      };
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return {
        events: getVerifiedFallbackEvents(),
        provenance: 'verified-fallback',
        retrievedAt: new Date().toISOString(),
        caution: NASA_SCIENTIFIC_CAUTION,
      };
    }

    const normalizedEvents: NASAEvent[] = [];
    for (const item of data) {
      const normalized =
        endpoint === 'SEP' ? normalizeSEPEvent(item) : normalizeFLREvent(item);
      if (normalized) {
        normalizedEvents.push(normalized);
      }
    }

    if (normalizedEvents.length === 0) {
      return {
        events: getVerifiedFallbackEvents(),
        provenance: 'verified-fallback',
        retrievedAt: new Date().toISOString(),
        caution: NASA_SCIENTIFIC_CAUTION,
      };
    }

    return {
      events: normalizedEvents,
      provenance: 'live',
      retrievedAt: new Date().toISOString(),
      caution: NASA_SCIENTIFIC_CAUTION,
    };
  } catch {
    clearTimeout(timer);
    return {
      events: getVerifiedFallbackEvents(),
      provenance: 'verified-fallback',
      retrievedAt: new Date().toISOString(),
      caution: NASA_SCIENTIFIC_CAUTION,
    };
  }
}
