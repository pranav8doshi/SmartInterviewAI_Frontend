"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Interview {
  id: string
  candidate: string
  role: string
  time: string
}

export default function ConductInterviews() {
  const [todayInterviews, setTodayInterviews] = useState<Interview[]>([])

  useEffect(() => {
    fetchTodayInterviews()
  }, [])

  const fetchTodayInterviews = async () => {
    const today = new Date().toISOString().split("T")[0]
    const q = query(
      collection(db, "applications"),
      where("status", "==", "Scheduled"),
      where("interviewDate", "==", today),
    )
    const querySnapshot = await getDocs(q)
    const interviews: Interview[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      interviews.push({
        id: doc.id,
        candidate: data.fullName,
        role: data.preferredJobRole,
        time: data.interviewTime,
      })
    })
    setTodayInterviews(interviews)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Conduct Interviews</h2>
      <Card>
        <CardHeader>
          <CardTitle>Today's Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {todayInterviews.length === 0 ? (
            <p>No interviews scheduled for today.</p>
          ) : (
            todayInterviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">{interview.candidate}</h3>
                  <p>
                    {interview.role} - {interview.time}
                  </p>
                </div>
                <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Join Interview</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

