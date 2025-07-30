import { Player, columns } from "./columns"
import { DataTable } from "./data-table"

// 模擬資料，實際應從資料庫取得
async function getData(): Promise<Player[]> {
  return [
    {
      id: "1",
      nickname: "羊",
      itemLevel: 1580,
      monday: "20-24",
      tuesday: "20-24",
      wednesday: "20-24",
      thursday: "20-24",
      friday: "20-24",
      saturday: "15-03",
      sunday: "15-03",
    },
    {
      id: "2",
      nickname: "MC哈豆",
      itemLevel: 1560,
      monday: "19-03",
      tuesday: "19-03",
      wednesday: "19-03",
      thursday: "19-03",
      friday: "19-03",
      saturday: "19-03",
      sunday: "19-03",
    },
    {
      id: "3",
      nickname: "雞頭",
      itemLevel: 1575,
      monday: "22-03",
      tuesday: "22-03",
      wednesday: "22-03",
      thursday: "22-03",
      friday: "22-03",
      saturday: "15-03",
      sunday: "15-01",
    },
    {
      id: "4",
      nickname: "愛冬眠的貓",
      itemLevel: 1590,
      monday: "22:30後",
      tuesday: "22:30後",
      wednesday: "22:30後",
      thursday: "21後",
      friday: "21後",
      saturday: "21後",
      sunday: "21後",
    },
    {
      id: "5",
      nickname: "小蝸",
      itemLevel: 1570,
      monday: "20-00",
      tuesday: "20-00",
      wednesday: "20-00",
      thursday: "20-00",
      friday: "13-00",
      saturday: "13-00",
      sunday: "13-00",
    },
  ]
}

export default async function PlayersPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">玩家管理</h1>
        <p className="text-muted-foreground">
          管理玩家資料與可用時段
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}