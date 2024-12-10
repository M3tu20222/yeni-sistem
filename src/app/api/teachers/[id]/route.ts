// src/app/api/teachers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'URL\'de bir ID bulunamadı.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const { name, email, courseId, classIds } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Geçersiz ID formatı.' }, { status: 400 });
    }

    const existingTeacher = await db.collection('teachers').findOne({ 
      email, 
      _id: { $ne: new ObjectId(id) }
    });

    if (existingTeacher) {
      return NextResponse.json({
        error: 'Bu e-posta adresi başka bir öğretmen tarafından kullanılıyor.'
      }, { status: 400 });
    }

    const result = await db.collection('teachers').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, email, courseId, classIds, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Öğretmen başarıyla güncellendi',
      teacher: result.value
    });
  } catch (error) {
    console.error('Öğretmen güncellenirken hata:', error);
    return NextResponse.json({
      error: 'Öğretmen güncellenirken bir hata oluştu.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'URL\'de bir ID bulunamadı.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Geçersiz ID formatı.' }, { status: 400 });
    }

    const result = await db.collection('teachers').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Öğretmen başarıyla silindi.' });
  } catch (error) {
    console.error('Öğretmen silinirken hata:', error);
    return NextResponse.json({
      error: 'Öğretmen silinirken bir hata oluştu.'
    }, { status: 500 });
  }
}