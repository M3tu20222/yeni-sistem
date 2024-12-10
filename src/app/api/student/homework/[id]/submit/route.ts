import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const studentId = new ObjectId(session.user.id)
    const { id } = params;
    const homeworkId = new ObjectId(id)

    const homework = await db.collection('homeworks').findOne({ _id: homeworkId })
    if (!homework) {
      return NextResponse.json({ error: 'Ödev bulunamadı' }, { status: 404 })
    }

    const now = new Date()
    const status = now > homework.dueDate ? 'late' : 'submitted'

    const updateResult = await db.collection('homeworks').updateOne(
      { _id: homeworkId },
      {
        $push: {
          submissions: {
            studentId,
            submittedAt: now,
            status
          }
        } as any // Type assertion to bypass TypeScript check
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: 'Ödev güncellenemedi' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Ödev başarıyla teslim edildi' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ödev teslim edilirken bir hata oluştu.' }, { status: 500 })
  }
}

