import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "lucide-react"

export default function AnalyticsReports() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Analytics & Reports</h2>
      <Tabs defaultValue="candidate" className="w-full">
        <TabsList>
          <TabsTrigger value="candidate">Candidate Statistics</TabsTrigger>
          <TabsTrigger value="hr">HR Performance</TabsTrigger>
          <TabsTrigger value="interview">Interview Success Rate</TabsTrigger>
        </TabsList>
        <TabsContent value="candidate">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <BarChart className="h-16 w-16 text-[#19A5A2]" />
                <span className="ml-2">Candidate Statistics Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle>HR Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <LineChart className="h-16 w-16 text-[#19A5A2]" />
                <span className="ml-2">HR Performance Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interview Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <BarChart className="h-16 w-16 text-[#19A5A2]" />
                <span className="ml-2">Interview Success Rate Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

