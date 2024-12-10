import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { hash } from 'bcrypt'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const teachers = await db.collection('teachers').find({}).toArray()
    return NextResponse.json(teachers)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Öğretmenler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { name, email, password, courseId, classIds } = await request.json()

    const existingTeacher = await db.collection('teachers').findOne({ email })
    if (existingTeacher) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const result = await db.collection('teachers').insertOne({
      name,
      email,
      password: hashedPassword,
      courseId,
      classIds,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return NextResponse.json({ _id: result.insertedId, name, email, courseId, classIds })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Öğretmen eklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { id, name, email, courseId, classIds } = await request.json()

    const existingTeacher = await db.collection('teachers').findOne({ email, _id: { $ne: new ObjectId(id) } })
    if (existingTeacher) {
      return NextResponse.json({ error: 'Bu e-posta adresi başka bir öğretmen tarafından kullanılıyor.' }, { status: 400 })
    }

    await db.collection('teachers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email, courseId, classIds, updatedAt: new Date() } }
    )
    return NextResponse.json({ _id: id, name, email, courseId, classIds })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Öğretmen güncellenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await request.json()
    await db.collection('teachers').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ message: 'Öğretmen başarıyla silindi.' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Öğretmen silinirken bir hata oluştu.' }, { status: 500 })
  }
}

