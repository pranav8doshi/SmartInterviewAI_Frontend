"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface HRAccount {
  id: string
  name: string
  email: string
  role: string
}

export default function ManageHRAccounts() {
  const [hrAccounts, setHrAccounts] = useState<HRAccount[]>([])
  const [newHR, setNewHR] = useState({ name: "", email: "", role: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchHRAccounts()
  }, [])

  const fetchHRAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, "hr"))
    const accounts: HRAccount[] = []
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() } as HRAccount)
    })
    setHrAccounts(accounts)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewHR((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddHR = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "hr"), newHR)
      toast({ title: "Success", description: "HR account added successfully." })
      setNewHR({ name: "", email: "", role: "" })
      fetchHRAccounts()
    } catch (error) {
      toast({ title: "Error", description: "Failed to add HR account.", variant: "destructive" })
    }
  }

  const handleEditHR = async (id: string, updatedData: Partial<HRAccount>) => {
    try {
      await updateDoc(doc(db, "hr", id), updatedData)
      toast({ title: "Success", description: "HR account updated successfully." })
      fetchHRAccounts()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update HR account.", variant: "destructive" })
    }
  }

  const handleDeleteHR = async (id: string) => {
    try {
      await deleteDoc(doc(db, "hr", id))
      toast({ title: "Success", description: "HR account deleted successfully." })
      fetchHRAccounts()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete HR account.", variant: "destructive" })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage HR Accounts</h2>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New HR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddHR} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={newHR.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={newHR.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" value={newHR.role} onChange={handleInputChange} required>
                <option value="">Select role</option>
                <option value="Junior HR">Junior HR</option>
                <option value="Senior HR">Senior HR</option>
                <option value="HR Manager">HR Manager</option>
              </Select>
            </div>
            <Button type="submit" className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
              Add HR
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>HR Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hrAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.role}</TableCell>
                  <TableCell>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 mr-2"
                      onClick={() => handleEditHR(account.id, { role: "Senior HR" })}
                    >
                      Edit
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteHR(account.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

