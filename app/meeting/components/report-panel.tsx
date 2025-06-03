"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Download } from "lucide-react"
import type { InterviewMessage } from "@/lib/api-service"

interface ReportPanelProps {
  isOpen: boolean
  onClose: () => void
  conversation: InterviewMessage[]
  jobRole: string
}

export function ReportPanel({ isOpen, onClose, conversation, jobRole }: ReportPanelProps) {
  if (!isOpen) return null

  const handleDownload = () => {
    // Create a text version of the conversation
    const text = conversation
      .map((msg) => `${msg.role === "user" ? "You" : "InterviewAI"}: ${msg.content}`)
      .join("\n\n")

    // Create a blob and download link
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-transcript-${jobRole}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-80 bg-white text-black flex flex-col h-full border-l">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium">Interview Report</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-medium">Job Role: {jobRole}</h3>
        <p className="text-sm text-gray-600 mt-1">
          This report shows the conversation between you and the AI interviewer.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full flex items-center justify-center"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Transcript
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {conversation.map((message, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{message.role === "user" ? "You" : "InterviewAI Assistant"}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <p className="text-sm text-gray-500">
          Note: The interview results will be available in your dashboard after the interview is completed.
        </p>
      </div>
    </div>
  )
}

