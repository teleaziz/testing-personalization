import { NextResponse, NextRequest } from 'next/server'
import {
  PersonalizedURL,
  getUserAttributes
} from '@builder.io/personalization-utils'

const regex = /^(.+\.)/

const shouldRewrite = (pathname: string) => {
  // only in netlify needed
  if (pathname.startsWith('/builder') || pathname.includes('_next/image') || pathname.startsWith('/preview')) {
    return false;
  }
  // do not rewrite api requests
  if (pathname.startsWith('/api') || pathname.startsWith('/product') || pathname.startsWith('/collection')) {
    return false;
  }
  // don't rewrite for asset requests (has a file extension)
  return !regex.test(pathname);
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl
  const usePath = url.pathname
  if (shouldRewrite(usePath)) {
    const query = Object.fromEntries(url.searchParams);
    const allCookies = Array.from(request.cookies.entries()).reduce((acc, [key]) => ({
      ...acc,
      [key]: request.cookies.get(key),
    }), {})
    const host = request.headers.get('Host') || '';
    const siteType = host.split('.')[1];
    const personlizedURL = new PersonalizedURL({
      pathname: usePath,
      // Buffer is not available in middleware environment as of next 12.2 , overriding with btoa
      encode: (url) => {
        return btoa(url);
      },
      attributes: {
        site: host,
        country: request.geo?.country || '',
        ...siteType && { siteType },
        ...getUserAttributes({ ...allCookies, ...query }),
      }
    })
    url.pathname = personlizedURL.rewritePath();
    return NextResponse.rewrite(url)  
  }
  return NextResponse.next();
}
