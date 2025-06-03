import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CandidateHistory() {
  const candidateHistory = [
    { id: 1, name: "John Doe", role: "Frontend Developer", date: "2023-05-15", result: "Passed" },
    { id: 2, name: "Jane Smith", role: "UI/UX Designer", date: "2023-04-20", result: "Failed" },
    { id: 3, name: "Mike Johnson", role: "Backend Developer", date: "2023-03-10", result: "Passed" },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Candidate History & Records</h2>
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidateHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.role}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.result}</TableCell>
                  <TableCell>
                    <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button className="mt-4 bg-[#19A5A2] hover:bg-[#19A5A2]/90">Download Reports</Button>
    </div>
  )
}

