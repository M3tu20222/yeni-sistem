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

    // Fetch teacher's classes
    const teacher = await db.collection('teachers').findOne({ _id: teacherId })
    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 })
    }

    const classIds = teacher.classIds.map((id: string) => new ObjectId(id))
    const classes = await db.collection('classes').find({ _id: { $in: classIds } }).toArray()

    // Count total students in teacher's classes
    const studentCount = await db.collection('students').countDocuments({ classId: { $in: classIds } })

    // Fetch upcoming exams (you might need to create an 'exams' collection)
    const upcomingExams = await db.collection('exams')
      .find({ teacherId, date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(2)
      .toArray()

    // Fetch upcoming events (you might need to create an 'events' collection)
    const upcomingEvents = await db.collection('events')
      .find({ $or: [{ teacherId }, { classIds: { $in: classIds } }], date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(3)
      .toArray()

    return NextResponse.json({
      classCount: classes.length,
      studentCount,
      upcomingExamCount: upcomingExams.length,
      upcomingEvents
    })
  } catch (error) {
    console.error('Dashboard verisi yüklenirken hata:', error)
    return NextResponse.json({ error: 'Dashboard verisi yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

