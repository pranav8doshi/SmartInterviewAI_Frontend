"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Maximize2, RepeatIcon as Record, PictureInPicture, Settings } from "lucide-react"

export function MoreOptionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Record className="mr-2 h-4 w-4" />
          Start recording
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Maximize2 className="mr-2 h-4 w-4" />
          Enter full screen
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PictureInPicture className="mr-2 h-4 w-4" />
          Open in picture-in-picture
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

