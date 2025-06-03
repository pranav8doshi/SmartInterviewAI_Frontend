"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Application {
  id: string
  preferredJobRole: string
  appliedAt: string
  validUntil: string
  isScheduled: boolean
  interviewDate?: string
  interviewTime?: string
}

export default function InterviewSchedule() {
  const [applications, setApplications] = useState<Application[]>([])
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "" })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const user = auth.currentUser
    if (!user) return

    const q = query(collection(db, "applications"), where("userId", "==", user.uid))
    const querySnapshot = await getDocs(q)
    const fetchedApplications: Application[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      fetchedApplications.push({
        id: doc.id,
        preferredJobRole: data.preferredJobRole,
        appliedAt: data.appliedAt,
        validUntil: data.validUntil,
        isScheduled: data.isScheduled || false,
        interviewDate: data.interviewDate,
        interviewTime: data.interviewTime,
      })
    })

    setApplications(fetchedApplications)
  }

  const isApplicationValid = (validUntil: string) => {
    const now = new Date()
    const validDate = new Date(validUntil)
    return now <= validDate
  }

  const handleSchedule = (id: string) => {
    setSchedulingId(id)
    const application = applications.find((app) => app.id === id)
    if (application) {
      setScheduleForm({
        date: application.interviewDate || "",
        time: application.interviewTime || "",
      })
    }
  }

  const handleSaveSchedule = async () => {
    if (!schedulingId) return

    if (!scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Error",
        description: "Please select both date and time for the interview.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateDoc(doc(db, "applications", schedulingId), {
        interviewDate: scheduleForm.date,
        interviewTime: scheduleForm.time,
        isScheduled: true,
        status: "Scheduled",
      })

      setSchedulingId(null)
      toast({
        title: "Success",
        description: "Interview scheduled successfully.",
      })

      // Update local state
      setApplications(
        applications.map((app) =>
          app.id === schedulingId
            ? {
                ...app,
                interviewDate: scheduleForm.date,
                interviewTime: scheduleForm.time,
                isScheduled: true,
              }
            : app,
        ),
      )
    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      })
    }
  }

  const handleJoinInterview = (application: Application) => {
    // Check if the interview is today
    const today = new Date().toISOString().split("T")[0]
    if (application.interviewDate === today) {
      router.push("/meeting/join")
    } else {
      toast({
        title: "Not Available",
        description: "This interview is not scheduled for today.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Interview Schedule</h2>
      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Role</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.preferredJobRole}</TableCell>
                  <TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {new Date(application.validUntil).toLocaleDateString()}
                    {!isApplicationValid(application.validUntil) && (
                      <span className="ml-2 text-red-500 text-xs">(Expired)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {application.isScheduled
                      ? `Scheduled for ${application.interviewDate} at ${application.interviewTime}`
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell>
                    {schedulingId === application.id ? (
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={scheduleForm.date}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={scheduleForm.time}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleSaveSchedule} className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setSchedulingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!application.isScheduled && isApplicationValid(application.validUntil) && (
                          <Button
                            onClick={() => handleSchedule(application.id)}
                            className="bg-[#19A5A2] hover:bg-[#19A5A2]/90"
                          >
                            Schedule Interview
                          </Button>
                        )}
                        {application.isScheduled && (
                          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                            <Button
                              className="bg-[#19A5A2] hover:bg-[#19A5A2]/90"
                              onClick={() => handleSchedule(application.id)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleJoinInterview(application)}
                            >
                              Join Interview
                            </Button>
                          </div>
                        )}
                        {!isApplicationValid(application.validUntil) && !application.isScheduled && (
                          <span className="text-red-500">Expired</span>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

