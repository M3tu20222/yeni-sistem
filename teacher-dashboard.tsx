'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format } from 'date-fns'
import { PlusIcon, DownloadIcon, UploadIcon } from 'lucide-react'

interface Score {
  value: number;
  date: Date;
}

interface Student {
  id: string;
  number: string;
  name: string;
  class: string;
  scores: Score[];
}

export function TeacherDashboardComponent() {
  const [students, setStudents] = useState<Student[]>([
    { id: "1", number: "001", name: "Alice Johnson", class: "10A", scores: [{ value: 74, date: new Date() }] },
    { id: "2", number: "002", name: "Bob Smith", class: "10A", scores: [] },
    { id: "3", number: "003", name: "Charlie Brown", class: "10B", scores: [] },
    { id: "4", number: "004", name: "Diana Ross", class: "10B", scores: [] },
    { id: "5", number: "005", name: "Ethan Hunt", class: "10C", scores: [] },
  ])
  const [selectedClass, setSelectedClass] = useState<string>("All")
  const [tempScore, setTempScore] = useState<number>(0)
  const [randomStudents, setRandomStudents] = useState<Student[]>([])
  const [isRandomStudentsDialogOpen, setIsRandomStudentsDialogOpen] = useState(false)
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({ number: '', name: '' })

  const handleScoreChange = (newScore: number) => {
    setTempScore(newScore)
  }

  const saveScore = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, scores: [...student.scores, { value: tempScore, date: new Date() }] } 
        : student
    ))
  }

  const calculateAvgScore = (scores: Score[]): number => {
    const sum = scores.reduce((acc, score) => acc + score.value, 0)
    return scores.length > 0 ? Math.round(sum / scores.length) : 0
  }

  const getAvailableScoreCount = (scores: Score[]): number => {
    if (scores.length === 0) return 4;
    if (scores.length < 4) return 4;
    if (scores.length === 4) return 8;
    if (scores.length < 8) return 8;
    if (scores.length === 8) return 12;
    if (scores.length < 12) return 12;
    return 16;
  }

  const filteredStudents = selectedClass === "All" 
    ? students 
    : students.filter(student => student.class === selectedClass)

  const classPerformanceData = [
    { name: '10A', avgScore: calculateAvgScore(students.filter(s => s.class === '10A').flatMap(s => s.scores)) },
    { name: '10B', avgScore: calculateAvgScore(students.filter(s => s.class === '10B').flatMap(s => s.scores)) },
    { name: '10C', avgScore: calculateAvgScore(students.filter(s => s.class === '10C').flatMap(s => s.scores)) },
  ]

  const selectRandomStudents = () => {
    const classStudents = students.filter(s => s.class === selectedClass)
    const sortedStudents = [...classStudents].sort((a, b) => a.scores.length - b.scores.length)
    setRandomStudents(sortedStudents.slice(0, 3))
    setIsRandomStudentsDialogOpen(true)
  }

  const handleAddStudent = () => {
    if (newStudent.number && newStudent.name) {
      const newId = (parseInt(students[students.length - 1].id) + 1).toString()
      setStudents([...students, { ...newStudent, id: newId, class: selectedClass, scores: [] }])
      setNewStudent({ number: '', name: '' })
      setIsAddStudentDialogOpen(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-green-400'
    if (score >= 70) return 'bg-yellow-400'
    if (score >= 60) return 'bg-orange-400'
    return 'bg-red-500'
  }

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Number,Name,Class,Average Score\n"
      + students.map(s => `${s.id},${s.number},${s.name},${s.class},${calculateAvgScore(s.scores)}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const importCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split("\n");
        const newStudents: Student[] = lines.slice(1).map((line, index) => {
          const [id, number, name, className, avgScore] = line.split(",");
          return {
            id: (index + 1).toString(),
            number,
            name,
            class: className,
            scores: avgScore ? [{ value: parseInt(avgScore), date: new Date() }] : []
          };
        });
        setStudents(newStudents);
      };
      reader.readAsText(file);
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Teacher's Dashboard</h2>
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Teacher" />
            <AvatarFallback>DW</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold text-white">Daniel Wilson</h3>
          <p className="text-sm mb-4">Math Teacher</p>
          <div className="space-y-2">
            <Button onClick={exportCSV} variant="outline" className="w-full bg-gray-700 text-gray-200 hover:bg-gray-600">
              <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Label htmlFor="csv-upload" className="w-full">
              <Button variant="outline" className="w-full cursor-pointer bg-gray-700 text-gray-200 hover:bg-gray-600">
                <UploadIcon className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={importCSV}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Welcome, Daniel!</h1>
        
        {/* Charts section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Class Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Student Performance Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredStudents.map(student => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <span className="w-24 truncate text-gray-300">{student.name}</span>
                    <div className="flex-1 grid grid-cols-4 gap-1">
                      {student.scores.slice(0, 4).map((score, index) => (
                        <div 
                          key={index} 
                          className={`h-6 ${getPerformanceColor(score.value)} rounded`} 
                          title={`Score ${index + 1}: ${score.value}`}
                        />
                      ))}
                      {Array(4 - student.scores.length).fill(0).map((_, index) => (
                        <div 
                          key={`empty-${index}`} 
                          className="h-6 bg-gray-700 rounded" 
                          title="No score yet"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-gray-300">
                <span>Score 1</span>
                <span>Score 2</span>
                <span>Score 3</span>
                <span>Score 4</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card className="bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Student List</CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={selectRandomStudents} size="sm" variant="outline" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                Select Random Students
              </Button>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px] bg-gray-700 text-gray-200 border-gray-600">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-gray-200 border-gray-600">
                  <SelectItem value="All">All Classes</SelectItem>
                  <SelectItem value="10A">10A</SelectItem>
                  <SelectItem value="10B">10B</SelectItem>
                  <SelectItem value="10C">10C</SelectItem>
                </SelectContent>
              </Select>
              {selectedClass !== "All" && (
                <Button onClick={() => setIsAddStudentDialogOpen(true)} size="sm" variant="outline" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Student
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Number</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Class</TableHead>
                  <TableHead className="text-gray-300">Avg Score</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-gray-300">{student.number}</TableCell>
                    <TableCell className="text-gray-300">{student.name}</TableCell>
                    <TableCell className="text-gray-300">{student.class}</TableCell>
                    <TableCell className="text-gray-300">{calculateAvgScore(student.scores)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: getAvailableScoreCount(student.scores) }).map((_, index) => (
                          <Dialog key={index}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0 bg-gray-700 text-gray-200 hover:bg-gray-600"
                              >
                                {student.scores[index]?.value ?? '-'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-300 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">{student.name}'s Score Details</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={student.scores}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="date" 
                                      tickFormatter={(date) => format(new Date(date), 'dd/MM/yy')}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                                      formatter={(value, name) => [`${value}`, 'Score']}
                                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#4ADE80" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              {index === student.scores.length && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Slider
                                    value={[tempScore]}
                                    onValueChange={([value]) => handleScoreChange(value)}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                  />
                                  <Button 
                                    onClick={() => saveScore(student.id)}
                                    variant="outline"
                                    size="sm"
                                    className="bg-gray-700 text-gray-200 hover:bg-gray-600"
                                  >
                                    Save {tempScore}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Random Students Dialog */}
      <Dialog open={isRandomStudentsDialogOpen} onOpenChange={setIsRandomStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-300 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Randomly Selected Students</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ul>
              {randomStudents.map(student => (
                <li key={student.id} className="mb-2">
                  {student.name} - Scores: {student.scores.length}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-300 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Student</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-number">Student Number</Label>
                <Input
                  id="student-number"
                  value={newStudent.number}
                  onChange={(e) => setNewStudent({ ...newStudent, number: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-gray-300"
                />
              </div>
            </div>
          </div>
          <Button onClick={handleAddStudent} variant="outline" className="bg-gray-700 text-gray-200 hover:bg-gray-600">Add Student</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}