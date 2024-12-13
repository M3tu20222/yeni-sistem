"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const teacherSchema = z.object({
  name: z.string().min(1, "İsim boş olamaz"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
  courseId: z.string().min(1, "Bir ders seçmelisiniz"),
  classIds: z.array(z.string()).min(1, "En az bir sınıf seçilmelidir"),
});

type TeacherForm = z.infer<typeof teacherSchema>;

interface Teacher {
  _id: string;
  name: string;
  email: string;
  courseId: string;
  classIds: string[];
}

interface Course {
  _id: string;
  name: string;
}

interface Class {
  _id: string;
  grade: number;
  section: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      classIds: [],
    },
  });


useEffect(() => {
  const fetchData = async () => {
    await Promise.all([fetchTeachers(), fetchCourses(), fetchClasses()]);
  };
  fetchData();
}, []);
  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        toast({
          title: "Hata",
          description: "Öğretmenler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Öğretmenler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Öğretmenler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
 
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
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
 
  const onSubmit = async (data: TeacherForm) => {
    try {
      const url = editingTeacher
        ? `/api/teachers/${editingTeacher._id}`
        : "/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";
      const body = JSON.stringify({
        ...data,
        id: editingTeacher?._id,
      });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: `Öğretmen başarıyla ${
            editingTeacher ? "güncellendi" : "eklendi"
          }.`,
        });
        fetchTeachers();
        reset();
        setEditingTeacher(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Hata",
          description:
            errorData.error ||
            `Öğretmen ${
              editingTeacher ? "güncellenirken" : "eklenirken"
            } bir hata oluştu.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Öğretmen kaydedilirken hata:", error);
      toast({
        title: "Hata",
        description: `Öğretmen ${
          editingTeacher ? "güncellenirken" : "eklenirken"
        } bir hata oluştu.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu öğretmeni silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/teachers/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Başarılı",
            description: "Öğretmen başarıyla silindi.",
          });
          fetchTeachers();
        } else {
          toast({
            title: "Hata",
            description: "Öğretmen silinirken bir hata oluştu.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Öğretmen silinirken hata:", error);
        toast({
          title: "Hata",
          description: "Öğretmen silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    reset({
      name: teacher.name,
      email: teacher.email,
      courseId: teacher.courseId,
      classIds: teacher.classIds,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğretmen Yönetimi
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            {editingTeacher ? "Öğretmen Düzenle" : "Yeni Öğretmen Ekle"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-neon-pink">
                Öğretmen Adı
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
            {!editingTeacher && (
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
              <Label htmlFor="courseId" className="text-neon-yellow">
                Ders
              </Label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-700 border-neon-blue">
                      <SelectValue placeholder="Ders seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseId && (
                <p className="text-red-500">{errors.courseId.message}</p>
              )}
            </div>
            <div>
              <Label className="text-neon-yellow">Sınıflar</Label>
              <ScrollArea className="h-[200px] w-full rounded-md border border-neon-purple p-4">
                <Controller
                  name="classIds"
                  control={control}
                  render={({ field }) => (
                    <>
                      {classes.map((classItem) => (
                        <div
                          key={classItem._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={classItem._id}
                            checked={field.value.includes(classItem._id)}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...field.value, classItem._id]
                                : field.value.filter(
                                    (id: string) => id !== classItem._id
                                  );
                              field.onChange(updatedValue);
                            }}
                            className="border-neon-pink"
                          />
                          <label
                            htmlFor={classItem._id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {classItem.grade}-{classItem.section}
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                />
              </ScrollArea>
              {errors.classIds && (
                <p className="text-red-500">{errors.classIds.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-purple hover:bg-neon-pink transition-colors"
            >
              {editingTeacher ? "Güncelle" : "Ekle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Öğretmen Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Öğretmen Adı</TableHead>
                <TableHead className="text-neon-purple">E-posta</TableHead>
                <TableHead className="text-neon-yellow">Ders</TableHead>
                <TableHead className="text-neon-green">Sınıflar</TableHead>
                <TableHead className="text-neon-orange">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    {courses.find((c) => c._id === teacher.courseId)?.name ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    {teacher.classIds
                      .map((id) => {
                        const classItem = classes.find((c) => c._id === id);
                        return classItem
                          ? `${classItem.grade}-${classItem.section} `
                          : "";
                      })
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEdit(teacher)}
                      className="mr-2 bg-neon-blue hover:bg-neon-purple transition-colors"
                    >
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => handleDelete(teacher._id)}
                      className="bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Sil
                    </Button>
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
