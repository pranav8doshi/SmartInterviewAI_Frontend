"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Bell, FileText, Home, Settings, Clock, Users, Video, PlusCircle } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

// Update the sidebarItems array to include the Question Bank
const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/hr-dashboard" },
  { icon: Users, label: "Candidate Applications", href: "/hr-dashboard/applications" },
  { icon: Video, label: "Conduct Interviews", href: "/hr-dashboard/conduct" },
  { icon: BarChart, label: "Rate & Feedback", href: "/hr-dashboard/feedback" },
  { icon: Clock, label: "Interview Status", href: "/hr-dashboard/status" },
  { icon: FileText, label: "Candidate History", href: "/hr-dashboard/history" },
  { icon: Bell, label: "Notifications", href: "/hr-dashboard/notifications" },
  // Add the Question Bank item
  { icon: FileText, label: "Question Bank", href: "/hr-dashboard/question-bank" },
  { icon: PlusCircle, label: "Add Job Role", href: "/hr-dashboard/add-job-role" },
  { icon: Settings, label: "Settings", href: "/hr-dashboard/settings" },
]

export default function HRDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "hr", user.uid))
        if (userDoc.exists()) {
          setUserEmail(user.email)
        } else {
          // If the user is not an HR, redirect to the appropriate dashboard
          const studentDoc = await getDoc(doc(db, "students", user.uid))
          if (studentDoc.exists()) {
            router.push("/dashboard")
          } else {
            const adminDoc = await getDoc(doc(db, "superAdmin", user.uid))
            if (adminDoc.exists()) {
              router.push("/super-admin")
            } else {
              // If the user doesn't exist in any collection, sign them out
              auth.signOut()
              router.push("/login/hr")
            }
          }
        }
      } else {
        router.push("/login/hr")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B2A4E] text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">InterviewAI HR</h1>
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

