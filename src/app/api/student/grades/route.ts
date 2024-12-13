import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = session.user.id // Added studentId

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const query: { courseId: ObjectId; studentId?: ObjectId } = { courseId: new ObjectId(courseId) }

    if (studentId) {
      query.studentId = new ObjectId(studentId);
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

