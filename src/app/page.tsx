import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LandingClient from '@/components/LandingClient';

const isDev = process.env.NODE_ENV === 'development';

export default async function LandingPage() {
  // In dev mode, skip auth check — just show landing page
  if (!isDev) {
    const session = await auth();
    if (session?.user) {
      redirect('/map');
    }
  }

  return <LandingClient />;
}
