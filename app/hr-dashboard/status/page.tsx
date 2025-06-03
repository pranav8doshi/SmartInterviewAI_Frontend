"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface Interview {
  id: string
  candidate: string
  role: string
  status: string
  interviewDate: string
  interviewTime: string
}

export default function InterviewStatus() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ date: "", time: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    const q = query(collection(db, "applications"), where("status", "in", ["Accepted", "Scheduled"]))
    const querySnapshot = await getDocs(q)
    const fetchedInterviews: Interview[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      fetchedInterviews.push({
        id: doc.id,
        candidate: data.fullName,
        role: data.preferredJobRole,
        status: data.status,
        interviewDate: data.interviewDate || "",
        interviewTime: data.interviewTime || "",
      })
    })
    setInterviews(fetchedInterviews)
  }

  const handleEdit = (interview: Interview) => {
    setEditingId(interview.id)
    setEditForm({ date: interview.interviewDate, time: interview.interviewTime })
  }

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, "applications", id), {
        interviewDate: editForm.date,
        interviewTime: editForm.time,
        status: "Scheduled",
      })
      setEditingId(null)
      fetchInterviews()
      toast({
        title: "Success",
        description: "Interview details updated successfully.",
      })
    } catch (error) {
      console.error("Error updating interview details:", error)
      toast({
        title: "Error",
        description: "Failed to update interview details.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Interview Status</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{interview.candidate}</TableCell>
                  <TableCell>{interview.role}</TableCell>
                  <TableCell>{interview.status}</TableCell>
                  <TableCell>
                    {editingId === interview.id ? (
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    ) : (
                      interview.interviewDate
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === interview.id ? (
                      <Input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                      />
                    ) : (
                      interview.interviewTime
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === interview.id ? (
                      <Button onClick={() => handleSave(interview.id)} className="bg-green-500 hover:bg-green-600">
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => handleEdit(interview)} className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
                        Edit
                      </Button>
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

