"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"

// 模擬天界副本資料
const celestialRaids = [
  {
    id: "1",
    date: "2024-01-29",
    time: "22:00",
    participants: ["羊", "MC哈豆", "雞頭", "愛冬眠的貓", "小蝸", "阿飄", "雅里琴", "焱烽"],
    status: "completed",
    goldReward: 5200,
  },
  {
    id: "2",
    date: "2024-02-01",
    time: "22:00",
    participants: ["羊", "MC哈豆", "雞頭", "愛冬眠的貓"],
    status: "forming",
    goldReward: 5200,
  },
]

export default function CelestialRaidPage() {
  const [raids] = useState(celestialRaids)
  const [selectedRaid, setSelectedRaid] = useState<typeof celestialRaids[0] | null>(null)

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">天界副本</h1>
          <p className="text-muted-foreground">
            管理天界副本團隊
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增團隊
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>團隊列表</CardTitle>
              <CardDescription>
                查看和管理天界副本團隊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>人數</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>金幣獎勵</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raids.map((raid) => (
                    <TableRow
                      key={raid.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRaid(raid)}
                    >
                      <TableCell>{raid.date}</TableCell>
                      <TableCell>{raid.time}</TableCell>
                      <TableCell>{raid.participants.length}/8</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            raid.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {raid.status === "completed" ? "已完成" : "組隊中"}
                        </span>
                      </TableCell>
                      <TableCell>{raid.goldReward}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedRaid ? (
            <Card>
              <CardHeader>
                <CardTitle>團隊詳情</CardTitle>
                <CardDescription>
                  {selectedRaid.date} {selectedRaid.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">參與成員</h4>
                    <div className="space-y-2">
                      {selectedRaid.participants.map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span>{player}</span>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRaid.participants.length < 8 && (
                    <div className="flex gap-2">
                      <Input placeholder="新增玩家" />
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>總金幣獎勵</span>
                      <span className="font-medium">{selectedRaid.goldReward}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>每人獲得</span>
                      <span className="font-medium">
                        {Math.floor(selectedRaid.goldReward / selectedRaid.participants.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>選擇團隊</CardTitle>
                <CardDescription>
                  點擊左側列表查看團隊詳情
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}