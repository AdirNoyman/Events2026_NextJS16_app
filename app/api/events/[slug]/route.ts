import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/database/event.model';

// Type for route params in Next.js 15+ dynamic routes
type RouteParams = Promise<{ slug: string }>;

// Slug validation: allows lowercase letters, numbers, and hyphens
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    // Validate slug is present
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const trimmedSlug = slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(trimmedSlug)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.',
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug. lean returns plain JS object and DB document, for better performance
    const event = await Event.findOne({ slug: trimmedSlug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { success: false, message: `Event with slug "${trimmedSlug}" not found` },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { success: true, event },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event by slug:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
