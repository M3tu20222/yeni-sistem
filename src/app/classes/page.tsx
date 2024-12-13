"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { ArrowUpDown } from "lucide-react";

const classSchema = z.object({
  grade: z.number().min(5).max(8),
  section: z
    .string()
    .length(1)
    .regex(/^[A-Z]$/),
});

type ClassForm = z.infer<typeof classSchema>;

interface Class {
  _id: string;
  grade: number;
  section: string;
}

type SortField = "grade" | "section";
type SortOrder = "asc" | "desc";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [sortField, setSortField] = useState<SortField>("grade");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassForm>({
    resolver: zodResolver(classSchema),
  });
const { toast } = useToast();

const fetchClasses = useCallback(async () => {
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
}, [toast]);

useEffect(() => {
  fetchClasses();
}, [fetchClasses]);


  const onSubmit = async (data: ClassForm) => {
    const url = editingClass ? `/api/classes` : "/api/classes";
    const method = editingClass ? "PUT" : "POST";
    const body = editingClass
      ? JSON.stringify({ ...data, id: editingClass._id })
      : JSON.stringify(data);

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "include",
    });

    if (response.ok) {
      toast({
        title: "Başarılı",
        description: `Sınıf başarıyla ${
          editingClass ? "güncellendi" : "oluşturuldu"
        }.`,
      });
      fetchClasses();
      reset();
      setEditingClass(null);
    } else {
      const errorData = await response.json();
      toast({
        title: "Hata",
        description:
          errorData.error ||
          `Sınıf ${
            editingClass ? "güncellenirken" : "oluşturulurken"
          } bir hata oluştu.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu sınıfı silmek istediğinizden emin misiniz?")) {
      const response = await fetch(`/api/classes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Sınıf başarıyla silindi.",
        });
        fetchClasses();
      } else {
        toast({
          title: "Hata",
          description: "Sınıf silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    if (sortField === "grade") {
      return sortOrder === "asc" ? a.grade - b.grade : b.grade - a.grade;
    } else if (sortField === "section") {
      return sortOrder === "asc"
        ? a.section.localeCompare(b.section)
        : b.section.localeCompare(a.section);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Sınıf Yönetimi
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            {editingClass ? "Sınıf Düzenle" : "Yeni Sınıf Ekle"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="grade" className="text-neon-pink">
                  Sınıf
                </Label>
                <Input
                  id="grade"
                  type="number"
                  {...register("grade", { valueAsNumber: true })}
                  defaultValue={editingClass?.grade}
                  className="bg-slate-700 border-neon-blue"
                />
                {errors.grade && (
                  <p className="text-red-500">{errors.grade.message}</p>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="section" className="text-neon-yellow">
                  Şube
                </Label>
                <Input
                  id="section"
                  {...register("section")}
                  defaultValue={editingClass?.section}
                  className="bg-slate-700 border-neon-pink uppercase"
                  maxLength={1}
                />
                {errors.section && (
                  <p className="text-red-500">{errors.section.message}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-neon-purple hover:bg-neon-pink transition-colors"
            >
              {editingClass ? "Güncelle" : "Ekle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Sınıf Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="text-neon-purple cursor-pointer"
                  onClick={() => handleSort("grade")}
                >
                  Sınıf <ArrowUpDown className="inline ml-2" />
                </TableHead>
                <TableHead
                  className="text-neon-pink cursor-pointer"
                  onClick={() => handleSort("section")}
                >
                  Şube <ArrowUpDown className="inline ml-2" />
                </TableHead>
                <TableHead className="text-neon-yellow">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClasses.map((classItem) => (
                <TableRow key={classItem._id}>
                  <TableCell>{classItem.grade}</TableCell>
                  <TableCell>{classItem.section}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setEditingClass(classItem)}
                      className="mr-2 bg-neon-blue hover:bg-neon-purple transition-colors"
                    >
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => handleDelete(classItem._id)}
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
