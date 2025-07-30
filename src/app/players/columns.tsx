"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Player = {
  id: string
  nickname: string
  itemLevel: number
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "nickname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          暱稱
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "itemLevel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          裝等
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "monday",
    header: "週一",
  },
  {
    accessorKey: "tuesday",
    header: "週二",
  },
  {
    accessorKey: "wednesday",
    header: "週三",
  },
  {
    accessorKey: "thursday",
    header: "週四",
  },
  {
    accessorKey: "friday",
    header: "週五",
  },
  {
    accessorKey: "saturday",
    header: "週六",
  },
  {
    accessorKey: "sunday",
    header: "週日",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const player = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">開啟選單</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(player.nickname)}
            >
              複製暱稱
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>編輯玩家資料</DropdownMenuItem>
            <DropdownMenuItem>查看出團記錄</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]