import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { redis, redisKey } from '@/lib/redis';
import { UserProgress } from '@/types';
import MapClient from './map-client';

export default async function MapPage() {
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
