"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface ClassAverage {
  courseId: string
  average: number
}

interface Course {
  _id: string
  name: string
}

export default function ClassAveragesPage() {
  const { data: session } = useSession()
  const [classAverages, setClassAverages] = useState<ClassAverage[]>([])
  const [classes, setClasses] = useState<{ _id: string, name: string }[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedClass, setSelectedClass] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassAverages()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    // API'den sınıfları getir
  }

  const fetchCourses = async () => {
    // API'den dersleri getir
  }

  const fetchClassAverages = async () => {
    try {
      const response = await fetch(`/api/grades/class-averages?classId=${selectedClass}`)
      if (response.ok) {
        const data = await response.json()
        setClassAverages(data)
      } else {
        toast({
          title: "Hata",
          description: "Sınıf ortalamaları yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Sınıf ortalamaları yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Sınıf ortalamaları yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Sınıf Ortalamaları
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">Sınıf Seç</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger className="bg-slate-700 border-neon-blue">
              <SelectValue placeholder="Sınıf seçin" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem._id} value={classItem._id}>{classItem.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClass && (
        <Card className="border-2 border-neon-blue bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neon-pink">Ders Ortalamaları</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-neon-blue">Ders</TableHead>
                  <TableHead className="text-neon-purple">Ortalama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classAverages.map((average) => (
                  <TableRow key={average.courseId}>
                    <TableCell>
                      {courses.find((c) => c._id === average.courseId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{average.average.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

