import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SystemSettings() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">System Settings & Configurations</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch id="sms-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-alerts">System Alerts</Label>
              <Switch id="system-alerts" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Interview Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="interview-duration">Default Interview Duration (minutes)</Label>
              <Input id="interview-duration" type="number" defaultValue={60} />
            </div>
            <div>
              <Label htmlFor="buffer-time">Buffer Time Between Interviews (minutes)</Label>
              <Input id="buffer-time" type="number" defaultValue={15} />
            </div>
            <div>
              <Label htmlFor="max-interviews-per-day">Maximum Interviews Per Day</Label>
              <Input id="max-interviews-per-day" type="number" defaultValue={10} />
            </div>
            <Button type="submit" className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

