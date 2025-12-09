"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  CalendarIcon,
  UsersIcon,
  TrophyIcon,
  CoinsIcon,
  SwordIcon,
  ShieldIcon
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ModeToggle />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Lost Ark 副本日程表
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            專為 Lost Ark 玩家設計的副本排程管理系統，支援即時協作、收益追蹤、角色管理等功能
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                排程管理
              </CardTitle>
              <CardDescription>
                週四到週三的遊戲週期排程，智能衝突檢測
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/dashboard/schedule">查看排程</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                角色管理
              </CardTitle>
              <CardDescription>
                多角色管理，職業分工，裝等追蹤
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/dashboard/characters">管理角色</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CoinsIcon className="h-5 w-5" />
                收益分析
              </CardTitle>
              <CardDescription>
                活金/綁金收益追蹤，成本效益分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/dashboard/economics">查看收益</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 副本類型展示 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">支援副本類型</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="raid-celestial">
              <CardHeader className="text-center">
                <TrophyIcon className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>天界</CardTitle>
              </CardHeader>
            </Card>

            <Card className="raid-dream">
              <CardHeader className="text-center">
                <SwordIcon className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>夢幻</CardTitle>
              </CardHeader>
            </Card>

            <Card className="raid-ivory-tower">
              <CardHeader className="text-center">
                <ShieldIcon className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>象牙塔</CardTitle>
              </CardHeader>
            </Card>

            <Card className="raid-plague">
              <CardHeader className="text-center">
                <TrophyIcon className="h-8 w-8 mx-auto mb-2" />
                <CardTitle>瘟疫</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* 進入控制台按鈕 */}
        <div className="text-center mb-12">
          <Button size="lg" asChild>
            <a href="/dashboard">
              進入控制台
            </a>
          </Button>
        </div>

        {/* 功能特色 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">系統特色</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="font-semibold mb-2">📊 數據整合</h3>
              <p className="text-muted-foreground">
                完美承接 Excel 數據結構，支援匯入匯出
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚡ 即時協作</h3>
              <p className="text-muted-foreground">
                多人同時編輯，即時狀態同步
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎯 智能排程</h3>
              <p className="text-muted-foreground">
                自動人員配置，衝突檢測
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}