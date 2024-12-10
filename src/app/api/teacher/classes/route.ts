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

    const classIds = teacher.classIds.map((id: string) => new ObjectId(id))
    const classes = await db.collection('classes').find({ _id: { $in: classIds } }).toArray()

    // Count students for each class
    const classesWithStudentCount = await Promise.all(classes.map(async (classItem) => {
      const studentCount = await db.collection('students').countDocuments({ classId: classItem._id })
      return {
        ...classItem,
        studentCount
      }
    }))

    return NextResponse.json(classesWithStudentCount)
  } catch (error) {
    console.error('Sınıflar yüklenirken hata:', error)
    return NextResponse.json({ error: 'Sınıflar yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

