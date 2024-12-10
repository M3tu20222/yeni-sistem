"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Trophy, Award, Book, Users, Star } from "lucide-react";

interface StudentProfile {
  name: string;
  studentNo: string;
  points: number;
  badges: string[];
}

interface BadgeType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchBadges();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/students/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        toast({
          title: "Hata",
          description: "Profil bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profil bilgileri yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu.",
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

  if (!profile) {
    return <div>Yükleniyor...</div>;
  }

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case "trophy":
        return <Trophy className="w-6 h-6" />;
      case "award":
        return <Award className="w-6 h-6" />;
      case "book":
        return <Book className="w-6 h-6" />;
      case "users":
        return <Users className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
        Öğrenci Profili
      </h1>

      <Card className="border-2 border-neon-purple bg-slate-800/50 shadow-lg shadow-neon-purple/20 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-blue flex items-center">
            <Trophy className="mr-2" /> Puan ve Başarılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-neon-pink">
              {profile.name}
            </h2>
            <p className="text-neon-yellow">Öğrenci No: {profile.studentNo}</p>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
            <p className="text-2xl font-bold text-neon-green">
              Toplam Puan: {profile.points}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neon-blue mb-2 flex items-center">
              <Award className="mr-2" /> Kazanılan Rozetler
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges &&
                profile.badges.map((badgeId) => {
                  const badge = badges.find((b) => b._id === badgeId);
                  return badge ? (
                    <Badge
                      key={badge._id}
                      className="bg-neon-purple text-white hover:bg-neon-pink transition-colors flex items-center gap-2 p-2"
                    >
                      {getBadgeIcon(badge.icon)}
                      {badge.name}
                    </Badge>
                  ) : null;
                })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-blue bg-slate-800/50 shadow-lg shadow-neon-blue/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neon-pink">
            Tüm Rozetler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-4"
              >
                <div className="text-neon-yellow">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neon-yellow mb-2">
                    {badge.name}
                  </h4>
                  <p className="text-sm text-slate-300 mb-2">
                    {badge.description}
                  </p>
                  <p className="text-xs text-neon-green">
                    Kriter: {badge.criteria}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
