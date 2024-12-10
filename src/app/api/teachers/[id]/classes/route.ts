import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const teacher = await db.collection('teachers').findOne({ _id: new ObjectId(params.id) })

    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı.' }, { status: 404 })
    }

    const classes = await db.collection('classes').find({ _id: { $in: teacher.classIds } }).toArray()
    return NextResponse.json(classes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sınıflar yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

