"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface Application {
  id: string
  fullName: string
  preferredJobRole: string
  status: string
  feedback: string
  aiReview: string
}

export default function RateAndFeedback() {
  const [applications, setApplications] = useState<Application[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const querySnapshot = await getDocs(collection(db, "applications"))
    const fetchedApplications: Application[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      fetchedApplications.push({
        id: doc.id,
        fullName: data.fullName,
        preferredJobRole: data.preferredJobRole,
        status: data.status,
        feedback: data.feedback || "",
        aiReview: data.aiReview || "Pending AI review",
      })
    })
    setApplications(fetchedApplications)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = async (id: string, feedback: string) => {
    try {
      await updateDoc(doc(db, "applications", id), { feedback })
      setEditingId(null)
      fetchApplications()
      toast({
        title: "Success",
        description: "Feedback updated successfully.",
      })
    } catch (error) {
      console.error("Error updating feedback:", error)
      toast({
        title: "Error",
        description: "Failed to update feedback.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Rate & Provide Feedback</h2>
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
                <TableHead>Feedback</TableHead>
                <TableHead>AI Review</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.fullName}</TableCell>
                  <TableCell>{application.preferredJobRole}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>
                    {editingId === application.id ? (
                      <Textarea
                        value={application.feedback}
                        onChange={(e) => {
                          const updatedApplications = applications.map((app) =>
                            app.id === application.id ? { ...app, feedback: e.target.value } : app,
                          )
                          setApplications(updatedApplications)
                        }}
                      />
                    ) : (
                      application.feedback || "No feedback provided"
                    )}
                  </TableCell>
                  <TableCell>{application.aiReview}</TableCell>
                  <TableCell>
                    {editingId === application.id ? (
                      <Button onClick={() => handleSave(application.id, application.feedback)}>Save</Button>
                    ) : (
                      <Button onClick={() => handleEdit(application.id)}>Edit</Button>
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

