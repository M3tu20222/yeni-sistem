import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password, role } = await req.json();

    // E-posta ve kullanıcı adı kontrolü
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Bu e-posta adresi veya kullanıcı adı zaten kullanımda' }, { status: 400 });
    }

    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni admin oluşturma
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: role || 'manager', // Varsayılan rol
    });

    await newAdmin.save();

    return NextResponse.json({ message: 'Admin kaydı başarılı' }, { status: 201 });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json({ error: 'Kayıt işlemi sırasında bir hata oluştu' }, { status: 500 });
  }
}

