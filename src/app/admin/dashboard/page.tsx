import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, GraduationCap, BookOpen, Bell } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-2 border-neon-purple">
          <CardHeader>
            <CardTitle className="text-neon-blue flex items-center">
              <Users className="mr-2" />
              Öğrenciler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-2xl font-bold">Toplam: 250</p>
            <Button asChild className="w-full bg-neon-purple hover:bg-neon-pink">
              <Link href="/admin/students">Öğrencileri Yönet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-2 border-neon-blue">
          <CardHeader>
            <CardTitle className="text-neon-pink flex items-center">
              <GraduationCap className="mr-2" />
              Öğretmenler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-2xl font-bold">Toplam: 20</p>
            <Button asChild className="w-full bg-neon-blue hover:bg-neon-purple">
              <Link href="/admin/teachers">Öğretmenleri Yönet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-2 border-neon-yellow">
          <CardHeader>
            <CardTitle className="text-neon-yellow flex items-center">
              <BookOpen className="mr-2" />
              Sınıflar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-2xl font-bold">Toplam: 12</p>
            <Button asChild className="w-full bg-neon-yellow hover:bg-neon-blue text-slate-900 hover:text-white">
              <Link href="/admin/classes">Sınıfları Yönet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-slate-800 border-2 border-neon-purple">
        <CardHeader>
          <CardTitle className="text-neon-blue flex items-center">
            <Bell className="mr-2" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="text-neon-pink">Yeni öğrenci kaydı: Ahmet Yılmaz</li>
            <li className="text-neon-blue">Sınav sonuçları güncellendi: 8A</li>
            <li className="text-neon-yellow">Yeni öğretmen atandı: Ayşe Kaya</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

