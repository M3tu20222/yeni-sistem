"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminPanel() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', role: 'manager' })
  const router = useRouter()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const res = await fetch('/api/admin')
    const data = await res.json()
    setAdmins(data)
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin),
    })
    setNewAdmin({ username: '', email: '', password: '', role: 'manager' })
    fetchAdmins()
  }

  const handleDeleteAdmin = async (id: string) => {
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAdmins()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <Card className="mb-8 border-2 border-neon-purple bg-slate-800/50 shadow-lg shadow-neon-purple/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
            Admin Paneli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <Input
              type="text"
              placeholder="Kullanıcı Adı"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              className="bg-slate-700 border-neon-blue"
            />
            <Input
              type="email"
              placeholder="E-posta"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="bg-slate-700 border-neon-pink"
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="bg-slate-700 border-neon-purple"
            />
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              className="w-full p-2 bg-slate-700 border-2 border-neon-yellow rounded"
            >
              <option value="manager">Yönetici</option>
              <option value="super">Süper Admin</option>
            </select>
            <Button type="submit" className="w-full bg-neon-blue hover:bg-neon-purple transition-colors">
              Yeni Admin Ekle
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50 shadow-lg shadow-neon-blue/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-neon-blue">
            Admin Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-pink">Kullanıcı Adı</TableHead>
                <TableHead className="text-neon-blue">E-posta</TableHead>
                <TableHead className="text-neon-purple">Rol</TableHead>
                <TableHead className="text-neon-yellow">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role === 'super' ? 'Süper Admin' : 'Yönetici'}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteAdmin(admin._id)}
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

