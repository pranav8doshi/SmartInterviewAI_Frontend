"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bell, Calendar, FileText, Users } from "lucide-react"

export default function HRDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalApplications: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    pendingFeedback: 0,
  })
  const [newApplications, setNewApplications] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const user = auth.currentUser
      if (!user) return

      const applicationsQuery = query(collection(db, "applications"))
      const applicationsSnapshot = await getDocs(applicationsQuery)

      const applications = applicationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      setDashboardData({
        totalApplications: applications.length,
        scheduledInterviews: applications.filter((app) => app.status === "Scheduled").length,
        completedInterviews: applications.filter((app) => app.status === "Completed").length,
        pendingFeedback: applications.filter((app) => app.status === "Completed" && !app.feedback).length,
      })

      const newApplicationsQuery = query(
        collection(db, "applications"),
        where("createdAt", ">", user.metadata.lastLoginAt),
      )
      const newApplicationsSnapshot = await getDocs(newApplicationsQuery)
      const newApplicationsData = newApplicationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setNewApplications(newApplicationsData)
    }

    fetchDashboardData()
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">HR Dashboard</h2>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.scheduledInterviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Interviews</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedInterviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingFeedback}</div>
          </CardContent>
        </Card>
      </div>

      {newApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 text-yellow-500 mr-2" />
              New Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {newApplications.map((application) => (
                <li key={application.id} className="flex items-center space-x-2">
                  <span className="text-yellow-500">•</span>
                  <span>
                    New application from {application.fullName} for {application.preferredJobRole}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Interviews */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>John Doe - Frontend Developer</span>
              <span>June 15, 2023 at 2:00 PM</span>
              <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Join</Button>
            </li>
            <li className="flex items-center justify-between">
              <span>Jane Smith - UI/UX Designer</span>
              <span>June 16, 2023 at 10:00 AM</span>
              <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Join</Button>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-[#19A5A2]" />
              <span>New application received for Backend Developer position</span>
            </li>
            <li className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-[#19A5A2]" />
              <span>Reminder: Provide feedback for yesterday's interviews</span>
            </li>
            <li className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-[#19A5A2]" />
              <span>System update scheduled for this weekend</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

