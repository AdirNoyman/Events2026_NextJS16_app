import connectToDatabase from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/database/event.model';

const ALLOWED_FIELDS = [
  'title',
  'description',
  'overview',
  'image',
  'venue',
  'location',
  'date',
  'time',
  'mode',
  'audience',
  'agenda',
  'organizer',
  'tags',
] as const;

function parseArrayField(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    const eventData: Record<string, string | string[]> = {};

    for (const field of ALLOWED_FIELDS) {
      const value = formData.get(field);
      if (value === null) continue;

      if (field === 'agenda' || field === 'tags') {
        eventData[field] = parseArrayField(value);
      } else if (typeof value === 'string') {
        eventData[field] = value.trim();
      }
    }

    if (!eventData.title || !eventData.description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    const createdEvent = await Event.create(eventData);
    return NextResponse.json(
      {
        message: 'Event created successfully! 🎉',
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log('Error creating event:', err);
    return NextResponse.json(
      {
        message: 'Event creation failed 😣',
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error when trying to create event 🤷‍♂️',
      },
      { status: 500 }
    );
  }
}
