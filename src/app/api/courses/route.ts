import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const courses = await db.collection('courses').find({}).toArray()
    return NextResponse.json(courses)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Dersler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { name, classIds } = await request.json()

    // Ders adının benzersiz olduğunu kontrol et
    const existingCourse = await db.collection('courses').findOne({ name })
    if (existingCourse) {
      return NextResponse.json({ error: 'Bu isimde bir ders zaten mevcut.' }, { status: 400 })
    }

    // classIds'in bir dizi olduğundan emin ol
    if (!Array.isArray(classIds)) {
      return NextResponse.json({ error: 'classIds bir dizi olmalıdır.' }, { status: 400 })
    }

    const result = await db.collection('courses').insertOne({ name, classIds })
    return NextResponse.json({ _id: result.insertedId, name, classIds })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ders eklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { id, name, classIds } = await request.json()

    // Ders adının benzersiz olduğunu kontrol et (kendi ID'si hariç)
    const existingCourse = await db.collection('courses').findOne({ name, _id: { $ne: new ObjectId(id) } })
    if (existingCourse) {
      return NextResponse.json({ error: 'Bu isimde başka bir ders zaten mevcut.' }, { status: 400 })
    }

    // classIds'in bir dizi olduğundan emin ol
    if (!Array.isArray(classIds)) {
      return NextResponse.json({ error: 'classIds bir dizi olmalıdır.' }, { status: 400 })
    }

    await db.collection('courses').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, classIds } }
    )
    return NextResponse.json({ _id: id, name, classIds })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ders güncellenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await request.json()
    await db.collection('courses').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ message: 'Ders başarıyla silindi.' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ders silinirken bir hata oluştu.' }, { status: 500 })
  }
}

