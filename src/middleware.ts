// import { NextResponse, NextRequest } from 'next/server'
// export { default } from "next-auth/middleware"
// import { getToken } from 'next-auth/jwt'
// // This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//     const token = await getToken({req: request})
//     const url = request.nextUrl
//     if(token && (
//         url.pathname.startsWith('/sign-in') ||
//         url.pathname.startsWith('/sign-up') ||
//         url.pathname.startsWith('/verify') ||
//         url.pathname.startsWith('/')
//     ))
//     return NextResponse.redirect(new URL('/dashboard', request.url))

//     if(!token && url.pathname.startsWith('/dashboard')){
//        return NextResponse.redirect(new URL('/sign-in', request.url));
//      }
//     return NextResponse.next()
// }
 
// export const config = {
//   matcher: [
//     '/sign-in',
//     '/sign-up',
//     '/',
//     '/dashboard/:path*',
//     '/verify/:path*'
// ],
// }

import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Avoid redirect loop by not redirecting from protected routes
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl
  const { pathname } = url

  const isAuth = !!token
  const isPublicPath = ["/", "/sign-in", "/sign-up", "/verify"].includes(pathname)

  if (isAuth && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuth && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/verify/:path*',
    '/dashboard/:path*',
  ],
}
