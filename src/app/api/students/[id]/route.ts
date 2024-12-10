import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id // Await params.id

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    if (session.user.id === id || ['teacher', 'admin'].includes(session.user.role)) {
      const student = await db.collection('students').findOne({ _id: new ObjectId(id) })
      if (!student) {
        return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
      }

      // Provide a default empty array if student has no badges
      const badges = student.badges || []

      const grades = await db.collection('grades').find({ studentId: new ObjectId(id) }).toArray()

      return NextResponse.json({ ...student, grades: grades || [], badges }) // Include badges in response
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json({ error: 'Öğrenci verileri alınırken bir hata oluştu.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // context.params.id is synchronous here
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const updateData = await request.json()

    // Remove sensitive fields from update data
    delete updateData.password
    delete updateData._id

    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Öğrenci başarıyla güncellendi' })
  } catch (error) {
    console.error('Öğrenci güncellenirken hata:', error)
    return NextResponse.json({ 
      error: 'Öğrenci güncellenirken bir hata oluştu.' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // context.params.id is synchronous here
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Delete student's grades first
    await db.collection('grades').deleteMany({
      studentId: new ObjectId(id)
    })

    // Then delete the student
    const result = await db.collection('students').deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Öğrenci başarıyla silindi' })
  } catch (error) {
    console.error('Öğrenci silinirken hata:', error)
    return NextResponse.json({ 
      error: 'Öğrenci silinirken bir hata oluştu.' 
    }, { status: 500 })
  }
}

