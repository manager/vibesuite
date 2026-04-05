import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LandingClient from '@/components/LandingClient';

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/map');
  }

  return <LandingClient />;
}
