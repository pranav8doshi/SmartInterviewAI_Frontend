import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InterviewHistory() {
  const pastInterviews = [
    { id: 1, date: "2023-05-15", role: "Frontend Developer", result: "Selected" },
    { id: 2, date: "2023-04-20", role: "UI/UX Designer", result: "Rejected" },
    { id: 3, date: "2023-03-10", role: "Backend Developer", result: "Selected" },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Interview History</h2>
      <Card>
        <CardHeader>
          <CardTitle>Past Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{interview.date}</TableCell>
                  <TableCell>{interview.role}</TableCell>
                  <TableCell>{interview.result}</TableCell>
                  <TableCell>
                    <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">Reapply</Button>
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

