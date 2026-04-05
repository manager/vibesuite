import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { redis } from './redis';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(redis, { baseKeyPrefix: 'vsm:authjs:' }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    }),
  ],
  pages: {
    signIn: '/',
    verifyRequest: '/?verify=1',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session({ session }) {
      return session;
    },
  },
});
