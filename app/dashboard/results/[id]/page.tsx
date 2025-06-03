"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Eye, Brain, Download } from "lucide-react"

export default function InterviewResult() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [conversation, setConversation] = useState<any[]>([])

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          router.push("/login/student")
          return
        }

        // Get the interview result
        const resultDoc = await getDoc(doc(db, "final_scores", user.uid))
        if (!resultDoc.exists()) {
          toast({
            title: "Not Found",
            description: "Interview result not found.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setResult(resultDoc.data())

        // Get the conversation
        const conversationSnapshot = await getDoc(doc(db, "conversations", user.uid))
        if (conversationSnapshot.exists()) {
          setConversation(conversationSnapshot.data().messages || [])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching result:", error)
        toast({
          title: "Error",
          description: "Failed to fetch interview result.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    fetchResult()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#19A5A2] mx-auto"></div>
          <p className="mt-4">Loading interview results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Result Not Found</h2>
        <p className="mb-6">The interview result you're looking for could not be found.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  // Calculate overall score (weighted average)
  const overallScore = Math.round(result.total_score * 0.7 + result.posture_score * 0.15 + result.eye_score * 0.15)

  // Determine performance level
  let performanceLevel = "Needs Improvement"
  let performanceColor = "text-red-500"

  if (overallScore >= 80) {
    performanceLevel = "Excellent"
    performanceColor = "text-green-500"
  } else if (overallScore >= 65) {
    performanceLevel = "Good"
    performanceColor = "text-blue-500"
  } else if (overallScore >= 50) {
    performanceLevel = "Average"
    performanceColor = "text-yellow-500"
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interview Result</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Job Role: {result.role}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="text-center mb-4 md:mb-0">
              <div className="text-5xl font-bold mb-2 text-[#19A5A2]">{overallScore}%</div>
              <div className={`text-lg font-medium ${performanceColor}`}>{performanceLevel}</div>
            </div>

            <div className="flex-1 max-w-md mx-auto md:mx-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Technical Knowledge</span>
                    <span className="text-sm font-medium">{result.total_score}%</span>
                  </div>
                  <Progress value={result.total_score} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Posture</span>
                    <span className="text-sm font-medium">{result.posture_score * 10}%</span>
                  </div>
                  <Progress value={result.posture_score * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Eye Contact</span>
                    <span className="text-sm font-medium">{result.eye_score * 10}%</span>
                  </div>
                  <Progress value={result.eye_score * 10} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transcript">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transcript">
            <FileText className="h-4 w-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Brain className="h-4 w-4 mr-2" />
            AI Feedback
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Eye className="h-4 w-4 mr-2" />
            Behavioral Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>Interview Transcript</CardTitle>
              <CardDescription>Complete record of your conversation with the AI interviewer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversation.length > 0 ? (
                  conversation.map((message, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{message.role === "user" ? "You" : "InterviewAI Assistant"}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No transcript available</p>
                )}
              </div>

              <Button variant="outline" className="mt-4 w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Transcript
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
              <CardDescription>Detailed analysis of your interview performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear communication of technical concepts</li>
                    <li>Good problem-solving approach</li>
                    <li>Relevant examples from past experience</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>More detailed explanations of technical implementations</li>
                    <li>Clearer articulation of career goals</li>
                    <li>More specific examples of past projects</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                  <p>
                    Focus on preparing more detailed examples of your technical work. Practice explaining complex
                    concepts in simple terms. Consider preparing a portfolio of your projects to reference during
                    interviews.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Analysis</CardTitle>
              <CardDescription>Analysis of your non-verbal communication during the interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Posture Analysis</h3>
                  <p className="mb-2">
                    Your posture score: <span className="font-medium">{result.posture_score}/10</span>
                  </p>
                  <p>
                    {result.posture_score >= 8
                      ? "Excellent posture maintained throughout the interview. You appeared confident and engaged."
                      : result.posture_score >= 6
                        ? "Good posture overall with occasional slouching. Maintaining consistent posture can help project more confidence."
                        : "Your posture could use improvement. Try sitting up straight and avoiding slouching to appear more confident and engaged."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Eye Contact</h3>
                  <p className="mb-2">
                    Your eye contact score: <span className="font-medium">{result.eye_score}/10</span>
                  </p>
                  <p>
                    {result.eye_score >= 8
                      ? "Excellent eye contact maintained throughout the interview. You appeared engaged and confident."
                      : result.eye_score >= 6
                        ? "Good eye contact overall with occasional lapses. Consistent eye contact can help establish better rapport."
                        : "Your eye contact could use improvement. Try to look at the camera more consistently to establish better connection with the interviewer."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

