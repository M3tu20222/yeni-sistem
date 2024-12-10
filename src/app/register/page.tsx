"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  subject: z.string().min(1, "Lütfen bir ders seçiniz"),
  role: z.enum(['manager', 'super']).default('manager'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'manager'
    }
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (err) {
      setError('Sunucu hatası')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <Card className="w-full max-w-md border-2 border-neon-purple bg-slate-900/50 shadow-[0_0_15px_rgba(157,0,255,0.5)] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
            Kayıt Ol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neon-blue">İsim</Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neon-pink">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neon-yellow">Şifre</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors"
              />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-neon-blue">Ders</Label>
              <Select {...register("subject")}>
                <SelectTrigger className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors">
                  <SelectValue placeholder="Ders seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Türkçe">Türkçe</SelectItem>
                  <SelectItem value="Matematik">Matematik</SelectItem>
                  <SelectItem value="Sosyal Bilgiler">Sosyal Bilgiler</SelectItem>
                  <SelectItem value="Din Kültürü">Din Kültürü</SelectItem>
                  <SelectItem value="Fen ve Teknoloji">Fen ve Teknoloji</SelectItem>
                  <SelectItem value="İngilizce">İngilizce</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-red-500">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-neon-yellow">Rol</Label>
              <Select {...register("role")} defaultValue="manager">
                <SelectTrigger className="bg-slate-800/50 border-2 border-neon-purple focus:border-neon-pink transition-colors">
                  <SelectValue placeholder="Rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super">Super</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500">{errors.role.message}</p>}
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-neon-purple hover:bg-neon-pink text-white transition-all duration-300 shadow-lg hover:shadow-neon-pink/50">
              Kayıt Ol
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

