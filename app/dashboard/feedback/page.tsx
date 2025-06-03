import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InterviewFeedback() {
  const feedbacks = [
    {
      id: 1,
      role: "Frontend Developer",
      status: "Selected",
      comments: "Excellent technical skills and communication.",
    },
    { id: 2, role: "Backend Developer", status: "Rejected", comments: "Needs improvement in system design concepts." },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Interview Feedback & Results</h2>
      {feedbacks.map((feedback) => (
        <Card key={feedback.id} className="mb-4">
          <CardHeader>
            <CardTitle>{feedback.role}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Status:</strong> {feedback.status}
            </p>
            <p>
              <strong>HR Feedback:</strong> {feedback.comments}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

