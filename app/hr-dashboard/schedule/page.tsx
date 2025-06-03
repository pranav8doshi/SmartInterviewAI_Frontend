import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

export default function ScheduleInterviews() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Schedule Interviews</h2>
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="candidate">Select Candidate</Label>
              <Select id="candidate">
                <option>John Doe - Frontend Developer</option>
                <option>Jane Smith - UI/UX Designer</option>
                <option>Mike Johnson - Backend Developer</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Interview Date</Label>
              <Input id="date" type="date" />
            </div>
            <div>
              <Label htmlFor="time">Interview Time</Label>
              <Input id="time" type="time" />
            </div>
            <Button type="submit" className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
              Schedule Interview
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

