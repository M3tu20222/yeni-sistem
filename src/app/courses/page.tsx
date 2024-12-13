"use client"

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const courseSchema = z.object({
  name: z.string().min(1, "Ders adı boş olamaz"),
  classIds: z.array(z.string()).min(1, "En az bir sınıf seçilmelidir")
})

type CourseForm = z.infer<typeof courseSchema>

interface Course {
  _id: string
  name: string
  classIds: string[]
}

interface Class {
  _id: string
  grade: number
  section: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      classIds: []
    }
  })

  useEffect(() => {
    fetchCourses()
    fetchClasses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        toast({
          title: "Hata",
          description: "Dersler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Dersler yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Dersler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        toast({
          title: "Hata",
          description: "Sınıflar yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Sınıflar yüklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Sınıflar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: CourseForm) => {
    try {
      const url = editingCourse ? `/api/courses` : '/api/courses'
      const method = editingCourse ? 'PUT' : 'POST'
      const body = editingCourse ? JSON.stringify({ ...data, id: editingCourse._id }) : JSON.stringify(data)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: `Ders başarıyla ${editingCourse ? 'güncellendi' : 'oluşturuldu'}.`,
        })
        fetchCourses()
        reset()
        setEditingCourse(null)
      } else {
        const errorData = await response.json()
        toast({
          title: "Hata",
          description: errorData.error || `Ders ${editingCourse ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Ders kaydedilirken hata:', error)
      toast({
        title: "Hata",
        description: `Ders ${editingCourse ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu.`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/courses`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        if (response.ok) {
          toast({
            title: "Başarılı",
            description: "Ders başarıyla silindi.",
          })
          fetchCourses()
        } else {
          toast({
            title: "Hata",
            description: "Ders silinirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Ders silinirken hata:', error)
        toast({
          title: "Hata",
          description: "Ders silinirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setValue("name", course.name)
    setValue("classIds", course.classIds)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Ders Yönetimi
      </h1>

      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue">
            {editingCourse ? 'Ders Düzenle' : 'Yeni Ders Ekle'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-neon-pink">Ders Adı</Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-slate-700 border-neon-blue"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
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
                        <div key={classItem._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={classItem._id}
                            checked={field.value.includes(classItem._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, classItem._id])
                              } else {
                                field.onChange(field.value.filter((id) => id !== classItem._id))
                              }
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
              {errors.classIds && <p className="text-red-500">{errors.classIds.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-neon-purple hover:bg-neon-pink transition-colors">
              {editingCourse ? 'Güncelle' : 'Ekle'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">Ders Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Ders Adı</TableHead>
                <TableHead className="text-neon-purple">Sınıflar</TableHead>
                <TableHead className="text-neon-yellow">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>
                    {course.classIds.map(id => {
                      const classItem = classes.find(c => c._id === id)
                      return classItem ? `${classItem.grade}-${classItem.section} ` : ''
                    }).join(', ')}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEdit(course)}
                      className="mr-2 bg-neon-blue hover:bg-neon-purple transition-colors"
                    >
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => handleDelete(course._id)}
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
  )
}

