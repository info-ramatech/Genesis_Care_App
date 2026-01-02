import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Phone, Mail, Calendar, User, MapPin, Loader2, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDoctors, type Doctor } from "../../lib/api" // Import the API function and type

// Enhanced Doctor type with additional UI fields
interface EnhancedDoctor extends Doctor {
  specialization: string;
  status?: "available" | "busy" | "on_break" | "off_duty";
  nextAvailable?: string;
  location?: string;
  todaySchedule?: Array<{
    time: string;
    patient: string;
    type: string;
  }>;
}

const statusColors = {
  available: "bg-green-100 text-green-800 hover:bg-green-100",
  busy: "bg-red-100 text-red-800 hover:bg-red-100",
  on_break: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  off_duty: "bg-gray-100 text-gray-800 hover:bg-gray-100"
}

const statusIcons = {
  available: "🟢",
  busy: "🔴",
  on_break: "🟡",
  off_duty: "⚫"
}

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<EnhancedDoctor | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

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

  // Transform API doctor data to include UI fields
  const transformDoctorData = (doctor: Doctor): EnhancedDoctor => {
    // Generate mock UI data based on doctor info
    const statuses: Array<"available" | "busy" | "on_break" | "off_duty"> = ["available", "busy", "on_break", "off_duty"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    const mockSchedules = [
      [
        { time: "09:00", patient: "John Doe", type: "Consultation" },
        { time: "10:30", patient: "Jane Wilson", type: "Follow-up" },
        { time: "14:00", patient: "Available", type: "" },
        { time: "15:30", patient: "Mike Johnson", type: "Check-up" }
      ],
      [
        { time: "08:00", patient: "Emergency Patient", type: "Emergency" },
        { time: "10:00", patient: "Lisa Brown", type: "Consultation" },
        { time: "11:30", patient: "Robert Davis", type: "Treatment" },
        { time: "14:00", patient: "Available", type: "" }
      ]
    ]

    return {
      ...doctor,
      specialization: doctor.specialist_in || "General Practice",
      status: randomStatus,
      nextAvailable: randomStatus === "available" ? "09:00 AM" : 
                    randomStatus === "busy" ? "02:00 PM" : 
                    randomStatus === "on_break" ? "11:00 AM" : "Tomorrow 09:00 AM",
      location: `Room ${100 + doctor.id}`,
      todaySchedule: mockSchedules[Math.floor(Math.random() * mockSchedules.length)]
    }
  }

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      const { token, role } = getAuthData()
      
      if (!token || (role !== "staff" && role !== "patient")) {
        setError("Unauthorized. Please login.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const apiDoctors = await getDoctors({ accessToken: token })
        const enhancedDoctors = apiDoctors.map(transformDoctorData)
        setDoctors(enhancedDoctors)
      } catch (err: any) {
        setError(err?.message || "Failed to fetch doctors")
        console.error("Error fetching doctors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const specializations = [...new Set(doctors.map(doc => doc.specialization).filter((spec): spec is string => Boolean(spec)))]

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (doctor.specialist_in?.toLowerCase() || "").includes(searchTerm.toLowerCase()) 
    
    const matchesSpecialization = selectedSpecialization === "all" || 
                                 (doctor.specialist_in && doctor.specialist_in === selectedSpecialization)
    
    const matchesStatus = selectedStatus === "all" || doctor.status === selectedStatus
    
    return matchesSearch && matchesSpecialization && matchesStatus
  })

  // const getInitials = (firstName: string, lastName: string) => {
  //   return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
  // }

  const handleViewSchedule = (doctor: EnhancedDoctor) => {
    setSelectedDoctor(doctor)
    setIsScheduleModalOpen(true)
  }

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false)
    setSelectedDoctor(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading doctors...</span>
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
          <h1 className="text-3xl font-bold flex">Doctors Management</h1>
          <p className="text-muted-foreground">View doctor availability and manage schedules</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec, index) => (
                  <SelectItem key={`${spec}-${index}`} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    {/* <AvatarFallback>{getInitials(doctor.first_name, doctor.last_name)}</AvatarFallback> */}
                    <AvatarFallback>D1</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{doctor.first_name} {doctor.last_name}</CardTitle>
                    <CardDescription>{doctor.specialization || "General Practice"}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={statusColors[doctor.status as keyof typeof statusColors]}
                >
                  {statusIcons[doctor.status as keyof typeof statusIcons]} {doctor.status?.replace('_', ' ') || 'available'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{"General"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.location}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.email}</span>
                </div>
              </div>

              {/* Qualifications */}
              {/* {doctor.qualifications && doctor.qualifications.length > 0 && (
                // <div className="border-t pt-3">
                //   <div className="text-sm font-medium mb-2">Qualifications:</div>
                //   <div className="flex flex-wrap gap-1">
                //     {doctor.qualifications.slice(0, 3).map((qual, index) => (
                //       <Badge key={index} variant="outline" className="text-xs">
                //         {qual}
                //       </Badge>
                //     ))}
                //   </div>
                // </div>
              )} */}

              {/* Actions */}
              <div className="border-t pt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewSchedule(doctor)}>
                  <Calendar className="h-4 w-4 mr-1" />
                  View Schedule
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No doctors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {doctors.filter(d => d.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">Available Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {doctors.filter(d => d.status === 'busy').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently Busy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {doctors.filter(d => d.status === 'on_break').length}
            </div>
            <p className="text-xs text-muted-foreground">On Break</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {doctors.filter(d => d.status === 'off_duty').length}
            </div>
            <p className="text-xs text-muted-foreground">Off Duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Dr. {selectedDoctor.first_name} {selectedDoctor.last_name} - Schedule
                </h2>
                <p className="text-muted-foreground">{selectedDoctor.specialization || "General Practice"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeScheduleModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">This Week's Schedule</h3>
              <div className="grid gap-4">
                {/* Generate 7 days schedule */}
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() + i)
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                  const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  
                  return (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{dayName}</h4>
                          <p className="text-sm text-muted-foreground">{dateString}</p>
                        </div>
                        <Badge variant={i === 0 ? "default" : "secondary"}>
                          {i === 0 ? "Today" : i === 6 ? "Weekend" : "Weekday"}
                        </Badge>
                      </div>
                      
                      {/* Time slots for the day */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedDoctor.todaySchedule?.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className={`p-2 rounded text-xs text-center ${
                              slot.patient === "Available" 
                                ? "bg-green-50 text-green-700 border border-green-200" :
                              slot.patient === "Break" 
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                              slot.patient === "Day Off" 
                                ? "bg-gray-50 text-gray-700 border border-gray-200" :
                                "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            <div className="font-medium">{slot.time}</div>
                            <div className="mt-1">{slot.patient}</div>
                            {slot.type && <div className="text-xs opacity-75">{slot.type}</div>}
                          </div>
                        )) || (
                          <div className="col-span-full text-center py-4 text-muted-foreground">
                            No schedule available for this day
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Doctor Info Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedDoctor.phone || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {selectedDoctor.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {selectedDoctor.location}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Professional Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>Department: {"General"}</div>
                    <div className="flex items-center gap-2">
                      Status: 
                      <Badge className={statusColors[selectedDoctor.status as keyof typeof statusColors]}>
                        {statusIcons[selectedDoctor.status as keyof typeof statusIcons]} {selectedDoctor.status?.replace('_', ' ') || 'available'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeScheduleModal}>
                Close
              </Button>
              <Button>
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}