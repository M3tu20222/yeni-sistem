'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function SessionContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}

