// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/favicon.ico') {
    const url = req.nextUrl.clone();
    url.pathname = '/favicon-32.png'; // можно 16/32
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/favicon.ico'] };
