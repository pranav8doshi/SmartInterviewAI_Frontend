"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, MessageCircle, AlertTriangle } from "lucide-react"
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  isNew?: boolean
}

export default function CandidateNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    // Fetch personal notifications
    const personalNotificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10),
    )

    const personalUnsubscribe = onSnapshot(personalNotificationsQuery, (querySnapshot) => {
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
      setNotifications((prev) =>
        [...prev, ...systemMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      )
    })

    return () => {
      personalUnsubscribe()
      systemMessagesUnsubscribe()
    }
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "System Message":
        return <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
      case "Interview":
        return <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 mr-2 text-green-500" />
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Notifications & Alerts</h2>
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} className={`mb-4 ${notification.isNew ? "border-l-4 border-yellow-500" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                {getNotificationIcon(notification.type)}
                {notification.type}
                {notification.isNew && (
                  <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">New</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{notification.message}</p>
              <p className="text-sm text-gray-500 mt-2">{notification.timestamp}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

