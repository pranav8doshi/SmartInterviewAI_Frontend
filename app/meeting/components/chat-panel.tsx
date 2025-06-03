"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X } from "lucide-react"
import type { InterviewMessage } from "@/lib/api-service"

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  conversation: InterviewMessage[]
  onSendMessage: (message: string) => void
  isInterviewActive: boolean
}

export function ChatPanel({
  isOpen,
  onClose,
  userName,
  conversation,
  onSendMessage,
  isInterviewActive,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [conversation])

  if (!isOpen) return null

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isInterviewActive) return

    onSendMessage(newMessage.trim())
    setNewMessage("")
  }

  return (
    <div className="w-80 bg-white text-black flex flex-col h-full border-l">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium">Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversation.map((message, index) => (
            <div key={index} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {message.role === "user" ? userName : "InterviewAI Assistant"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-[#19A5A2] text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isInterviewActive ? "Type your answer..." : "Interview has ended"}
            className="flex-1"
            disabled={!isInterviewActive}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-[#19A5A2] hover:bg-[#19A5A2]/90"
            disabled={!isInterviewActive}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

