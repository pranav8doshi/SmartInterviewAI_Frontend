"use client"
import { Button } from "@/components/ui/button"
import { Copy, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function MeetingInfo({
  isOpen,
  onClose,
  meetingId,
}: { isOpen: boolean; onClose: () => void; meetingId: string }) {
  const { toast } = useToast()

  const copyMeetingInfo = () => {
    navigator.clipboard.writeText(`https://meet.example.com/${meetingId}`)
    toast({
      description: "Meeting link copied to clipboard",
    })
  }

  if (!isOpen) return null

  return (
    <div className="w-[350px] bg-white text-black flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium">Meeting details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Joining info</h3>
        <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between">
          <span className="text-sm">https://meet.example.com/{meetingId}</span>
          <Button variant="ghost" size="icon" onClick={copyMeetingInfo}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 mt-4">
        <p className="text-sm text-gray-500">Google Calendar attachments will be shown here</p>
      </div>
    </div>
  )
}

