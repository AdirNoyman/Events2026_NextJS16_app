import connectToDatabase from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/database/event.model';
import { v2 as cloudinary } from 'cloudinary';

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
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string')
      : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Connect to DB
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

    // Get the uploaded image file if present
    const imageFile = formData.get('image') as File | null;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { message: 'Image file is required 🤨' },
        { status: 400 }
      );
    }

    // Upload the image to Cloudinary
    const imageBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    const uploadImageToCloudinary = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'events',
          },
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
        .end(buffer);
    });

    // Assign the cloudinary image url to the property of the new event
    eventData.image = (
      uploadImageToCloudinary as { secure_url: string }
    ).secure_url;

    // Create the event in the database
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

export async function GET(req: NextRequest) {
  try {
    // Connect to DB
    await connectToDatabase();

    // Fetch events from the database and sort by creation date desc
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: 'Events fetched successfully! 🎉',
        events,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log('Error fetching events:', err);
    return NextResponse.json(
      {
        message: 'Event fetching failed 😣',
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error when trying to fetch events 🤷‍♂️',
      },
      { status: 500 }
    );
  }
}
