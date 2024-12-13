import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Badge } from '@/models/Badge'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const badges = await db.collection('badges').find({}).toArray()

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Rozetler yüklenirken hata:', error)
    return NextResponse.json({ error: 'Rozetler yüklenirken bir hata oluştu.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const badgeData = await request.json()

    const newBadge = new Badge(badgeData)
    await newBadge.save()

    return NextResponse.json({ message: 'Rozet başarıyla oluşturuldu', badge: newBadge }, { status: 201 })
  } catch (error) {
    console.error('Rozet oluşturulurken hata:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: `Rozet oluşturulurken bir hata oluştu: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: 'Rozet oluşturulurken bilinmeyen bir hata oluştu.' }, { status: 500 })
  }
}

