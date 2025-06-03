import type React from "react"
import Link from "next/link"
import { BarChart, Bell, Users, UserCog, Video, Settings, Activity } from "lucide-react"

const sidebarItems = [
  { icon: Activity, label: "Dashboard", href: "/super-admin" },
  { icon: Users, label: "HR & Candidate Activities", href: "/super-admin/activities" },
  { icon: UserCog, label: "Manage HR Accounts", href: "/super-admin/manage-hr" },
  { icon: Video, label: "Monitor Interviews", href: "/super-admin/monitor-interviews" },
  { icon: BarChart, label: "Analytics & Reports", href: "/super-admin/analytics" },
  { icon: Settings, label: "System Settings", href: "/super-admin/settings" },
  { icon: Bell, label: "Alerts & Logs", href: "/super-admin/alerts-logs" },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B2A4E] text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">InterviewAI Admin</h1>
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

