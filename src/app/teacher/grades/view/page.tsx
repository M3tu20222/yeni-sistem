"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Grade {
  _id: string;
  studentId: string;
  courseId: string;
  classId: string;
  value: number;
  date: string;
}

export default function ViewGradesPage() {
  const { data: session } = useSession();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedStudent, selectedCourse, selectedClass]);

  const fetchStudents = async () => {
    // API'den öğrencileri getir
  };

  const fetchCourses = async () => {
    // API'den dersleri getir
  };

  const fetchClasses = async () => {
    // API'den sınıfları getir
  };

  const fetchGrades = async () => {
    try {
      let url = "/api/grades?";
      if (selectedStudent) url += `studentId=${selectedStudent}&`;
      if (selectedCourse) url += `courseId=${selectedCourse}&`;
      if (selectedClass) url += `classId=${selectedClass}&`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      } else {
        toast({
          title: "Hata",
          description: "Notlar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Notlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Notlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Notları Görüntüle
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            Filtrele
          </CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Select onValueChange={setSelectedStudent} value={selectedStudent}>
            <SelectTrigger className="bg-slate-700 border-neon-blue">
              <SelectValue placeholder="Öğrenci seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Öğrenciler</SelectItem>
              {students.map((student: any) => (
                <SelectItem key={student._id} value={student._id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedCourse} value={selectedCourse}>
            <SelectTrigger className="bg-slate-700 border-neon-blue">
              <SelectValue placeholder="Ders seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Dersler</SelectItem>
              {courses.map((course: any) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger className="bg-slate-700 border-neon-blue">
              <SelectValue placeholder="Sınıf seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Sınıflar</SelectItem>
              {classes.map((classItem: any) => (
                <SelectItem key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Not Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Öğrenci</TableHead>
                <TableHead className="text-neon-purple">Ders</TableHead>
                <TableHead className="text-neon-yellow">Sınıf</TableHead>
                <TableHead className="text-neon-green">Not</TableHead>
                <TableHead className="text-neon-orange">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade._id}>
                  <TableCell>
                    {students.find((s: any) => s._id === grade.studentId)
                      ?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {courses.find((c: any) => c._id === grade.courseId)?.name ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    {classes.find((c: any) => c._id === grade.classId)?.name ||
                      "N/A"}
                  </TableCell>
                  <TableCell>{grade.value}</TableCell>
                  <TableCell>
                    {new Date(grade.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
