import HomePageContent from '@/components/HomePageContent';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const HomePageServer = async () => {
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();

  return <HomePageContent events={events} />;
};

export default HomePageServer;
