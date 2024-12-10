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

    // Öğretmenin sınıflarını bul
    const teacher = await db.collection('teachers').findOne({ _id: teacherId })
    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 })
    }

    // Öğretmenin sınıflarındaki öğrencileri bul
    const students = await db.collection('students').aggregate([
      {
        $match: { classId: { $in: teacher.classIds.map((id: string) => new ObjectId(id)) } }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      {
        $unwind: '$class'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          studentNo: 1,
          className: { $concat: [{ $toString: '$class.grade' }, '-', '$class.section'] }
        }
      }
    ]).toArray()

    return NextResponse.json(students)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Öğrenciler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

