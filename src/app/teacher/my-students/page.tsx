"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ArrowUpDown, Search } from 'lucide-react'

interface Student {
  _id: string
  name: string
  studentNo: string
  className: string
}

type SortField = 'studentNo' | 'name' | 'className'

export default function MyStudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [sortField, setSortField] = useState<SortField>('studentNo')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMyStudents()
  }, [])

  const fetchMyStudents = async () => {
    try {
      const response = await fetch('/api/teacher/my-students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        toast({
          title: "Hata",
          description: "Öğrenciler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Öğrenciler yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedStudents = [...students].sort((a, b) => {
    if (sortField === 'className') {
      const [gradeA, sectionA] = a[sortField].split('-');
      const [gradeB, sectionB] = b[sortField].split('-');
      const gradeComparison = parseInt(gradeA) - parseInt(gradeB);
      if (gradeComparison !== 0) return sortOrder === 'asc' ? gradeComparison : -gradeComparison;
      return sortOrder === 'asc' ? sectionA.localeCompare(sectionB) : sectionB.localeCompare(sectionA);
    }
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  })

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNo.includes(searchTerm) ||
    student.className.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğrencilerim
      </h1>

      <Card className="border-2 border-neon-blue bg-slate-800/50 shadow-lg shadow-neon-blue/20 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink flex items-center justify-between">
            <span>Öğrenci Listesi</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue" size={18} />
              <Input
                type="text"
                placeholder="Öğrenci Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-neon-purple text-white placeholder-neon-blue/50 focus:border-neon-pink transition-colors"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neon-purple">
                <TableHead className="text-neon-blue cursor-pointer" onClick={() => handleSort('studentNo')}>
                  Öğrenci No
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-neon-purple cursor-pointer" onClick={() => handleSort('name')}>
                  Adı Soyadı
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-neon-yellow cursor-pointer" onClick={() => handleSort('className')}>
                  Sınıf
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id} className="border-b border-neon-purple/30 hover:bg-neon-purple/10 transition-colors">
                  <TableCell className="font-medium text-neon-blue">{student.studentNo}</TableCell>
                  <TableCell className="text-neon-pink">{student.name}</TableCell>
                  <TableCell className="text-neon-yellow">{student.className}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button 
          onClick={fetchMyStudents} 
          className="bg-neon-purple hover:bg-neon-pink text-white transition-colors"
        >
          Öğrenci Listesini Yenile
        </Button>
      </div>
    </div>
  )
}

