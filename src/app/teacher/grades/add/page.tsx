"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradeModal } from "@/components/grade-modal";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Users, ClipboardList } from "lucide-react";
import React from "react";

interface Grade {
  _id: string;
  studentId: string;
  teacherId: string;
  courseId: string;
  classId: string;
  value: number;
  date: string;
}

interface Student {
  _id: string;
  studentNo: string;
  name: string;
  classId: string;
  grades?: Grade[];
  gradeAverages?: { [key: string]: number };
  averageScore?: number;
}

interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
}

export default function AddGradePage() {
  useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [teacherCourse, setTeacherCourse] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentScores, setStudentScores] = useState<{ [key: string]: number }>(
    {}
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClasses();
    fetchTeacherCourse();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        showToast(
          "Hata",
          "Sınıflar yüklenirken bir hata oluştu.",
          "destructive"
        );
      }
    } catch (error) {
      console.error("Sınıflar yüklenirken hata:", error);
      showToast("Hata", "Sınıflar yüklenirken bir hata oluştu.", "destructive");
    }
  };

  const fetchTeacherCourse = async () => {
    try {
      const response = await fetch("/api/teacher/course");
      if (response.ok) {
        const data = await response.json();
        setTeacherCourse(data.courseId);
      } else {
        showToast(
          "Hata",
          "Öğretmen dersi yüklenirken bir hata oluştu.",
          "destructive"
        );
      }
    } catch (error) {
      console.error("Öğretmen dersi yüklenirken hata:", error);
      showToast(
        "Hata",
        "Öğretmen dersi yüklenirken bir hata oluştu.",
        "destructive"
      );
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/students?classId=${classId}`);
      if (response.ok) {
        const data: Student[] = await response.json();
        setStudents(
          data.map((student) => ({
            ...student,
            grades: student.grades || [],
            averageScore:
              teacherCourse && student.gradeAverages
                ? student.gradeAverages[teacherCourse] || 0
                : 0,
          }))
        );
        const allGrades = data
          .flatMap((student) => student.grades || [])
          .filter((grade) => grade !== null && grade !== undefined);
        setGrades(allGrades);
      } else {
        showToast(
          "Hata",
          "Öğrenciler yüklenirken bir hata oluştu.",
          "destructive"
        );
      }
    } catch (error) {
      console.error("Öğrenciler yüklenirken hata:", error);
      showToast(
        "Hata",
        "Öğrenciler yüklenirken bir hata oluştu.",
        "destructive"
      );
    }
  };

  const getAvailableScoreCount = (studentId: string): number => {
    const studentGrades = grades.filter(
      (grade) =>
        grade &&
        grade.studentId === studentId &&
        grade.courseId === teacherCourse
    );
    const gradeCount = studentGrades.length;
    if (gradeCount === 0) return 4;
    if (gradeCount < 4) return 4;
    if (gradeCount === 4) return 8;
    if (gradeCount < 8) return 8;
    if (gradeCount === 8) return 12;
    if (gradeCount < 12) return 12;
    return 16;
  };

  const handleGradeClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleScoreChange = (studentId: string, value: number) => {
    setStudentScores((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    toast({
      title,
      description,
      variant,
    });
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (response.ok) {
        const updatedStudent: Student = await response.json();
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === studentId
              ? {
                  ...student,
                  ...updatedStudent,
                  grades: updatedStudent.grades || [],
                  averageScore:
                    teacherCourse && updatedStudent.gradeAverages
                      ? updatedStudent.gradeAverages[teacherCourse] || 0
                      : 0,
                }
              : student
          )
        );
        // Grades state'ini güncelle
        setGrades((prevGrades) => [
          ...prevGrades.filter((g) => g && g.studentId !== studentId),
          ...(updatedStudent.grades || []),
        ]);
      } else {
        throw new Error("Öğrenci verileri alınamadı");
      }
    } catch (error) {
      console.error("Öğrenci verileri güncellenirken hata:", error);
      showToast(
        "Hata",
        "Öğrenci verileri güncellenirken bir hata oluştu.",
        "destructive"
      );
    }
  };

  const saveScore = async (studentId: string) => {
    if (!teacherCourse) return;
    const score = studentScores[studentId] || 0;

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId: teacherCourse,
          classId: selectedClass,
          value: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Not kaydedilemedi");
      }

      const data = await response.json();

      // Update grades state with the new grade
      setGrades((prevGrades) => [...prevGrades, data.newGrade]);

      // Update students state to reflect the new grade and average
      setStudents((prevStudents) => {
        return prevStudents.map((student) => {
          if (student._id === studentId) {
            const updatedGrades = [...(student.grades || []), data.newGrade];
            const newAverageScore = calculateNewAverage(updatedGrades); // Calculate new average
            return {
              ...student,
              grades: updatedGrades,
              averageScore: newAverageScore, // Update average score
            };
          }
          return student;
        });
      });

      setStudentScores((prev) => ({ ...prev, [studentId]: 0 }));

      showToast("Başarılı", "Not başarıyla kaydedildi.", "default");

      // Fetch updated student data
      await fetchStudentData(studentId);
    } catch (error) {
      console.error("Not kaydedilirken hata:", error);
      showToast("Hata", "Not kaydedilirken bir hata oluştu.", "destructive");
    }
  };  

  // Helper function to calculate the new average score
  const calculateNewAverage = (grades: Grade[]): number => {
    // Filter out any undefined or null grades
    const validGrades = grades.filter(
      (grade) => grade && grade.value !== undefined
    );

    if (validGrades.length === 0) return 0; // Return 0 if no valid grades

    const total = validGrades.reduce((sum, grade) => sum + grade.value, 0);
    return total / validGrades.length;
  };  

  const handleGradeSave = async (value: number) => {
    if (!selectedStudent || !teacherCourse) return;

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          courseId: teacherCourse,
          classId: selectedClass,
          value: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Not kaydedilemedi");
      }

      const data = await response.json();

      // Update local state
      setStudents((prevStudents) => {
        return prevStudents.map((student) => {
          if (student._id === selectedStudent._id) {
            return {
              ...student,
              grades: [...(student.grades || []), data.newGrade],
              averageScore: data.average,
            };
          }
          return student;
        });
      });

      // Update grades state
      setGrades((prevGrades) => [...prevGrades, data.newGrade]);

      showToast("Başarılı", "Not başarıyla kaydedildi.", "default");
    } catch (error) {
      console.error("Not kaydedilirken hata:", error);
      showToast("Hata", "Not kaydedilirken bir hata oluştu.", "destructive");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNo.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0F1629] text-white p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-2 border-neon-purple shadow-lg shadow-neon-purple/20">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center">
              <BookOpen className="mr-2" />
              Sınıflarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Toplam: {classes.length}</p>
            <Button className="w-full bg-neon-purple hover:bg-neon-pink text-white">
              Sınıflarımı Görüntüle
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
            <p className="text-2xl font-bold mb-4">Toplam: {students.length}</p>
            <Button className="w-full bg-neon-blue hover:bg-neon-purple text-white">
              Öğrencilerimi Görüntüle
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
            <p className="text-2xl font-bold mb-4">Yaklaşan: 2</p>
            <Button className="w-full bg-neon-yellow hover:bg-neon-blue text-slate-900 hover:text-white">
              Sınav Takvimi
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
          Not İşlemleri
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue"
              size={18}
            />
            <Input
              type="text"
              placeholder="Öğrenci Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-2 border-neon-blue focus:border-neon-purple transition-colors"
            />
          </div>
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors">
              <SelectValue placeholder="Sınıf Seç" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-neon-purple">
              {classes.map((classItem) => (
                <SelectItem
                  key={classItem._id}
                  value={classItem._id}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  {classItem.grade}-{classItem.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-2 border-neon-purple bg-slate-800/50 shadow-lg shadow-neon-purple/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-slate-800/50">
                <TableHead className="text-neon-blue">Numara</TableHead>
                <TableHead className="text-neon-purple">İsim</TableHead>
                <TableHead className="text-neon-pink">Sınıf</TableHead>
                <TableHead className="text-neon-yellow">Ortalama</TableHead>
                <TableHead className="text-neon-blue">Notlar</TableHead>
                <TableHead className="text-neon-purple">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const currentClass = classes.find(
                  (c) => c._id === student.classId
                );
                return (
                  <TableRow key={student._id} className="hover:bg-slate-800/50">
                    <TableCell className="font-medium">
                      {student.studentNo}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      {currentClass
                        ? `${currentClass.grade}-${currentClass.section}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {student.averageScore?.toFixed(1) ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {Array.from({
                          length: getAvailableScoreCount(student._id),
                        }).map((_, index) => {
                          const studentGrades = grades.filter(
                            (g) =>
                              g &&
                              g.studentId === student._id &&
                              g.courseId === teacherCourse
                          );
                          return (
                            <React.Fragment key={index}>
                              <Button
                                variant={
                                  index < studentGrades.length
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handleGradeClick(student)}
                                className={
                                  index < studentGrades.length
                                    ? "bg-neon-purple hover:bg-neon-pink text-white"
                                    : "border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white"
                                }
                              >
                                {index < studentGrades.length
                                  ? studentGrades[index].value
                                  : "-"}
                              </Button>
                              {index === studentGrades.length && (
                                <div className="mt-2 flex items-center gap-2 w-full">
                                  <Slider
                                    value={[studentScores[student._id] || 0]}
                                    onValueChange={([value]) =>
                                      handleScoreChange(student._id, value)
                                    }
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                  />
                                  <Button
                                    onClick={() => saveScore(student._id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-neon-green text-neon-green hover:bg-neon-green hover:text-white transition-colors whitespace-nowrap"
                                  >
                                    Kaydet {studentScores[student._id] || 0}
                                  </Button>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStudent && (
        <GradeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleGradeSave}
          studentName={selectedStudent.name}
          grades={grades.filter(
            (g) =>
              g &&
              g.studentId === selectedStudent._id &&
              g.courseId === teacherCourse
          )}
        />
      )}
    </div>
  );
}
