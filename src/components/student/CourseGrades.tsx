"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Grade {
  _id: string;
  value: number;
  date: string;
}

interface CourseGradesProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
  grades: Grade[];
  average: number | null;
}

export default function CourseGrades({
  courseName,
  onBack,
  grades,
  average,
}: CourseGradesProps) {
  const chartData = grades
    .map((grade) => ({
      date: format(new Date(grade.date), "dd/MM/yyyy"),
      value: grade.value,
    }))
    .reverse();

  return (
    <Card className="bg-slate-900/90 border-2 border-neon-purple shadow-lg shadow-neon-purple/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-neon-blue pb-4">
        <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
          {courseName} Notları
        </CardTitle>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-8 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#3b82f6",
                }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#d946ef", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-neon-blue">
              <TableHead className="text-neon-pink">Tarih</TableHead>
              <TableHead className="text-neon-yellow">Not</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => (
              <TableRow
                key={grade._id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="text-neon-blue">
                  {format(new Date(grade.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="border-neon-blue text-neon-yellow">
                  {grade.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-6 text-center">
          <p className="text-2xl">
            Ortalama:
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              {average !== null ? average.toFixed(2) : "N/A"}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
