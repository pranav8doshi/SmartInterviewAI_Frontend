"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BulkUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<{
    valid: number
    invalid: number
    duplicates: number
    errors: Array<{ row: number; message: string }>
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setValidationResults(null)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)

          // Simulate validation results
          setValidationResults({
            valid: 42,
            invalid: 3,
            duplicates: 2,
            errors: [
              { row: 5, message: "Missing 'Expected Answer' field" },
              { row: 12, message: "Invalid 'Difficulty' value" },
              { row: 23, message: "Duplicate question detected" },
            ],
          })

          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const handleDownloadTemplate = () => {
    // In a real app, this would download a CSV/Excel template
    alert("Template download would start here")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/hr-dashboard/question-bank")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Bulk Upload Questions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel or CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Your file should include columns for Question, Category, Difficulty, Job Role, Skill Tags, and
                    Expected Answer.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>

                  <div className="text-sm text-gray-500">Max file size: 10MB</div>
                </div>

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />

                  {file ? (
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Drag and drop your file here or click to browse</p>
                      <p className="text-sm text-gray-500 mt-1">Supports CSV, Excel (.xlsx, .xls)</p>
                    </div>
                  )}
                </div>

                {file && (
                  <div>
                    {uploading ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    ) : (
                      <Button className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleUpload}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload and Validate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {validationResults && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{validationResults.valid}</p>
                      <p className="text-sm text-green-700">Valid Questions</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-yellow-600">{validationResults.duplicates}</p>
                      <p className="text-sm text-yellow-700">Duplicates</p>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{validationResults.invalid}</p>
                      <p className="text-sm text-red-700">Invalid Entries</p>
                    </div>
                  </div>

                  <Tabs defaultValue="errors">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="errors">Errors ({validationResults.errors.length})</TabsTrigger>
                      <TabsTrigger value="preview">Data Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="errors" className="space-y-4 pt-4">
                      {validationResults.errors.length > 0 ? (
                        validationResults.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Row {error.row}</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                          </Alert>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                          <p className="text-gray-600">No errors found!</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Question
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Difficulty
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Job Role
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* Sample preview data */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                Explain the concept of closures in JavaScript
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Technical</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Intermediate</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Frontend Developer</td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                How would you optimize a React application?
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Technical</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Advanced</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Frontend Developer</td>
                            </tr>
                            {/* More rows would be here */}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setValidationResults(null)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>

                    <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" disabled={validationResults.invalid > 0}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Import Valid Questions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>File Format Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Required Columns:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge>Question</Badge>
                    <span className="text-sm">The interview question text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge>Category</Badge>
                    <span className="text-sm">Technical, Behavioral, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge>Difficulty</Badge>
                    <span className="text-sm">Beginner, Intermediate, Advanced, Expert</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge>Job Role</Badge>
                    <span className="text-sm">The relevant job position</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge>Skill Tags</Badge>
                    <span className="text-sm">Comma-separated skills (e.g., "React, Redux, TypeScript")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge>Expected Answer</Badge>
                    <span className="text-sm">Key points or full answer</span>
                  </li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tips</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Use UTF-8 encoding for your CSV files</li>
                    <li>Keep questions concise and clear</li>
                    <li>For multiple skill tags, separate with commas</li>
                    <li>Check for duplicates before uploading</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

