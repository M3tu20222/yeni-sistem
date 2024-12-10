"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { format } from 'date-fns'

interface Grade {
  value: number
  date: string
}

interface GradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (value: number) => void
  studentName: string
  grades: Grade[]
}

export function GradeModal({ isOpen, onClose, onSave, studentName, grades }: GradeModalProps) {
  const [newGrade, setNewGrade] = useState(0)

  // Prepare chart data
  const chartData = grades.map((grade) => ({
    Puan: grade.value,
    Tarih: format(new Date(grade.date), 'dd/MM/yyyy'),
  }))

  const handleSave = () => {
    onSave(newGrade)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span className="text-white">{studentName}&apos;s Not Detayları</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="Tarih" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Puan" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="Tarih" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Puan" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Not</span>
              <span>{newGrade}</span>
            </div>
            <Slider
              value={[newGrade]}
              onValueChange={(value) => setNewGrade(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave} className="w-24">
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

