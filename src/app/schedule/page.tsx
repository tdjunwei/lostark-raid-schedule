"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const days = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"] as const
const timeSlots = [
  "13:00-15:00",
  "15:00-18:00", 
  "18:00-20:00",
  "20:00-22:00",
  "22:00-00:00",
  "00:00-03:00",
] as const

type Day = typeof days[number]
type TimeSlot = typeof timeSlots[number]

// 模擬玩家可用性資料
const availability: Record<Day, Partial<Record<TimeSlot, string[]>>> = {
  "週一": {
    "20:00-22:00": ["羊", "MC哈豆", "小蝸"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["MC哈豆", "雞頭"],
  },
  "週二": {
    "20:00-22:00": ["羊", "MC哈豆", "小蝸"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["MC哈豆", "雞頭"],
  },
  "週三": {
    "20:00-22:00": ["羊", "MC哈豆", "小蝸"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["MC哈豆", "雞頭"],
  },
  "週四": {
    "20:00-22:00": ["羊", "MC哈豆", "小蝸"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["MC哈豆", "雞頭"],
  },
  "週五": {
    "13:00-15:00": ["小蝸"],
    "20:00-22:00": ["羊", "MC哈豆"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["MC哈豆", "雞頭"],
  },
  "週六": {
    "13:00-15:00": ["小蝸"],
    "15:00-18:00": ["羊", "雞頭"],
    "18:00-20:00": ["羊", "MC哈豆"],
    "20:00-22:00": ["羊", "MC哈豆", "愛冬眠的貓"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["羊", "MC哈豆", "雞頭"],
  },
  "週日": {
    "13:00-15:00": ["小蝸"],
    "15:00-18:00": ["羊", "雞頭"],
    "18:00-20:00": ["羊", "MC哈豆"],
    "20:00-22:00": ["羊", "MC哈豆", "愛冬眠的貓"],
    "22:00-00:00": ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    "00:00-03:00": ["羊", "MC哈豆"],
  },
}

export default function SchedulePage() {
  const [selectedSlot, setSelectedSlot] = useState<{ day: Day; time: TimeSlot } | null>(null)

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">排程管理</h1>
        <p className="text-muted-foreground">
          查看玩家可用時段並安排團隊
        </p>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">時段總覽</TabsTrigger>
          <TabsTrigger value="raids">副本排程</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <Card>
            <CardHeader>
              <CardTitle>本週可用時段</CardTitle>
              <CardDescription>
                點擊時段查看可參與玩家
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">時段</TableHead>
                      {days.map((day) => (
                        <TableHead key={day} className="text-center min-w-[100px]">
                          {day}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots.map((time) => (
                      <TableRow key={time}>
                        <TableCell className="font-medium">{time}</TableCell>
                        {days.map((day) => {
                          const players = availability[day]?.[time as TimeSlot] || []
                          return (
                            <TableCell
                              key={`${day}-${time}`}
                              className="text-center cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedSlot({ day, time: time as TimeSlot })}
                            >
                              <div className="text-sm">
                                <div className="font-semibold">{players.length}人</div>
                                {players.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    可組團
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedSlot && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedSlot.day} {selectedSlot.time}
                    </CardTitle>
                    <CardDescription>
                      可參與玩家名單
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(availability[selectedSlot.day]?.[selectedSlot.time] || []).map((player: string) => (
                        <div
                          key={player}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raids">
          <Card>
            <CardHeader>
              <CardTitle>副本排程</CardTitle>
              <CardDescription>
                本週已安排的團隊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                尚未排定團隊...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}