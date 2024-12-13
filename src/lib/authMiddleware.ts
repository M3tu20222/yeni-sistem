import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

interface RequestWithUser extends NextRequest {
  user?: DecodedToken;
}

export function authMiddleware(handler: (req: RequestWithUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: '🚫 Yetkisiz erişim: Token bulunamadı' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      // Kullanıcı bilgilerini request nesnesine ekle
      (req as RequestWithUser).user = decoded;

      // Orijinal handler'ı çağır
      return handler(req as RequestWithUser);
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return new NextResponse(
        JSON.stringify({ error: '🔒 Geçersiz veya süresi dolmuş token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// Süper admin kontrolü için yardımcı fonksiyon
export function isSuperAdmin(handler: (req: RequestWithUser) => Promise<NextResponse>) {
  return authMiddleware(async (req: RequestWithUser) => {
    const user = req.user;
    
    if (user?.role !== 'super') {
      return new NextResponse(
        JSON.stringify({ error: '⚡ Yetersiz yetki: Sadece süper adminler erişebilir' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return handler(req);
  });
}

