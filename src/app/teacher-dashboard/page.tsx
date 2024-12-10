"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface Class {
  _id: string
  grade: number
  section: string
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const [classes, setClasses] = useState<Class[]>([])

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeacherClasses()
    }
  }, [session])

  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch(`/api/teachers/${session?.user?.id}/classes`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        toast({
          title: "Hata",
          description: "Sınıflar yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Sınıflar yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Sınıflar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğretmen Paneli
      </h1>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">Sınıflarım</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Sınıf</TableHead>
                <TableHead className="text-neon-purple">Şube</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem._id}>
                  <TableCell className="font-medium">{classItem.grade}</TableCell>
                  <TableCell>{classItem.section}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

