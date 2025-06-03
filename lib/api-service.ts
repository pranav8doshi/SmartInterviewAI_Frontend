const API_BASE_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000"

export interface InterviewSession {
  email: string
  jobRole: string
  sessionId?: string
}

export interface InterviewMessage {
  role: "ai" | "user"
  content: string
  timestamp: Date
}

export async function startInterview(data: InterviewSession): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/start_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to start interview")
    }

    const result = await response.json()
    return result.sessionId
  } catch (error) {
    console.error("Error starting interview:", error)
    throw error
  }
}

export async function getNextQuestion(sessionId: string): Promise<InterviewMessage> {
  try {
    const response = await fetch(`${API_BASE_URL}/next_question?sessionId=${sessionId}`)

    if (!response.ok) {
      throw new Error("Failed to get next question")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting next question:", error)
    throw error
  }
}

export async function submitAnswer(sessionId: string, answer: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/submit_answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, answer }),
    })
  } catch (error) {
    console.error("Error submitting answer:", error)
    throw error
  }
}

export async function endInterview(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/end_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    })
  } catch (error) {
    console.error("Error ending interview:", error)
    throw error
  }
}

export async function getInterviewReport(sessionId: string): Promise<InterviewMessage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/interview_report?sessionId=${sessionId}`)

    if (!response.ok) {
      throw new Error("Failed to get interview report")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting interview report:", error)
    throw error
  }
}

