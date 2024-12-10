// middleware.ts  
import { NextResponse } from 'next/server'  
import type { NextRequest } from 'next/server'  
import { getToken } from 'next-auth/jwt'  

export async function middleware(request: NextRequest) {  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })  

  console.log("Middleware çalışıyor, URL:", request.url);  
  console.log("Token:", JSON.stringify(token, null, 2));  

  if (!token) {  
    return NextResponse.redirect(new URL('/login', request.url))  
  }  

  // Rol tabanlı yetkilendirme  
  const path = request.nextUrl.pathname  

  if (path === '/dashboard') {  
    switch (token.role) {  
      case 'admin':  
      case 'manager':  
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))  
      case 'teacher':  
        return NextResponse.redirect(new URL('/teacher/dashboard', request.url))  
      case 'student':  
        return NextResponse.redirect(new URL('/student/dashboard', request.url))  
      default:  
        console.log("Bilinmeyen rol:", token.role);  
        return NextResponse.redirect(new URL('/unauthorized', request.url))  
    }  
  }  

  if (path.startsWith('/admin') && token.role !== 'admin' && token.role !== 'manager') {  
    console.log("Admin yetkisi yok, unauthorized sayfasına yönlendiriliyor");  
    return NextResponse.redirect(new URL('/unauthorized', request.url))  
  }  

  return NextResponse.next()  
}  

export const config = {  
  matcher: ['/dashboard', '/admin/:path*', '/teacher/:path*', '/student/:path*', '/students', '/teachers', '/classes', '/courses']  
}  