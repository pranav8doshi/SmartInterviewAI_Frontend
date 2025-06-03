"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"

const reactions = ["👍", "👏", "❤️", "🎉", "😊", "👋"]

export function ReactionsMenu({ onReaction }: { onReaction: (reaction: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <SmilePlus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {reactions.map((reaction) => (
            <Button
              key={reaction}
              variant="ghost"
              className="text-2xl p-2 h-auto hover:bg-accent"
              onClick={() => onReaction(reaction)}
            >
              {reaction}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

