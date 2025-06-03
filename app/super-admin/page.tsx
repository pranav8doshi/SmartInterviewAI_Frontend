"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Users, UserCheck, Video, AlertTriangle } from "lucide-react"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DashboardData {
  totalHRs: number
  activeCandidates: number
  ongoingInterviews: number
  systemAlerts: number
}

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalHRs: 0,
    activeCandidates: 0,
    ongoingInterviews: 0,
    systemAlerts: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const hrSnapshot = await getDocs(collection(db, "hr"))
      const studentsSnapshot = await getDocs(collection(db, "students"))
      const interviewsSnapshot = await getDocs(
        query(collection(db, "applications"), where("status", "==", "Scheduled")),
      )
      const alertsSnapshot = await getDocs(collection(db, "systemAlerts"))

      setDashboardData({
        totalHRs: hrSnapshot.size,
        activeCandidates: studentsSnapshot.size,
        ongoingInterviews: interviewsSnapshot.size,
        systemAlerts: alertsSnapshot.size,
      })
    }

    fetchDashboardData()

    // Set up real-time listener for recent activities
    const unsubscribe = onSnapshot(
      query(collection(db, "activities"), where("timestamp", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000))),
      (snapshot) => {
        const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setRecentActivities(activities)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Super Admin Dashboard</h2>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HRs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalHRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeCandidates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Interviews</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.ongoingInterviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.systemAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Add New HR</Button>
            <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Generate Report</Button>
            <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">System Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="flex items-center space-x-2">
                {activity.type === "hr_added" && <Users className="h-4 w-4 text-[#19A5A2]" />}
                {activity.type === "interview_completed" && <Video className="h-4 w-4 text-[#19A5A2]" />}
                {activity.type === "report_generated" && <BarChart className="h-4 w-4 text-[#19A5A2]" />}
                <span>{activity.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

