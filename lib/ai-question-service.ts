import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"

// Initialize the Gemini API with the provided key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

// Interface for Question Improvement
export interface QuestionImprovement {
  improvedQuestion: string
  explanation: string
  alternativeVersions?: string[]
  suggestedAnswerPoints?: string[]
}

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Question Improvement Generator
export async function improveInterviewQuestion(
  originalQuestion: string,
  category: string,
  difficulty: string,
  jobRole: string,
  skillTags: string[],
): Promise<QuestionImprovement> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    })

    const prompt = `
      You are an expert interview question designer helping HR professionals create better technical interview questions.

      Original Question: "${originalQuestion}"
      Category: ${category}
      Difficulty: ${difficulty}
      Job Role: ${jobRole}
      Skill Tags: ${skillTags.join(", ")}

      Please improve this interview question with the following requirements:
      
      1. Provide an improved version of the question that is clearer, more specific, and better tests the candidate's knowledge
      2. Explain what improvements you made and why
      3. Provide 2 alternative versions of the question that test similar skills but in different ways
      4. Suggest 3-5 key points that should be in a good answer to this question

      Format the response as a structured JSON with the following fields:
      - improvedQuestion: the improved version of the original question
      - explanation: explanation of the improvements made
      - alternativeVersions: array of alternative question versions
      - suggestedAnswerPoints: array of key points for a good answer

      Ensure the question is appropriate for the specified difficulty level and job role.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from the response
    return parseQuestionImprovement(responseText)
  } catch (error) {
    console.error("Error improving interview question:", error)
    return {
      improvedQuestion: originalQuestion,
      explanation: "Unable to generate improvements at this time. Please try again later.",
      alternativeVersions: [],
      suggestedAnswerPoints: [],
    }
  }
}

// Parse the question improvement from the Gemini response
function parseQuestionImprovement(responseText: string): QuestionImprovement {
  try {
    // Try to extract JSON from the response
    const jsonStart = responseText.indexOf("{")
    const jsonEnd = responseText.lastIndexOf("}") + 1
    const jsonString = responseText.slice(jsonStart, jsonEnd)

    const parsedResponse = JSON.parse(jsonString)

    return {
      improvedQuestion: parsedResponse.improvedQuestion || "No improvement available",
      explanation: parsedResponse.explanation || "No explanation provided",
      alternativeVersions: parsedResponse.alternativeVersions || [],
      suggestedAnswerPoints: parsedResponse.suggestedAnswerPoints || [],
    }
  } catch (error) {
    console.error("Error parsing question improvement:", error)
    return {
      improvedQuestion: "Unable to parse AI response. Please try again.",
      explanation: "An error occurred while processing the AI response.",
      alternativeVersions: [],
      suggestedAnswerPoints: [],
    }
  }
}

export default improveInterviewQuestion

