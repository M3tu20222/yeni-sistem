"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { BookOpen, Users, ClipboardList, Calendar } from 'lucide-react'
import Link from "next/link"

interface DashboardData {
  classCount: number
  studentCount: number
  upcomingExamCount: number
  upcomingEvents: Array<{
    _id: string
    title: string
    date: string
    type: 'exam' | 'project' | 'trip'
  }>
}

export default function TeacherDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/teacher/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        toast({
          title: "Hata",
          description: "Dashboard verisi yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Dashboard verisi yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  if (!dashboardData) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-[#0F1629] text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğretmen Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-2 border-neon-purple shadow-lg shadow-neon-purple/20">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center">
              <BookOpen className="mr-2" />
              Sınıflarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Toplam: {dashboardData.classCount}</p>
            <Button asChild className="w-full bg-neon-purple hover:bg-neon-pink text-white">
              <Link href="/teacher/classes">Sınıflarımı Görüntüle</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-2 border-neon-blue shadow-lg shadow-neon-blue/20">
          <CardHeader>
            <CardTitle className="text-neon-blue flex items-center">
              <Users className="mr-2" />
              Öğrencilerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Toplam: {dashboardData.studentCount}</p>
            <Button asChild className="w-full bg-neon-blue hover:bg-neon-purple text-white">
              <Link href="/teacher/students">Öğrencilerimi Görüntüle</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-2 border-neon-yellow shadow-lg shadow-neon-yellow/20">
          <CardHeader>
            <CardTitle className="text-neon-yellow flex items-center">
              <ClipboardList className="mr-2" />
              Sınavlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Yaklaşan: {dashboardData.upcomingExamCount}</p>
            <Button asChild className="w-full bg-neon-yellow hover:bg-neon-blue text-slate-900 hover:text-white">
              <Link href="/teacher/exams">Sınav Takvimi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-2 border-neon-green shadow-lg shadow-neon-green/20">
        <CardHeader>
          <CardTitle className="text-neon-green flex items-center">
            <Calendar className="mr-2" />
            Yaklaşan Etkinlikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {dashboardData.upcomingEvents.map((event) => (
              <li key={event._id} className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${getEventTypeColor(event.type)}`}></span>
                <span className="text-neon-blue">{event.title}:</span>
                <span className="ml-2 text-neon-pink">{formatRemainingTime(event.date)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'exam':
      return 'bg-neon-red'
    case 'project':
      return 'bg-neon-green'
    case 'trip':
      return 'bg-neon-yellow'
    default:
      return 'bg-neon-blue'
  }
}

function formatRemainingTime(dateString: string): string {
  const eventDate = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(eventDate.getTime() - now.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays < 7) return `${diffDays} gün kaldı`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta kaldı`
  return `${Math.floor(diffDays / 30)} ay kaldı`
}

