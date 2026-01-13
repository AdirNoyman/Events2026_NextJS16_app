'use client';

import { useRef, useCallback } from 'react';
import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { events } from "@/lib/constants"
import posthog from 'posthog-js';

const HomePage = () => {
  const hasTrackedHomepage = useRef(false);
  const hasTrackedFeaturedSection = useRef(false);
  const featuredSectionObserver = useRef<IntersectionObserver | null>(null);

  // Track homepage view when the main section mounts
  const handleSectionRef = useCallback((node: HTMLElement | null) => {
    if (node && !hasTrackedHomepage.current) {
      hasTrackedHomepage.current = true;
      posthog.capture('homepage_viewed', {
        page_title: 'DevEvent Homepage',
        total_featured_events: events.length,
      });
    }
  }, []);

  // Track featured events section view when it becomes visible
  const handleFeaturedSectionRef = useCallback((node: HTMLDivElement | null) => {
    if (featuredSectionObserver.current) {
      featuredSectionObserver.current.disconnect();
    }

    if (node && !hasTrackedFeaturedSection.current) {
      featuredSectionObserver.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !hasTrackedFeaturedSection.current) {
            hasTrackedFeaturedSection.current = true;
            posthog.capture('featured_events_section_viewed', {
              total_events_displayed: events.length,
              event_titles: events.map(e => e.title),
            });
            featuredSectionObserver.current?.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      featuredSectionObserver.current.observe(node);
    }
  }, []);

  return (
    <section ref={handleSectionRef}>
      {' '}
      <h1 className='text-center'>
        The Hub for Adirs events 2026 <br />
        You don&apos;t want to miss{' '}
      </h1>
      <p className='text-center mt-5'>
        Stay tuned for exciting updates and announcements!
      </p>
      <ExploreBtn />
      <div className='mt-20 space-y-7' ref={handleFeaturedSectionRef}>
        <h3>Featured Events</h3>
        <ul className='events list-none'>
          {events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomePage;
