import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redis, redisKey } from '@/lib/redis';
import { getSkillById } from '@/data/skills';
import { UserProgress } from '@/types';

const isDev = process.env.NODE_ENV === 'development';

// In-memory progress for dev mode (no Redis needed)
let devProgress: UserProgress = {};

export async function GET() {
  if (isDev) {
    return NextResponse.json({ progress: devProgress });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const progress =
    (await redis.get<UserProgress>(redisKey(`user:${session.user.email}:progress`))) ?? {};

  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const { skillId, completed } = (await req.json()) as {
    skillId: string;
    completed: boolean;
  };

  if (!getSkillById(skillId)) {
    return NextResponse.json({ error: 'Invalid skill ID' }, { status: 400 });
  }

  if (isDev) {
    if (completed) {
      devProgress[skillId] = { completed: true, completedAt: new Date().toISOString() };
    } else {
      delete devProgress[skillId];
    }
    return NextResponse.json({ progress: devProgress });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
