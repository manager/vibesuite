import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { redis, redisKey } from '@/lib/redis';
import { UserProgress } from '@/types';
import MapClient from './map-client';

const isDev = process.env.NODE_ENV === 'development';

export default async function MapPage() {
  // In dev mode, skip auth and use mock user
  if (isDev) {
    return (
      <MapClient
        initialProgress={{}}
        userEmail="dev@localhost"
      />
    );
  }

  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  const progress =
    (await redis.get<UserProgress>(redisKey(`user:${session.user.email}:progress`))) ?? {};

  return (
    <MapClient
      initialProgress={progress}
      userEmail={session.user.email}
    />
  );
}
