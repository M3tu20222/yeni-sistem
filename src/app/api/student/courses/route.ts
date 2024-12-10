import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const studentId = new ObjectId(session.user.id)

    const student = await db.collection('students').findOne({ _id: studentId })
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
    }

    // Öğrencinin sınıfını bul
    const studentClass = await db.collection('classes').findOne({ _id: new ObjectId(student.classId) })
    if (!studentClass) {
      return NextResponse.json({ error: 'Öğrenci sınıfı bulunamadı' }, { status: 404 })
    }

    // Sınıfın derslerini bul
    const courses = await db.collection('courses').find({ classIds: studentClass._id.toString() }).toArray()

    // Derslere öğrencinin not ortalamasını ekle
    const coursesWithGrades = courses.map(course => ({
      ...course,
      average: student.gradeAverages ? student.gradeAverages[course._id.toString()] || null : null
    }))

    return NextResponse.json(coursesWithGrades)
  } catch (error) {
    console.error('Dersler yüklenirken hata:', error)
    return NextResponse.json({ error: 'Dersler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

