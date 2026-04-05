import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redis, redisKey } from '@/lib/redis';
import { getSkillById } from '@/data/skills';
import { UserProgress } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const progress =
    (await redis.get<UserProgress>(redisKey(`user:${session.user.email}:progress`))) ?? {};

  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { skillId, completed } = (await req.json()) as {
    skillId: string;
    completed: boolean;
  };

  if (!getSkillById(skillId)) {
    return NextResponse.json({ error: 'Invalid skill ID' }, { status: 400 });
  }

  const key = redisKey(`user:${session.user.email}:progress`);
  const progress = (await redis.get<UserProgress>(key)) ?? {};

  if (completed) {
    progress[skillId] = { completed: true, completedAt: new Date().toISOString() };
  } else {
    delete progress[skillId];
  }

  await redis.set(key, progress);

  // Ensure profile exists
  const profileKey = redisKey(`user:${session.user.email}:profile`);
  const profile = await redis.get(profileKey);
  if (!profile) {
    await redis.set(profileKey, {
      name: session.user.name ?? session.user.email,
      joinedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ progress });
}
