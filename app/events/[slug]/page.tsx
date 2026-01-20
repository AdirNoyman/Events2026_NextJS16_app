import Image from 'next/image';
import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetails = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className='flex flex-row gap-2 items-center'>
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map((tag, index) => (
      <div className='pill' key={index}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  // Get the page slug
  const { slug } = await params;
  // Get page data from api route
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);

  const {
    event: {
      title,
      description,
      date,
      time,
      location,
      image,
      overview,
      mode,
      agenda,
      organizer,
      audience,
      tags,
    },
  } = await request.json();

  if (!title) return notFound();

  return (
    <section id='event'>
      <div className='header'>
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className='details'>
        {/* left side - event content */}
        <div className='content'>
          <Image
            src={image}
            alt='Event banner'
            width={800}
            height={800}
            className='banner'
          />
          <section className='flex flex-col gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          <section className='flex flex-col gap-2'>
            <h2>Event Details</h2>
            <EventDetails
              icon='/icons/calendar.svg'
              alt='calendar'
              label={date}
            />
            <EventDetails icon='/icons/clock.svg' alt='clock' label={time} />
            <EventDetails
              icon='/icons/pin.svg'
              alt='location'
              label={location}
            />
            <EventDetails icon='/icons/mode.svg' alt='mode' label={mode} />
            <EventDetails
              icon='/icons/audience.svg'
              alt='agenda'
              label={audience}
            />
          </section>
          <EventAgenda agendaItems={agenda} />
          <section className='flex flex-col gap-2'>
            <h2>About the organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />
        </div>
        {/* right side - booking form */}
        <aside className='booking'>
          <p className='text-lg font-semibold'>Book event</p>
        </aside>
      </div>
    </section>
  );
};

export default EventDetailsPage;
