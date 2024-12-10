import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Admin } from '@/models/Admin';
import { authMiddleware } from '@/lib/authMiddleware';

// Yeni admin oluşturma
export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password, role } = await req.json();
    const admin = new Admin({ username, email, password, role });
    await admin.save();
    return NextResponse.json({ message: 'Admin başarıyla oluşturuldu', admin });
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json({ error: 'Admin oluşturulamadı' }, { status: 500 });
  }
}

// Tüm adminleri listeleme
export async function GET(req: Request) {
  await dbConnect();

  try {
    const admins = await Admin.find({}, '-password');
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Admin listeleme hatası:', error);
    return NextResponse.json({ error: 'Adminler listelenemedi' }, { status: 500 });
  }
}

// Admin güncelleme
export async function PUT(req: Request) {
  await dbConnect();

  try {
    const { id, username, email, role } = await req.json();
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { username, email, role }, { new: true });
    if (!updatedAdmin) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Admin başarıyla güncellendi', admin: updatedAdmin });
  } catch (error) {
    console.error('Admin güncelleme hatası:', error);
    return NextResponse.json({ error: 'Admin güncellenemedi' }, { status: 500 });
  }
}

// Admin silme
export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { id } = await req.json();
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Admin başarıyla silindi' });
  } catch (error) {
    console.error('Admin silme hatası:', error);
    return NextResponse.json({ error: 'Admin silinemedi' }, { status: 500 });
  }
}

