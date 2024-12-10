"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface Homework {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  submitted: boolean;
}

export default function StudentHomeworkPage() {
  const { data: session } = useSession();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const response = await fetch("/api/student/homework");
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

  const handleSubmit = async (homeworkId: string) => {
    try {
      const response = await fetch(
        `/api/student/homework/${homeworkId}/submit`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ödev başarıyla teslim edildi.",
        });
        fetchHomeworks();
      } else {
        toast({
          title: "Hata",
          description: "Ödev teslim edilirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ödev teslim edilirken hata:", error);
      toast({
        title: "Hata",
        description: "Ödev teslim edilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Ödevlerim
      </h1>

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
                <TableHead className="text-neon-purple">Açıklama</TableHead>
                <TableHead className="text-neon-yellow">
                  Teslim Tarihi
                </TableHead>
                <TableHead className="text-neon-green">Durum</TableHead>
                <TableHead className="text-neon-orange">İşlem</TableHead>
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
                    {homework.description}
                  </TableCell>
                  <TableCell className="text-neon-yellow">
                    {format(new Date(homework.dueDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-neon-green">
                    {homework.submitted ? "Teslim Edildi" : "Bekliyor"}
                  </TableCell>
                  <TableCell>
                    {!homework.submitted && (
                      <Button
                        onClick={() => handleSubmit(homework._id)}
                        className="bg-neon-purple hover:bg-neon-pink text-white transition-colors"
                      >
                        Teslim Et
                      </Button>
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
