import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MonitorInterviews() {
  const activeInterviews = [
    { id: 1, candidate: "Alice Smith", hr: "John Doe", role: "Frontend Developer", startTime: "14:30" },
    { id: 2, candidate: "Bob Johnson", hr: "Jane Smith", role: "UI/UX Designer", startTime: "15:00" },
    { id: 3, candidate: "Charlie Brown", hr: "Mike Johnson", role: "Backend Developer", startTime: "15:30" },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Monitor Live Interviews</h2>
      <Card>
        <CardHeader>
          <CardTitle>Active Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{interview.candidate}</TableCell>
                  <TableCell>{interview.hr}</TableCell>
                  <TableCell>{interview.role}</TableCell>
                  <TableCell>{interview.startTime}</TableCell>
                  <TableCell>
                    <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Join as Observer</Button>
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

