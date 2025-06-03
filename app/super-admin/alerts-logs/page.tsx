"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, addDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface SystemLog {
  id: string
  type: string
  message: string
  timestamp: string
}

export default function AlertsLogs() {
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [message, setMessage] = useState({ title: "", content: "" })
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "systemLogs"), orderBy("timestamp", "desc"), limit(10))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: SystemLog[] = []
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as SystemLog)
      })
      setSystemLogs(logs)
    })

    return () => unsubscribe()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "systemMessages"), {
        ...message,
        timestamp: new Date().toISOString(),
      })

      // Add to system logs
      await addDoc(collection(db, "systemLogs"), {
        type: "Info",
        message: `System-wide message sent: ${message.title}`,
        timestamp: new Date().toISOString(),
      })

      toast({ title: "Success", description: "System-wide message sent successfully." })
      setMessage({ title: "", content: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to send system-wide message.", variant: "destructive" })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage Alerts & Logs</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Send System-wide Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <Label htmlFor="message-title">Message Title</Label>
              <Input
                id="message-title"
                value={message.title}
                onChange={(e) => setMessage((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter message title"
              />
            </div>
            <div>
              <Label htmlFor="message-content">Message Content</Label>
              <Textarea
                id="message-content"
                value={message.content}
                onChange={(e) => setMessage((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message here"
              />
            </div>
            <Button type="submit" className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

