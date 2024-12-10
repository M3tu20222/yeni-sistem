import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Admin } from '@/models/Admin';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  await dbConnect();

  const { username, password } = await req.json();

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 404 });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

