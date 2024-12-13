import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'
import { Homework } from '@/models/Homework'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const teacherId = new ObjectId(session.user.id)

    const homeworks = await Homework.aggregate([
      { $match: { teacherId } },
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
          title: 1,
          description: 1,
          dueDate: 1,
          submissions: 1,
          className: { $concat: [{ $toString: '$class.grade' }, '-', '$class.section'] }
        }
      }
    ])

    return NextResponse.json(homeworks)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ödevler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const { title, description, classId, dueDate } = await request.json()

    const newHomework = new Homework({
      title,
      description,
      teacherId: new ObjectId(session.user.id),
      classId: new ObjectId(classId),
      dueDate: new Date(dueDate),
    })

    await newHomework.save()

    return NextResponse.json({ message: 'Ödev başarıyla oluşturuldu' }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ödev oluşturulurken bir hata oluştu.' }, { status: 500 })
  }
}

