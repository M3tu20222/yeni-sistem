import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'teacher' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const courseId = searchParams.get('courseId')

    const { db } = await connectToDatabase()
    
    const query: {
      classId?: ObjectId;
      courseId?: ObjectId;
      teacherId?: ObjectId;
    } = {}

    if (classId) query.classId = new ObjectId(classId)
    if (courseId) query.courseId = new ObjectId(courseId)
    if (session.user.role === 'teacher') query.teacherId = new ObjectId(session.user.id)

    const grades = await db.collection('grades').find(query).toArray()

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Notlar yüklenirken hata:', error)
    return NextResponse.json({ error: 'Notlar yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const { studentId, courseId, classId, value } = await request.json()

    const newGrade = {
      studentId: new ObjectId(studentId),
      teacherId: new ObjectId(session.user.id),
      courseId: new ObjectId(courseId),
      classId: new ObjectId(classId),
      value: value,
      date: new Date()
    }

    await db.collection('grades').insertOne(newGrade)

    // Öğrencinin tüm notlarını al
    const allGrades = await db.collection('grades').find({
      studentId: new ObjectId(studentId),
      courseId: new ObjectId(courseId)
    }).toArray()

    // Ortalamayı hesapla
    const average = allGrades.reduce((sum, grade) => sum + grade.value, 0) / allGrades.length

    // Öğrenci belgesini güncelle
    await db.collection('students').updateOne(
      { _id: new ObjectId(studentId) },
      { 
        $set: { 
          [`gradeAverages.${courseId}`]: average,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      message: 'Not başarıyla eklendi', 
      grades: allGrades,
      average: average
    })
  } catch (error) {
    console.error('Not eklenirken hata:', error)
    return NextResponse.json({ error: 'Not eklenirken bir hata oluştu.' }, { status: 500 })
  }
}

