import { Button } from "@/components/ui/button"
import Link from "next/link"
import SessionContent from "@/components/SessionContent"

export default function Home() {
  return (
    <SessionContent>
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Yeni Sistem
        </h1>
        <p className="text-xl mb-8 text-slate-300">
          Cyberpunk Neon temalı okul yönetim sistemi
        </p>
        <div className="flex space-x-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="text-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white">
            <Link href="/classes">Sınıflar</Link>
          </Button>
        </div>
      </main>
    </SessionContent>
  )
}

