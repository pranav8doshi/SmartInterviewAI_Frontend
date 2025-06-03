"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Upload, Brain, FileText, Library, HelpCircle, Briefcase } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllQuestions } from "@/lib/question-bank-service"
import { useToast } from "@/components/ui/use-toast"

export default function QuestionBank() {
  const { toast } = useToast()
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQuestionCount = async () => {
      setIsLoading(true)
      try {
        const questions = await getAllQuestions()
        setTotalQuestions(questions.length)
      } catch (error) {
        console.error("Error loading question count:", error)
        toast({
          title: "Error",
          description: "Failed to load question count. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestionCount()
  }, [toast])

  const features = [
    {
      title: "Manual Question Addition",
      description: "Add individual questions with detailed information",
      icon: PlusCircle,
      href: "/hr-dashboard/question-bank/manual-add",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Bulk Upload",
      description: "Import multiple questions via Excel/CSV",
      icon: Upload,
      href: "/hr-dashboard/question-bank/bulk-upload",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "AI-Assisted Generation",
      description: "Let AI generate relevant questions based on job roles",
      icon: Brain,
      href: "/hr-dashboard/question-bank/ai-generation",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Import from Job Descriptions",
      description: "Extract questions from job descriptions",
      icon: FileText,
      href: "/hr-dashboard/question-bank/import-jd",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Question Bank Library",
      description: "Browse pre-built questions for various domains",
      icon: Library,
      href: "/hr-dashboard/question-bank/library",
      color: "bg-pink-100 text-pink-700",
    },
    {
      title: "Scenario-Based Questions",
      description: "Create real-world scenario questions",
      icon: Briefcase,
      href: "/hr-dashboard/question-bank/scenario-based",
      color: "bg-orange-100 text-orange-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Question Bank</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-medium">
            Total Questions:{" "}
            {isLoading ? (
              <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              <span className="font-bold text-[#19A5A2]">{totalQuestions}</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title}>
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-2 rounded-full ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-blue-700">Tips for Effective Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-blue-700">
            <li>Create a mix of technical and behavioral questions</li>
            <li>Include questions that assess problem-solving abilities</li>
            <li>Tailor questions to specific job roles and experience levels</li>
            <li>Use scenario-based questions to evaluate practical skills</li>
            <li>Regularly update your question bank with industry trends</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

