"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { BookOpen } from "lucide-react";
import CourseList from "@/components/student/CourseList";
import CourseGrades from "@/components/student/CourseGrades";

interface Course {
  _id: string;
  name: string;
  average: number | null;
}

interface Grade {
  _id: string;
  value: number;
  date: string;
}

export default function StudentDashboard() {
  useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/student/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        toast({
          title: "Hata",
          description: "Dersler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Dersler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Dersler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchGrades = async (courseId: string) => {
    try {
      const response = await fetch(`/api/student/grades?courseId=${courseId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades);
        setAverage(data.average);
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

  useEffect(() => {
    if (selectedCourse) {
      fetchGrades(selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğrenci Paneli
      </h1>

      {!selectedCourse ? (
        <Card className="bg-slate-800/50 border-2 border-neon-purple shadow-lg shadow-neon-purple/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neon-blue flex items-center">
              <BookOpen className="mr-2" /> Derslerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CourseList courses={courses} onSelectCourse={setSelectedCourse} />
          </CardContent>
        </Card>
      ) : (
        <CourseGrades
          courseId={selectedCourse}
          courseName={courses.find((c) => c._id === selectedCourse)?.name || ""}
          onBack={() => setSelectedCourse(null)}
          grades={grades}
          average={average}
        />
      )}
    </div>
  );
}
