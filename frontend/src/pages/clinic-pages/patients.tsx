import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Phone, Mail, Loader2, CheckCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getPatients, registerPatient, type Patient } from "../../lib/api" // Import the new API function and type

// Enhanced Patient type with additional UI fields
interface EnhancedPatient extends Patient {
  status?: "active" | "inactive";
  lastVisit?: string;
}

export default function PatientManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<EnhancedPatient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<EnhancedPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Patient registration form state
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    role: "patient", // Fixed role for patient registration
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    password: "", // Add password field
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalHistory: ""
  })

  // Get auth data from localStorage
  const getAuthData = () => {
    try {
      const token = localStorage.getItem("access_token") || ""
      const role = (localStorage.getItem("role") || "").toLowerCase()
      return { token, role }
    } catch (error) {
      return { token: "", role: "" }
    }
  }

  // Transform API patient data to include UI fields
  const transformPatientData = (patient: Patient): EnhancedPatient => {
    // Generate mock last visit date
    const randomDays = Math.floor(Math.random() * 365)
    const lastVisitDate = new Date()
    lastVisitDate.setDate(lastVisitDate.getDate() - randomDays)
    
    return {
      ...patient,
      status: patient.is_active ? "active" : "inactive",
      lastVisit: lastVisitDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }
  }

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      const { token, role } = getAuthData()
      
      if (!token || (role !== "staff" && role !== "patient")) {
        setError("Unauthorized. Please login.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const apiPatients = await getPatients({ accessToken: token })
        const enhancedPatients = apiPatients.map(transformPatientData)
        setPatients(enhancedPatients)
        setFilteredPatients(enhancedPatients)
      } catch (err: any) {
        setError(err?.message || "Failed to fetch patients")
        console.error("Error fetching patients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = patients.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
      return fullName.includes(value.toLowerCase()) ||
             patient.id.toString().includes(value.toLowerCase()) ||
             patient.email.toLowerCase().includes(value.toLowerCase()) ||
             (patient.contact_no || "").toLowerCase().includes(value.toLowerCase())
    })
    setFilteredPatients(filtered)
  }

  const handlePatientRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsRegistering(true)
    setRegistrationSuccess(false)
    setError(null)

    const { token } = getAuthData()
    if (!token) {
      setError("Authentication token missing. Please log in.")
      setIsRegistering(false)
      return
    }

    const payload = {
      email: newPatient.email,
      role: newPatient.role, // Fixed role for patient registration
      password: newPatient.password,
      first_name: newPatient.firstName,
      last_name: newPatient.lastName,
      date_of_birth: newPatient.dateOfBirth,
      gender: newPatient.gender,
      phone: newPatient.phone,
      address: newPatient.address,
      emergency_contact: newPatient.emergencyContact,
      emergency_phone: newPatient.emergencyPhone,
      medical_history: newPatient.medicalHistory
    }

    try {
      const registeredPatient = await registerPatient(payload, { accessToken: token })
      
      // Update the patient list with the newly registered patient
      const newEnhancedPatient = transformPatientData(registeredPatient)
      setPatients(prev => [...prev, newEnhancedPatient])
      setFilteredPatients(prev => [...prev, newEnhancedPatient])

      setRegistrationSuccess(true)
      
      // Reset form
      setNewPatient({
        firstName: "",
        role: "patient", // Fixed role for patient registration
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        password: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        medicalHistory: ""
      })
    } catch (err: any) {
      setError(err?.message || "Failed to register patient")
      console.error("Error registering patient:", err)
    } finally {
      setIsRegistering(false)
    }
  }

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birth = new Date(dateOfBirth)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading patients...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records and registrations</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Patient List</TabsTrigger>
          <TabsTrigger value="register">Register New Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex align-left">All Patients</CardTitle>
                  <CardDescription>Search and manage existing patients ({filteredPatients.length} total)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Patient ID</TableHead>
                      <TableHead className="text-center">Name</TableHead>
                      {/* <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead> */}
                      <TableHead className="text-center">Phone</TableHead>
                      <TableHead className="text-center">Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted px-4">
                        <TableCell className="font-medium">P{patient.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                        {/* <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                        <TableCell className="capitalize">{patient.gender || "N/A"}</TableCell> */}
                        <TableCell>{patient.contact_no}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell className="!text-center">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No patients found matching your search criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Register New Patient</CardTitle>
              <CardDescription>Add a new patient to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePatientRegistration} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={newPatient.gender}
                      onValueChange={(value) => setNewPatient({...newPatient, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPatient.password}
                      onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={newPatient.emergencyContact}
                      onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={newPatient.emergencyPhone}
                      onChange={(e) => setNewPatient({...newPatient, emergencyPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">Cancel</Button>
                  <Button type="submit" disabled={isRegistering}>
                    {isRegistering ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isRegistering ? "Registering..." : "Register Patient"}
                  </Button>
                </div>
                {registrationSuccess && (
                  <div className="mt-4 p-3 rounded-md bg-green-50 text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Patient registered successfully!
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 rounded-md bg-red-50 text-red-800">
                    Error: {error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {patients.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {patients.filter(p => p.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {patients.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent Visits (30d)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}