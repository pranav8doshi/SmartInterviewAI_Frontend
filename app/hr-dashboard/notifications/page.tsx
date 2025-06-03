"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  isNew?: boolean
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(10))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedNotifications.push({
          id: doc.id,
          type: data.type,
          message: data.message,
          timestamp: data.timestamp.toDate().toLocaleString(),
          isNew: data.timestamp.toDate() > new Date(user.metadata.lastLoginAt),
        })
      })
      setNotifications(fetchedNotifications)
    })

    // Fetch system-wide messages
    const systemMessagesQuery = query(collection(db, "systemMessages"), orderBy("timestamp", "desc"), limit(5))

    const systemMessagesUnsubscribe = onSnapshot(systemMessagesQuery, (querySnapshot) => {
      const systemMessages: Notification[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        systemMessages.push({
          id: doc.id,
          type: "System Message",
          message: `${data.title}: ${data.content}`,
          timestamp: data.timestamp,
          isNew: true,
        })
      })
      setNotifications((prev) => [...prev, ...systemMessages])
    })

    return () => {
      unsubscribe()
      systemMessagesUnsubscribe()
    }
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Notifications & Alerts</h2>
      {notifications.map((notification) => (
        <Card key={notification.id} className={`mb-4 ${notification.isNew ? "border-yellow-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className={`w-5 h-5 mr-2 ${notification.isNew ? "text-yellow-500" : ""}`} />
              {notification.type}
              {notification.isNew && (
                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">New</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{notification.message}</p>
            <p className="text-sm text-gray-500 mt-2">{notification.timestamp}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

