"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Application {
  id: string
  name: string
  role: string
  status: string
  userId: string
}

export default function CandidateApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      const querySnapshot = await getDocs(collection(db, "applications"))
      const fetchedApplications: Application[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedApplications.push({
          id: doc.id,
          name: data.fullName,
          role: data.preferredJobRole,
          status: data.status,
          userId: data.userId,
        })
      })
      setApplications(fetchedApplications)
    }

    fetchApplications()
  }, [])

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
      })
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
      toast({
        title: "Success",
        description: `Application ${newStatus.toLowerCase()}.`,
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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Candidate Applications</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.name}</TableCell>
                  <TableCell>{application.role}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>
                    <Link href={`/hr-dashboard/applications/${application.id}`}>
                      <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90 mr-2">View Details</Button>
                    </Link>
                    {/* {application.status === "Pending" && (
                      <>
                        <Button
                          className="bg-green-500 hover:bg-green-600 mr-2"
                          onClick={() => handleStatusChange(application.id, "Accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleStatusChange(application.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )} */}
                    <Button
                      className="bg-[#19A5A2] hover:bg-[#19A5A2]/90 mr-2"
                      onClick={() => router.push(`/hr-dashboard/applications/${application.id}`)}
                    >
                      View Details
                    </Button>
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

