"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface Class {
  _id: string
  name: string
  grade: number
  section: string
  studentCount: number
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes')
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
        Sınıflarım
      </h1>

      <Card className="bg-slate-800/50 border-2 border-neon-purple shadow-lg shadow-neon-purple/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">Sınıf Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-pink">Sınıf Adı</TableHead>
                <TableHead className="text-neon-yellow">Sınıf</TableHead>
                <TableHead className="text-neon-green">Şube</TableHead>
                <TableHead className="text-neon-blue">Öğrenci Sayısı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem._id}>
                  <TableCell className="font-medium">{classItem.name}</TableCell>
                  <TableCell>{classItem.grade}</TableCell>
                  <TableCell>{classItem.section}</TableCell>
                  <TableCell>{classItem.studentCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

