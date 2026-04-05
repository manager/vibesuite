import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const isDev = process.env.NODE_ENV === 'development';

export const middleware = isDev
  ? () => NextResponse.next()
  : auth;

export const config = {
  matcher: ['/map'],
};
