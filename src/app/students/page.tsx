"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const studentSchema = z.object({
  studentNo: z.string().min(1, "Öğrenci numarası boş olamaz"),
  name: z.string().min(1, "İsim boş olamaz"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
  classId: z.string().min(1, "Bir sınıf seçmelisiniz"),
});

type StudentForm = z.infer<typeof studentSchema>;

interface Student {
  _id: string;
  studentNo: string;
  name: string;
  email: string;
  classId: string;
}

interface Class {
  _id: string;
  name: string;
  grade: string;
  section: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast({
          title: "Hata",
          description: "Öğrenciler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Öğrenciler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast({
          title: "Hata",
          description: "Sınıflar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sınıflar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Sınıflar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: StudentForm) => {
    try {
      const url = "/api/students";
      const method = editingStudent ? "PUT" : "POST";
      const body = JSON.stringify({
        ...data,
        id: editingStudent?._id,
      });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const responseData = await response.json();
      if (response.ok) {
        toast({
          title: "Başarılı",
          description: `Öğrenci başarıyla ${
            editingStudent ? "güncellendi" : "oluşturuldu"
          }.`,
        });
        fetchStudents();
        // Formu tamamen sıfırla
        reset({
          studentNo: "",
          name: "",
          email: "",
          password: "",
          classId: "",
        });
        setEditingStudent(null);
      } else {
        toast({
          title: "Hata",
          description:
            responseData.error ||
            `Öğrenci ${
              editingStudent ? "güncellenirken" : "oluşturulurken"
            } bir hata oluştu.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Öğrenci kaydedilirken hata:", error);
      toast({
        title: "Hata",
        description: `Öğrenci ${
          editingStudent ? "güncellenirken" : "oluşturulurken"
        } bir hata oluştu.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu öğrenciyi silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          toast({
            title: "Başarılı",
            description: "Öğrenci başarıyla silindi.",
          });
          fetchStudents();
        } else {
          toast({
            title: "Hata",
            description: "Öğrenci silinirken bir hata oluştu.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Öğrenci silinirken hata:", error);
        toast({
          title: "Hata",
          description: "Öğrenci silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    reset({
      studentNo: student.studentNo,
      name: student.name,
      email: student.email,
      classId: student.classId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğrenci Yönetimi
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            {editingStudent ? "Öğrenci Düzenle" : "Yeni Öğrenci Ekle"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="studentNo" className="text-neon-pink">
                Öğrenci Numarası
              </Label>
              <Input
                id="studentNo"
                {...register("studentNo")}
                className="bg-slate-700 border-neon-blue"
              />
              {errors.studentNo && (
                <p className="text-red-500">{errors.studentNo.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name" className="text-neon-pink">
                Öğrenci Adı
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-slate-700 border-neon-blue"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-neon-pink">
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-slate-700 border-neon-blue"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            {!editingStudent && (
              <div>
                <Label htmlFor="password" className="text-neon-pink">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-slate-700 border-neon-blue"
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="classId" className="text-neon-yellow">
                Sınıf
              </Label>
              <Controller
                name="classId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-700 border-neon-blue text-white">
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-slate-800 border-neon-blue"
                      position="popper"
                      sideOffset={5}
                    >
                      {classes.map((classItem) => (
                        <SelectItem
                          key={classItem._id}
                          value={classItem._id}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                        >
                          {`${classItem.grade}-${classItem.section}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-red-500">{errors.classId.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-purple hover:bg-neon-pink transition-colors"
            >
              {editingStudent ? "Güncelle" : "Ekle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Öğrenci Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Öğrenci No</TableHead>
                <TableHead className="text-neon-purple">Adı Soyadı</TableHead>
                <TableHead className="text-neon-yellow">E-posta</TableHead>
                <TableHead className="text-neon-green">Sınıf</TableHead>
                <TableHead className="text-neon-orange">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentClass = classes.find(
                  (c) => c._id === student.classId
                );
                return (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      {student.studentNo}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {studentClass
                        ? `${studentClass.grade}-${studentClass.section}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEdit(student)}
                        className="mr-2 bg-neon-blue hover:bg-neon-purple transition-colors"
                      >
                        Düzenle
                      </Button>
                      <Button
                        onClick={() => handleDelete(student._id)}
                        className="bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Sil
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
