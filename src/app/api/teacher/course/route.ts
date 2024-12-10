import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const teacherId = new ObjectId(session.user.id)

    const teacher = await db.collection('teachers').findOne({ _id: teacherId })
    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ courseId: teacher.courseId })
  } catch (error) {
    console.error('Öğretmen dersi yüklenirken hata:', error)
    return NextResponse.json({ error: 'Öğretmen dersi yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

