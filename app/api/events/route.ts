import connectToDatabase from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    let newEvent;

    try {
      newEvent = Object.fromEntries(formData.entries());
    } catch (error) {
      console.log('Error creating event', error);
      return NextResponse.json(
        { message: 'Invalid JSON data format 😩' },
        { status: 400 }
      );
    }
    console.log('New Event:', newEvent);
    const createdEvent = await Event.create(newEvent);
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
