"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function ApplicationDetails() {
  const { id } = useParams()
  const [application, setApplication] = useState<any>(null)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTime, setInterviewTime] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchApplication = async () => {
      const docRef = doc(db, "applications", id as string)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setApplication({ id: docSnap.id, ...docSnap.data() })
      } else {
        console.log("No such document!")
      }
    }

    fetchApplication()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, "applications", id as string), {
        status: newStatus,
      })
      setApplication({ ...application, status: newStatus })
      toast({
        title: "Success",
        description: `Application status updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating application status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    }
  }

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for the interview.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateDoc(doc(db, "applications", id as string), {
        interviewDate,
        interviewTime,
        status: "Scheduled",
      })
      setApplication({ ...application, interviewDate, interviewTime, status: "Scheduled" })
      toast({
        title: "Success",
        description: "Interview scheduled successfully.",
      })
    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      })
    }
  }

  if (!application) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Application Details</h2>
      <Card>
        <CardHeader>
          <CardTitle>
            {application.fullName} - {application.preferredJobRole}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Email:</strong> {application.email}
            </div>
            <div>
              <strong>Contact Number:</strong> {application.contactNumber}
            </div>
            <div>
              <strong>Date of Birth:</strong> {application.dateOfBirth}
            </div>
            <div>
              <strong>Gender:</strong> {application.gender}
            </div>
            <div>
              <strong>Nationality:</strong> {application.nationality}
            </div>
            <div>
              <strong>Address:</strong> {application.address}
            </div>
            <div>
              <strong>Qualification:</strong> {application.qualification}
            </div>
            <div>
              <strong>University:</strong> {application.university}
            </div>
            <div>
              <strong>Year of Passing:</strong> {application.yearOfPassing}
            </div>
            <div>
              <strong>Marks/CGPA:</strong> {application.marks}
            </div>
            <div>
              <strong>Experience:</strong> {application.experience} years
            </div>
            <div>
              <strong>Skills:</strong> {application.skills}
            </div>
            <div>
              <strong>Expected Salary:</strong> {application.expectedSalary}
            </div>
            <div>
              <strong>Status:</strong> {application.status}
            </div>
            {application.isScheduled ? (
              <div>
                <p className="text-green-600 font-medium">
                  Interview scheduled by candidate for {application.interviewDate} at {application.interviewTime}
                </p>
              </div>
            ) : (
              <p className="text-yellow-600">
                Waiting for candidate to schedule interview (Valid until:{" "}
                {new Date(application.validUntil).toLocaleDateString()})
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

