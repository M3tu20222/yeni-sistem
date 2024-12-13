"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trophy, Award } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  studentNo: string;
  points: number;
  badges: string[];
}

interface Badge {
  _id: string;
  name: string;
  description: string;
}

export default function TeacherGamificationPage() {
  useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  useEffect(() => {
    fetchStudents();
    fetchBadges();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast({
          title: "Hata",
          description: "Öğrenciler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Öğrenciler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/badges");
      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      } else {
        toast({
          title: "Hata",
          description: "Rozetler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Rozetler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Rozetler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAddPoints = async () => {
    if (!selectedStudent || pointsToAdd <= 0) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pointsToAdd }),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Puanlar başarıyla eklendi.",
        });
        fetchStudents();
        setPointsToAdd(0);
      } else {
        toast({
          title: "Hata",
          description: "Puanlar eklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Puan ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Puanlar eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAddBadge = async () => {
    if (!selectedStudent || !selectedBadge) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: selectedBadge }),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Rozet başarıyla eklendi.",
        });
        fetchStudents();
        setSelectedBadge("");
      } else {
        toast({
          title: "Hata",
          description: "Rozet eklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Rozet ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Rozet eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Oyunlaştırma Yönetimi
      </h1>

      <Card className="border-2 border-neon-purple bg-slate-800/50 shadow-lg shadow-neon-purple/20 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue flex items-center">
            <Trophy className="mr-2" /> Puan ve Rozet Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="student-select"
                className="block text-sm font-medium text-neon-pink mb-2"
              >
                Öğrenci Seç
              </label>
              <Select
                onValueChange={setSelectedStudent}
                value={selectedStudent}
              >
                <SelectTrigger
                  id="student-select"
                  className="bg-slate-700 border-neon-blue"
                >
                  <SelectValue placeholder="Öğrenci seçin" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="points-input"
                className="block text-sm font-medium text-neon-yellow mb-2"
              >
                Eklenecek Puan
              </label>
              <Input
                id="points-input"
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(Number(e.target.value))}
                className="bg-slate-700 border-neon-yellow"
              />
            </div>
          </div>
          <Button
            onClick={handleAddPoints}
            className="w-full bg-neon-green hover:bg-neon-blue text-white transition-colors mb-4"
          >
            Puan Ekle
          </Button>
          <div className="mb-4">
            <label
              htmlFor="badge-select"
              className="block text-sm font-medium text-neon-purple mb-2"
            >
              Rozet Seç
            </label>
            <Select onValueChange={setSelectedBadge} value={selectedBadge}>
              <SelectTrigger
                id="badge-select"
                className="bg-slate-700 border-neon-purple"
              >
                <SelectValue placeholder="Rozet seçin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-neon-purple">
                {badges.map((badge) => (
                  <SelectItem
                    key={badge._id}
                    value={badge._id}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {badge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddBadge}
            className="w-full bg-neon-purple hover:bg-neon-pink text-white transition-colors"
          >
            Rozet Ekle
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50 shadow-lg shadow-neon-blue/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink flex items-center">
            <Award className="mr-2" /> Öğrenci Puanları ve Rozetleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neon-blue">Öğrenci Adı</TableHead>
                <TableHead className="text-neon-yellow">Öğrenci No</TableHead>
                <TableHead className="text-neon-green">Toplam Puan</TableHead>
                <TableHead className="text-neon-purple">Rozetler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentNo}</TableCell>
                  <TableCell>{student.points}</TableCell>
                  <TableCell>
                    {student.badges && student.badges.length > 0 ? (
                      student.badges.map((badgeId) => {
                        const badge = badges.find((b) => b._id === badgeId);
                        return badge ? (
                          <span
                            key={badgeId}
                            className="inline-block bg-neon-purple text-white text-xs px-2 py-1 rounded-full mr-1 mb-1"
                          >
                            {badge.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-slate-500">No badges</span>
                    )}
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
