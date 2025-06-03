"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Mic, MicOff, Video, VideoOff } from "lucide-react"

interface Participant {
  id: string
  name: string
  isUser: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  role?: string
}

interface ParticipantsPanelProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  isMicOn: boolean
  isCameraOn: boolean
  onToggleMic: () => void
  onToggleCamera: () => void
}

export function ParticipantsPanel({
  isOpen,
  onClose,
  userName,
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
}: ParticipantsPanelProps) {
  const participants: Participant[] = [
    {
      id: "user",
      name: userName,
      isUser: true,
      audioEnabled: isMicOn,
      videoEnabled: isCameraOn,
      role: "Candidate",
    },
    {
      id: "ai",
      name: "InterviewAI Assistant",
      isUser: false,
      audioEnabled: true,
      videoEnabled: true,
      role: "Interviewer",
    },
  ]

  if (!isOpen) return null

  return (
    <div className="w-80 bg-white text-black flex flex-col h-full border-l">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium">Participants (2)</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    participant.isUser ? "bg-[#19A5A2]" : "bg-blue-600"
                  }`}
                >
                  {participant.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {participant.name}
                    {participant.isUser && <span className="text-xs text-gray-500"> (You)</span>}
                  </p>
                  <p className="text-xs text-gray-500">{participant.role}</p>
                </div>
              </div>

              {participant.isUser ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onToggleMic} className={!isMicOn ? "text-red-500" : ""}>
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCamera}
                    className={!isCameraOn ? "text-red-500" : ""}
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

