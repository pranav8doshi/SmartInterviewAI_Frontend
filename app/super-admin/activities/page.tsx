"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Activity {
  id: string
  user: string
  action: string
  timestamp: string
}

export default function HRCandidateActivities() {
  const [hrActivities, setHrActivities] = useState<Activity[]>([])
  const [candidateActivities, setCandidateActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      const hrQuery = query(
        collection(db, "activities"),
        where("userType", "==", "hr"),
        orderBy("timestamp", "desc"),
        limit(10),
      )
      const candidateQuery = query(
        collection(db, "activities"),
        where("userType", "==", "candidate"),
        orderBy("timestamp", "desc"),
        limit(10),
      )

      const [hrSnapshot, candidateSnapshot] = await Promise.all([getDocs(hrQuery), getDocs(candidateQuery)])

      setHrActivities(
        hrSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Activity,
        ),
      )

      setCandidateActivities(
        candidateSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Activity,
        ),
      )
    }

    fetchActivities()
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">HR & Candidate Activities</h2>
      <Tabs defaultValue="hr" className="w-full">
        <TabsList>
          <TabsTrigger value="hr">HR Activities</TabsTrigger>
          <TabsTrigger value="candidate">Candidate Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle>HR Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HR Name</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="candidate">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidateActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

