import { GoogleGenerativeAI } from "@google/generative-ai"

export interface NewsArticle {
  title: string
  description: string
  url?: string
  publishedAt?: string
  source?: string
}

export interface InterviewQuestion {
  Question: string
  Category: string
  Difficulty: string
  SkillTags: string[]
  ExpectedAnswer: string
}

class InterviewQuestionGenerator {
  private newsApiKey: string
  private geminiApiKey: string
  private genAI: GoogleGenerativeAI

  constructor(
    newsApiKey: string = process.env.NEXT_PUBLIC_NEWS_API_KEY || "",
    geminiApiKey: string = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  ) {
    this.newsApiKey = newsApiKey
    this.geminiApiKey = geminiApiKey
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey)
  }

  async fetchLatestNews(jobRole: string, country = "us"): Promise<NewsArticle[]> {
    try {
      // Construct the query based on job role
      const query = `${jobRole} technology industry trends`

      // Fetch news from News API
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${this.newsApiKey}`,
      )

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()

      // Format the articles
      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source?.name,
      }))
    } catch (error) {
      console.error("Error fetching news:", error)
      return [] // Return empty array in case of error
    }
  }

  async generateInterviewQuestions(jobRole: string, newsArticles: NewsArticle[]): Promise<InterviewQuestion[]> {
    try {
      // Create a context from the news articles
      let context = ""
      if (newsArticles.length > 0) {
        context =
          "Recent industry news:\n\n" +
          newsArticles.map((article) => `Title: ${article.title}\nDescription: ${article.description}\n`).join("\n")
      } else {
        context = "No specific news articles available. Generate questions based on general industry knowledge."
      }

      // Create the prompt for Gemini
      const prompt = `
You are an expert technical interviewer for ${jobRole} positions.

Based on the following recent industry news and trends, generate 5 interview questions that would help assess a candidate's knowledge, skills, and awareness of current developments in the field.

${context}

For each question:
1. Make it relevant to the ${jobRole} position
2. Ensure it tests both technical knowledge and application of concepts
3. Include a mix of difficulty levels
4. Focus on practical scenarios when possible

Format your response as a JSON array with the following structure for each question:
{
  "Question": "The full interview question",
  "Category": "Technical or Behavioral or Problem Solving or System Design",
  "Difficulty": "Beginner or Intermediate or Advanced or Expert",
  "SkillTags": ["Relevant skill 1", "Relevant skill 2"],
  "ExpectedAnswer": "A comprehensive answer that the interviewer can use to evaluate responses"
}

Return ONLY the JSON array with no additional text.
`

      // Generate questions using Gemini
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      // Find JSON content between square brackets
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON response from Gemini")
      }

      const questions = JSON.parse(jsonMatch[0]) as InterviewQuestion[]
      return questions
    } catch (error) {
      console.error("Error generating interview questions:", error)
      throw error
    }
  }

  async generateStandardQuestions(
    jobRole: string,
    skills: string[],
    complexity: number,
    count = 5,
  ): Promise<InterviewQuestion[]> {
    try {
      // Convert complexity (0-100) to difficulty level
      let difficulty = "Intermediate"
      if (complexity < 33) {
        difficulty = "Beginner"
      } else if (complexity < 66) {
        difficulty = "Intermediate"
      } else {
        difficulty = "Advanced"
      }

      // Create the prompt for Gemini
      const prompt = `
You are an expert technical interviewer for ${jobRole} positions.

Generate ${count} interview questions focused on the following skills:
${skills.join(", ")}

The questions should be at approximately ${difficulty} difficulty level.

For each question:
1. Make it relevant to the ${jobRole} position
2. Ensure it tests both technical knowledge and application of concepts
3. Focus on practical scenarios when possible
4. Include a mix of question types (technical, behavioral, problem-solving)

Format your response as a JSON array with the following structure for each question:
{
  "Question": "The full interview question",
  "Category": "Technical or Behavioral or Problem Solving or System Design",
  "Difficulty": "Beginner or Intermediate or Advanced or Expert",
  "SkillTags": ["Relevant skill 1", "Relevant skill 2"],
  "ExpectedAnswer": "A comprehensive answer that the interviewer can use to evaluate responses"
}

Return ONLY the JSON array with no additional text.
`

      // Generate questions using Gemini
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      // Find JSON content between square brackets
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON response from Gemini")
      }

      const questions = JSON.parse(jsonMatch[0]) as InterviewQuestion[]
      return questions
    } catch (error) {
      console.error("Error generating standard questions:", error)
      throw error
    }
  }
}

export default InterviewQuestionGenerator

