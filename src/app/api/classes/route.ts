import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Class } from '@/models/Class';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }
}

// Tüm sınıfları listele
export async function GET() {
  const authResponse = await checkAuth()
  if (authResponse) return authResponse

  await dbConnect();
  const classes = await Class.find().sort({ grade: -1, section: 1 });
  return NextResponse.json(classes);
};

// Yeni sınıf oluştur
export async function POST(req: Request) {
  const authResponse = await checkAuth()
  if (authResponse) return authResponse

  await dbConnect();
  const { grade, section } = await req.json();

  // Sınıfın zaten var olup olmadığını kontrol et
  const existingClass = await Class.findOne({ grade, section });
  if (existingClass) {
    return NextResponse.json({ error: 'Bu sınıf zaten mevcut' }, { status: 400 });
  }

  const name = `${grade}-${section.toUpperCase()}`;
  const newClass = new Class({ grade, section, name });
  await newClass.save();
  return NextResponse.json(newClass, { status: 201 });
};

// Sınıf güncelle
export async function PUT(req: Request) {
  const authResponse = await checkAuth()
  if (authResponse) return authResponse

  await dbConnect();
  const { id, grade, section } = await req.json();

  // Güncellenen sınıfın başka bir sınıfla çakışıp çakışmadığını kontrol et
  const existingClass = await Class.findOne({ grade, section, _id: { $ne: id } });
  if (existingClass) {
    return NextResponse.json({ error: 'Bu sınıf adı zaten kullanılıyor' }, { status: 400 });
  }

  const name = `${grade}-${section.toUpperCase()}`;
  const updatedClass = await Class.findByIdAndUpdate(id, { grade, section, name }, { new: true });
  if (!updatedClass) {
    return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
  }
  return NextResponse.json(updatedClass);
};

// Sınıf sil
export async function DELETE(req: Request) {
  const authResponse = await checkAuth()
  if (authResponse) return authResponse

  await dbConnect();
  const { id } = await req.json();
  const deletedClass = await Class.findByIdAndDelete(id);
  if (!deletedClass) {
    return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Sınıf başarıyla silindi' });
};

