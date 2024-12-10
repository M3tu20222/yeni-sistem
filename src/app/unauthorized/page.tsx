import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <Card className="w-full max-w-md border-2 border-neon-red bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-neon-red flex items-center justify-center">
            <AlertTriangle className="mr-2" />
            Yetkisiz Erişim
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-white">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <Button asChild className="bg-neon-blue hover:bg-neon-purple">
            <Link href="/dashboard">Ana Sayfaya Dön</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

