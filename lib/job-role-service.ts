import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface JobRole {
  id?: string
  title: string
  description: string
  requirements: string
  responsibilities: string
  salary: string
  location: string
  questionTypes?: string[] // Types of questions for this job role
  createdAt?: string
}

export const jobRolesCollection = collection(db, "jobRoles")

// Add a job role
export async function addJobRole(jobRole: JobRole): Promise<string> {
  const docRef = await addDoc(jobRolesCollection, {
    ...jobRole,
    createdAt: new Date().toISOString(),
  })
  return docRef.id
}

// Get all job roles
export async function getAllJobRoles(): Promise<JobRole[]> {
  const snapshot = await getDocs(jobRolesCollection)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as JobRole,
  )
}

// Get job role by ID
export async function getJobRoleById(id: string): Promise<JobRole | null> {
  const docRef = doc(jobRolesCollection, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as JobRole
  }

  return null
}

// Update a job role
export async function updateJobRole(id: string, jobRole: Partial<JobRole>): Promise<void> {
  const docRef = doc(jobRolesCollection, id)
  await updateDoc(docRef, jobRole)
}

// Delete a job role
export async function deleteJobRole(id: string): Promise<void> {
  const docRef = doc(jobRolesCollection, id)
  await deleteDoc(docRef)
}

// Get job role by title
export async function getJobRoleByTitle(title: string): Promise<JobRole | null> {
  const q = query(jobRolesCollection, where("title", "==", title))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as JobRole
  }

  return null
}

