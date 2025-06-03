"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Sparkles, Save, RefreshCw, CheckCircle, Edit, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImportFromJD() {
  const router = useRouter()
  const [jdText, setJdText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])

      // In a real app, you would parse the file
      // For demo, we'll just set some sample text
      setJdText(
        "Frontend Developer with 3+ years of experience in React.js, TypeScript, and modern JavaScript. Proficient in responsive design, state management (Redux/Context), and component libraries. Experience with Next.js and GraphQL is a plus. The ideal candidate should have strong problem-solving skills and be able to work in an agile environment.",
      )
    }
  }

  const handleAnalyze = () => {
    if (!jdText.trim()) {
      alert("Please enter a job description or upload a file")
      return
    }

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      // Mock extracted skills
      const skills = [
        "React.js",
        "TypeScript",
        "JavaScript",
        "Responsive Design",
        "Redux",
        "Context API",
        "Next.js",
        "GraphQL",
        "Problem Solving",
        "Agile",
      ]

      setExtractedSkills(skills)

      // Mock generated questions
      const questions = [
        {
          id: 1,
          question:
            "Explain the difference between React Context API and Redux for state management. When would you choose one over the other?",
          category: "Technical",
          difficulty: "Intermediate",
          skillTags: ["React.js", "Redux", "Context API"],
          expectedAnswer:
            "Context API is built into React and is simpler for small applications, while Redux offers more robust state management for complex apps. Context is best for low-frequency updates and simple state, while Redux excels with complex state logic, middleware support, and developer tools.",
        },
        {
          id: 2,
          question:
            "How do you optimize performance in a React application? Provide specific examples of techniques you've used.",
          category: "Technical",
          difficulty: "Advanced",
          skillTags: ["React.js", "Performance", "JavaScript"],
          expectedAnswer:
            "Techniques include: using React.memo for component memoization, implementing useMemo and useCallback hooks, code splitting with React.lazy, virtualizing long lists, optimizing images and assets, and proper key usage in lists.",
        },
        {
          id: 3,
          question:
            "Describe your experience with TypeScript in a React project. What benefits did it bring and what challenges did you face?",
          category: "Technical",
          difficulty: "Intermediate",
          skillTags: ["TypeScript", "React.js"],
          expectedAnswer:
            "Benefits should include type safety, better IDE support, and improved code quality. Challenges might include learning curve, integration with third-party libraries, and balancing type strictness with development speed.",
        },
        {
          id: 4,
          question:
            "How would you implement responsive design in a React application? What tools and techniques would you use?",
          category: "Technical",
          difficulty: "Intermediate",
          skillTags: ["Responsive Design", "React.js", "CSS"],
          expectedAnswer:
            "Should mention CSS media queries, flexible grid layouts, CSS frameworks like Tailwind or Bootstrap, CSS-in-JS solutions, responsive images, and testing across multiple devices.",
        },
        {
          id: 5,
          question: "Describe a challenging problem you faced in a previous project and how you approached solving it.",
          category: "Behavioral",
          difficulty: "Intermediate",
          skillTags: ["Problem Solving", "Agile"],
          expectedAnswer:
            "Look for structured problem-solving approach, collaboration with team members, research skills, persistence, and ability to learn from the experience.",
        },
      ]

      setGeneratedQuestions(questions)
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleSaveAll = () => {
    // In a real app, this would save all questions to your database
    alert(`${generatedQuestions.length} questions saved to your question bank!`)
    router.push("/hr-dashboard/question-bank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/hr-dashboard/question-bank")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Import from Job Description</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Paste job description here..."
                    rows={10}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 pt-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />

                    {file ? (
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Drag and drop your file here or click to browse</p>
                        <p className="text-sm text-gray-500 mt-1">Supports PDF, Word (.docx), and Text (.txt)</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jdText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze & Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {extractedSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-blue-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              For best results, include detailed information about required skills, experience level, and job
              responsibilities in your description.
            </AlertDescription>
          </Alert>
        </div>

        <div className="lg:col-span-2">
          {generatedQuestions.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Generated Questions</h2>
                <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleSaveAll}>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Questions
                </Button>
              </div>

              {generatedQuestions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{question.question}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                            {question.skillTags.map((tag: string) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p className="font-medium text-gray-700">Expected Answer:</p>
                        <p className="text-gray-600 mt-1">{question.expectedAnswer}</p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Regenerate
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 text-blue-200 mx-auto" />
                <h2 className="text-xl font-medium">Job Description Analyzer</h2>
                <p className="text-gray-500 max-w-md">
                  Paste or upload a job description, and our AI will extract key skills and generate relevant interview
                  questions.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

