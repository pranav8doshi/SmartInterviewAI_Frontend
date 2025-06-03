"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, FileText, Bell } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { collection, query, where, getDocs } from "firebase/firestore"

interface StudentData {
  upcomingInterviews: number
  totalApplications: number
  latestInterviewStatus: string
  nextInterview: {
    date: string
    time: string
    role: string
    interviewer: string
  } | null
}

export default function CandidateDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [jobNotifications, setJobNotifications] = useState([])

  const isApplicationValid = (validUntil: string) => {
    const now = new Date()
    const validDate = new Date(validUntil)
    return now <= validDate
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "students", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setStudentData(docSnap.data() as StudentData)
          } else {
            console.log("No such document!")
          }

          // Fetch applications
          const applicationsQuery = query(collection(db, "applications"), where("userId", "==", user.uid))
          const applicationsSnapshot = await getDocs(applicationsQuery)
          const applicationsData = applicationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setApplications(applicationsData)

          // Fetch notifications
          const notificationsQuery = query(
            collection(db, "applications"),
            where("userId", "==", user.uid),
            where("status", "==", "Accepted"),
          )
          const notificationsSnapshot = await getDocs(notificationsQuery)
          const notificationsData = notificationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setNotifications(notificationsData)

          // Fetch job notifications
          const jobNotificationsQuery = query(
            collection(db, "jobRoles"),
            where("createdAt", ">", user.metadata.lastLoginAt),
          )
          const jobNotificationsSnapshot = await getDocs(jobNotificationsQuery)
          const jobNotificationsData = jobNotificationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setJobNotifications(jobNotificationsData)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            title: "Error",
            description: "Failed to fetch student data.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      } else {
        router.push("/login/student")
      }
    })

    return () => unsubscribe()
  }, [router, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!studentData) {
    return <div>No student data available.</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Candidate Dashboard</h2>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.filter((app) => app.status === "Scheduled").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Application Status</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.length > 0 ? applications[applications.length - 1].status : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Validity */}
      {applications.filter((app) => !app.isScheduled && isApplicationValid(app.validUntil)).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-[#19A5A2] mr-2" />
              Applications Pending Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {applications
                .filter((app) => !app.isScheduled && isApplicationValid(app.validUntil))
                .map((app) => {
                  const validUntil = new Date(app.validUntil)
                  const now = new Date()
                  const daysLeft = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <li key={app.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{app.preferredJobRole}</span>
                        <span className="ml-2 text-yellow-600">
                          ({daysLeft} day{daysLeft !== 1 ? "s" : ""} left to schedule)
                        </span>
                      </div>
                      <Button
                        onClick={() => router.push("/dashboard/schedule")}
                        className="bg-[#19A5A2] hover:bg-[#19A5A2]/90"
                      >
                        Schedule Now
                      </Button>
                    </li>
                  )
                })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Interview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Next Interview</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.find((app) => app.status === "Scheduled") ? (
            applications
              .filter((app) => app.status === "Scheduled")
              .map((interview) => {
                // Check if interview is today
                const isToday = interview.interviewDate === new Date().toISOString().split("T")[0]

                return (
                  <div key={interview.id}>
                    <p className="mb-2">
                      <strong>Date & Time:</strong> {interview.interviewDate} at {interview.interviewTime}
                    </p>
                    <p className="mb-2">
                      <strong>Job Role:</strong> {interview.preferredJobRole}
                    </p>
                    {isToday ? (
                      <Button
                        className="bg-[#19A5A2] hover:bg-[#19A5A2]/90"
                        onClick={() =>
                          router.push(`/meeting/join?role=${encodeURIComponent(interview.preferredJobRole)}`)
                        }
                      >
                        Join Interview
                      </Button>
                    ) : (
                      <Button disabled className="bg-gray-400">
                        Interview Scheduled
                      </Button>
                    )}
                  </div>
                )
              })
          ) : (
            <p>No upcoming interviews scheduled.</p>
          )}
        </CardContent>
      </Card>

      {applications.filter((app) => app.status === "Completed").length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications
                .filter((app) => app.status === "Completed")
                .map((interview) => (
                  <div key={interview.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{interview.preferredJobRole}</p>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(interview.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/dashboard/results/${interview.id}`)}>
                      View Results
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-[#19A5A2]" />
                  <span>Your application for {notification.preferredJobRole} has been accepted!</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new notifications</p>
          )}
        </CardContent>
      </Card>

      {jobNotifications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 text-yellow-500 mr-2" />
              New Job Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jobNotifications.map((job) => (
                <li key={job.id} className="flex items-center space-x-2">
                  <span className="text-yellow-500">•</span>
                  <span>New job role: {job.title}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {applications.slice(0, 3).map((application) => (
              <li key={application.id} className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-[#19A5A2]" />
                <span>
                  {application.preferredJobRole} - {application.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

