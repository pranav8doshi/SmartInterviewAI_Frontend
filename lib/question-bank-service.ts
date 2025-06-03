import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface InterviewQuestion {
  id?: string
  question: string
  category: string
  difficulty: string
  jobRole: string
  skillTags: string[]
  expectedAnswer: string
  createdAt?: Date
  source?: string // 'manual', 'bulk', 'ai', 'news', 'jd', 'scenario'
}

export const questionBankCollection = collection(db, "questionBank")

// Add a single question
export async function addQuestion(question: InterviewQuestion): Promise<string> {
  const docRef = await addDoc(questionBankCollection, {
    ...question,
    createdAt: new Date(),
  })
  return docRef.id
}

// Add multiple questions
export async function addQuestions(questions: InterviewQuestion[]): Promise<string[]> {
  const ids: string[] = []

  // Use a batch write for better performance with multiple documents
  const batch = db.batch()

  for (const question of questions) {
    const newDocRef = doc(questionBankCollection)
    batch.set(newDocRef, {
      ...question,
      createdAt: new Date(),
    })
    ids.push(newDocRef.id)
  }

  await batch.commit()
  return ids
}

// Get all questions
export async function getAllQuestions(): Promise<InterviewQuestion[]> {
  const snapshot = await getDocs(questionBankCollection)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as InterviewQuestion,
  )
}

// Get questions by job role
export async function getQuestionsByJobRole(jobRole: string): Promise<InterviewQuestion[]> {
  const q = query(questionBankCollection, where("jobRole", "==", jobRole))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as InterviewQuestion,
  )
}

// Get questions by skill
export async function getQuestionsBySkill(skill: string): Promise<InterviewQuestion[]> {
  const q = query(questionBankCollection, where("skillTags", "array-contains", skill))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as InterviewQuestion,
  )
}

// Get questions by category
export async function getQuestionsByCategory(category: string): Promise<InterviewQuestion[]> {
  const q = query(questionBankCollection, where("category", "==", category))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as InterviewQuestion,
  )
}

// Get questions by difficulty
export async function getQuestionsByDifficulty(difficulty: string): Promise<InterviewQuestion[]> {
  const q = query(questionBankCollection, where("difficulty", "==", difficulty))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as InterviewQuestion,
  )
}

// Get question by ID
export async function getQuestionById(id: string): Promise<InterviewQuestion | null> {
  const docRef = doc(questionBankCollection, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as InterviewQuestion
  }

  return null
}

// Update a question
export async function updateQuestion(id: string, question: Partial<InterviewQuestion>): Promise<void> {
  const docRef = doc(questionBankCollection, id)
  await updateDoc(docRef, question)
}

// Delete a question
export async function deleteQuestion(id: string): Promise<void> {
  const docRef = doc(questionBankCollection, id)
  await deleteDoc(docRef)
}

// Delete multiple questions
export async function deleteQuestions(ids: string[]): Promise<void> {
  const batch = db.batch()

  for (const id of ids) {
    const docRef = doc(questionBankCollection, id)
    batch.delete(docRef)
  }

  await batch.commit()
}

// Search questions by text
export async function searchQuestions(searchText: string): Promise<InterviewQuestion[]> {
  // Firestore doesn't support full-text search natively
  // For a simple implementation, we'll fetch all questions and filter client-side
  // For production, consider using Algolia or similar search service
  const allQuestions = await getAllQuestions()

  return allQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchText.toLowerCase()) ||
      q.expectedAnswer.toLowerCase().includes(searchText.toLowerCase()) ||
      q.skillTags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase())),
  )
}

