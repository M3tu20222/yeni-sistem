"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const homeworkSchema = z.object({
  title: z.string().min(1, "Başlık boş olamaz"),
  description: z.string().min(1, "Açıklama boş olamaz"),
  classId: z.string().min(1, "Sınıf seçmelisiniz"),
  dueDate: z.string().min(1, "Teslim tarihi seçmelisiniz"),
});

type HomeworkForm = z.infer<typeof homeworkSchema>;

interface Homework {
  _id: string;
  title: string;
  description: string;
  classId: string;
  dueDate: string;
  className: string;
  submissions: {
    studentId: string;
    submittedAt: string;
    status: "submitted" | "late";
  }[];
}

interface Class {
  _id: string;
  name: string;
  grade: string;
  section: string;
}

export default function TeacherHomeworkPage() {
  useSession();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HomeworkForm>({
    resolver: zodResolver(homeworkSchema),
  });

  useEffect(() => {
    fetchHomeworks();
    fetchClasses();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const response = await fetch("/api/teacher/homework");
      if (response.ok) {
        const data = await response.json();
        setHomeworks(data);
      } else {
        toast({
          title: "Hata",
          description: "Ödevler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ödevler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Ödevler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
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

  const onSubmit = async (data: HomeworkForm) => {
    try {
      const response = await fetch("/api/teacher/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ödev başarıyla oluşturuldu.",
        });
        fetchHomeworks();
        reset();
      } else {
        toast({
          title: "Hata",
          description: "Ödev oluşturulurken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ödev oluşturulurken hata:", error);
      toast({
        title: "Hata",
        description: "Ödev oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Ödev Yönetimi
      </h1>

      <Card className="border-2 border-neon-purple bg-slate-800/50 shadow-lg shadow-neon-purple/20 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            Yeni Ödev Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Ödev Başlığı"
                {...register("title")}
                className="bg-slate-700 border-neon-blue text-white"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="Ödev Açıklaması"
                {...register("description")}
                className="bg-slate-700 border-neon-blue text-white"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Controller
                name="classId"
                control={control}
                rules={{ required: "Sınıf seçmelisiniz" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-700 border-neon-blue text-white">
                      <SelectValue placeholder="Sınıf Seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-neon-blue">
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
                )}
              />
              {errors.classId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.classId.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="date"
                {...register("dueDate")}
                className="bg-slate-700 border-neon-blue text-white"
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-purple hover:bg-neon-pink text-white transition-colors"
            >
              Ödev Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50 shadow-lg shadow-neon-blue/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Ödev Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neon-purple">
                <TableHead className="text-neon-blue">Başlık</TableHead>
                <TableHead className="text-neon-purple">Sınıf</TableHead>
                <TableHead className="text-neon-yellow">
                  Teslim Tarihi
                </TableHead>
                <TableHead className="text-neon-green">
                  Teslim Edilenler
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homeworks.map((homework) => (
                <TableRow
                  key={homework._id}
                  className="border-b border-neon-purple/30 hover:bg-neon-purple/10 transition-colors"
                >
                  <TableCell className="font-medium text-neon-blue">
                    {homework.title}
                  </TableCell>
                  <TableCell className="text-neon-pink">
                    {homework.className}
                  </TableCell>
                  <TableCell className="text-neon-yellow">
                    {format(new Date(homework.dueDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-neon-green">
                    {homework.submissions.length}
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
