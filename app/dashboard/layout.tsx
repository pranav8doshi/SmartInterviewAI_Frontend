"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Bell, Calendar, FileText, Home, Settings, User, Clock } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Apply for Interview", href: "/dashboard/apply" },
  { icon: Calendar, label: "Interview Schedule", href: "/dashboard/schedule" },
  { icon: BarChart, label: "Feedback & Results", href: "/dashboard/feedback" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Clock, label: "Interview History", href: "/dashboard/history" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "students", user.uid))
        if (userDoc.exists()) {
          setUserEmail(user.email)
        } else {
          // If the user is not a student, redirect to the appropriate dashboard
          const hrDoc = await getDoc(doc(db, "hr", user.uid))
          if (hrDoc.exists()) {
            router.push("/hr-dashboard")
          } else {
            const adminDoc = await getDoc(doc(db, "superAdmin", user.uid))
            if (adminDoc.exists()) {
              router.push("/super-admin")
            } else {
              // If the user doesn't exist in any collection, sign them out
              auth.signOut()
              router.push("/login/student")
            }
          }
        }
      } else {
        router.push("/login/student")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B2A4E] text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">InterviewAI</h1>
          {userEmail && <p className="text-sm mt-2 text-gray-300">Logged in as: {userEmail}</p>}
        </div>
        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-[#19A5A2]/50"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

