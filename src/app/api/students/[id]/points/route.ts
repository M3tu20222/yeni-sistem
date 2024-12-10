import { NextResponse } from 'next/server';  
import { connectToDatabase } from '@/lib/mongodb';  
import { getServerSession } from "next-auth/next";  
import { authOptions } from "@/app/api/auth/[...nextauth]/route";  
import { ObjectId } from 'mongodb';  

export async function POST(  
  request: Request,  
  { params }: { params: { id: string } }  
) {  
  // params.id'ye async işlemden önce erişiyoruz  
  const studentId = new ObjectId(params.id);  

  try {  
    const session = await getServerSession(authOptions);  
    if (!session || (session.user.role !== 'teacher' && session.user.role !== 'admin')) {  
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
    }  

    const { db } = await connectToDatabase();  
    const { points } = await request.json();  

    const result = await db.collection('students').updateOne(  
      { _id: studentId },  
      { $inc: { points: points } }  
    );  

    if (result.modifiedCount === 0) {  
      return NextResponse.json({ error: 'Öğrenci bulunamadı veya puan güncellenemedi' }, { status: 404 });  
    }  

    return NextResponse.json({ message: 'Puanlar başarıyla güncellendi' });  
  } catch (error) {  
    console.error(error);  
    return NextResponse.json({ error: 'Puan güncellenirken bir hata oluştu' }, { status: 500 });  
  }  
}  