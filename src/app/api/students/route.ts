import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'teacher' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const { db } = await connectToDatabase()
    
    let query = {}
    if (classId) {
      query = { classId: new ObjectId(classId) }
    }

    const students = await db.collection('students').find(query).toArray()

    // Öğrencilerin notlarını al
    const studentsWithGrades = await Promise.all(students.map(async (student) => {
      const grades = await db.collection('grades').find({
        studentId: student._id,
        teacherId: new ObjectId(session.user.id)
      }).toArray()

      return {
        ...student,
        grades: grades
      }
    }))

    return NextResponse.json(studentsWithGrades)
  } catch (error) {
    console.error('Öğrenciler yüklenirken hata:', error)
    return NextResponse.json({ error: 'Öğrenciler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { studentNo, name, email, password, classId } = await request.json()

    // Check if student already exists
    const existingStudent = await db.collection('students').findOne({ $or: [{ studentNo }, { email }] })
    if (existingStudent) {
      return NextResponse.json({ error: 'Öğrenci numarası veya e-posta zaten kullanımda' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new student
    const newStudent = {
      studentNo,
      name,
      email,
      password: hashedPassword,
      classId: new ObjectId(classId),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('students').insertOne(newStudent)
    return NextResponse.json({ message: 'Öğrenci başarıyla eklendi', id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Öğrenci eklenirken hata:', error)
    return NextResponse.json({ error: 'Öğrenci eklenirken bir hata oluştu' }, { status: 500 })
  }
}

// PUT method implementation would go here.  This is a placeholder.  A full implementation would require details on how to update a student record.
export async function PUT(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const { studentId, ...updates } = await request.json();

        const result = await db.collection('students').updateOne(
            { _id: new ObjectId(studentId) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Öğrenci başarıyla güncellendi' }, { status: 200 });
    } catch (error) {
        console.error('Öğrenci güncellenirken hata:', error);
        return NextResponse.json({ error: 'Öğrenci güncellenirken bir hata oluştu' }, { status: 500 });
    }
}

