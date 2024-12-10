import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'student' && session.user.role !== 'teacher' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    let query: any = { courseId: new ObjectId(courseId) }
    
    if (session.user.role === 'student') {
      query.studentId = new ObjectId(session.user.id)
    } else if (session.user.role === 'teacher') {
      query.teacherId = new ObjectId(session.user.id)
    }

    const grades = await db.collection('grades').find(query).sort({ date: -1 }).toArray()

    // Calculate average
    const average = grades.length > 0
      ? grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length
      : null

    return NextResponse.json({ grades, average })
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

    const result = await db.collection('grades').insertOne(newGrade)

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
      newGrade: { ...newGrade, _id: result.insertedId },
      grades: allGrades,
      average: average
    })
  } catch (error) {
    console.error('Not eklenirken hata:', error)
    return NextResponse.json({ error: 'Not eklenirken bir hata oluştu.' }, { status: 500 })
  }
}

