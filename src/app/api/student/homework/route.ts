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

    const homeworks = await db.collection('homeworks').aggregate([
      { $match: { classId: student.classId } },
      {
        $addFields: {
          submitted: {
            $in: [studentId, "$submissions.studentId"]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          dueDate: 1,
          submitted: 1
        }
      }
    ]).toArray()

    return NextResponse.json(homeworks)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ödevler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

