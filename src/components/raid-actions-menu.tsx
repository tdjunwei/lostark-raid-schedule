"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff
} from "lucide-react"
import { useState } from "react"

export function RaidActionsMenu() {
  const [showCompleted, setShowCompleted] = useState(true)
  const [sortBy, setSortBy] = useState("date")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4" />
          操作選單
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>團隊操作</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Plus className="mr-2 h-4 w-4" />
          <span>建立新團隊</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>編輯排程</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Users className="mr-2 h-4 w-4" />
          <span>管理成員</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Calendar className="mr-2 h-4 w-4" />
          <span>查看行事曆</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <span>篩選選項</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            >
              <Eye className="mr-2 h-4 w-4" />
              顯示已完成
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem>
              <EyeOff className="mr-2 h-4 w-4" />
              隱藏過期團隊
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              顯示欄位
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SortAsc className="mr-2 h-4 w-4" />
            <span>排序方式</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="date">
                <Calendar className="mr-2 h-4 w-4" />
                依日期排序
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="level">
                <SortDesc className="mr-2 h-4 w-4" />
                依裝等排序
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">
                <SortAsc className="mr-2 h-4 w-4" />
                依名稱排序
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>團隊設定</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>刪除團隊</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}