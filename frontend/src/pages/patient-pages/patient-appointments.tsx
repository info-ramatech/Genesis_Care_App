import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Search, 
  XCircle, 
  CheckCircle2, 
  Filter,
  User,
  MapPin,
  Loader2
} from "lucide-react";
import { 
  getDoctors,
  getDoctorSlots,
  getPatients,
  createReservation,
  getReservations, // Added to fetch reservations
  type Doctor,
  type ChannelingSlot, 
  type Patient,
  type CreateReservationPayload 
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced Doctor type with additional UI fields
interface EnhancedDoctor extends Doctor {
  status?: "available" | "busy" | "on_break" | "off_duty";
  location?: string;
}

const statusColors = {
  available: "bg-green-100 text-green-800 hover:bg-green-100",
  busy: "bg-red-100 text-red-800 hover:bg-red-100",
  on_break: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  off_duty: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  Available: "bg-green-100 text-green-800 hover:bg-green-100",
  Booked: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

const statusIcons = {
  available: "🟢",
  busy: "🔴",
  on_break: "🟡",
  off_duty: "⚫"
};

export default function PatientAppointments() {
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<EnhancedDoctor | null>(null);
  const [doctorSlots, setDoctorSlots] = useState<ChannelingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ChannelingSlot | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  
  // Modal states
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  
  // Booking form state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [reservations, setReservations] = useState<any[]>([]); // Store reservation data

  // Custom notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Get auth data
  const getAuthData = () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const role = (localStorage.getItem("role") || "").toLowerCase();
      const userId = localStorage.getItem("user_id") || "";
      return { token, role, userId };
    } catch (error) {
      return { token: "", role: "", userId: "" };
    }
  };

  // Transform doctor data
  const transformDoctorData = (doctor: Doctor): EnhancedDoctor => {
    const statuses: Array<"available" | "busy" | "on_break" | "off_duty"> = ["available", "busy", "on_break", "off_duty"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      ...doctor,
      status: randomStatus,
      location: `Room ${100 + doctor.id}`,
    };
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const { token, role } = getAuthData();

      if (!token || (role !== "patient" && role !== "staff")) {
        setError("Unauthorized. Please login.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch doctors
        const apiDoctors = await getDoctors({ accessToken: token });
        const enhancedDoctors = apiDoctors.map(transformDoctorData);
        setDoctors(enhancedDoctors);

        // If staff member, also fetch patients for booking on behalf
        if (role === "staff") {
          const patientsData = await getPatients({ accessToken: token });
          setPatients(patientsData);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch data");
        showNotification(err.message || "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch doctor's available slots and reservations
  const fetchDoctorSlots = async (doctor: EnhancedDoctor) => {
    const { token, role } = getAuthData();
    
    if (!token) {
      setError("Unauthorized access");
      return;
    }

    setSlotsLoading(true);
    setError(null);

    try {
      // Fetch slots
      const slots = await getDoctorSlots(doctor.id, { accessToken: token, role });
      const availableSlots = slots.filter(slot => slot.status === "Available");

      // Fetch reservations to calculate booked tickets
      const allReservations = await getReservations({ accessToken: token, role: "staff" });
      setReservations(allReservations);

      // Calculate remaining tickets for each slot
      const updatedSlots = availableSlots.map(slot => {
        const bookedCount = allReservations.filter(res => res.slot_id === slot.id).length;
        const remainingTickets = slot.ticket_count - bookedCount;
        return {
          ...slot,
          remainingTickets: remainingTickets >= 0 ? remainingTickets : 0, // Ensure non-negative
        };
      });

      setDoctorSlots(updatedSlots);
      setSelectedDoctor(doctor);
      setIsScheduleDialogOpen(true);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch doctor's schedule");
      showNotification(err?.message || "Failed to fetch doctor's schedule", "error");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) return;

    const { token, role, userId } = getAuthData();
    
    if (!token) {
      showNotification("Please login again to book appointment", "error");
      return;
    }

    // Determine patient ID based on role
    let patientId: number;
    if (role === "patient") {
      patientId = parseInt(userId);
    } else if (role === "staff" && selectedPatientId) {
      patientId = parseInt(selectedPatientId);
    } else {
      showNotification("Please select a patient", "error");
      return;
    }

    try {
      const payload: CreateReservationPayload = {
        slot_id: selectedSlot.id,
        status: "CONFIRM",
        patient_id: patientId,
      };

      await createReservation(payload, { accessToken: token, role: "patient" });
      showNotification("Appointment booked successfully!", "success");

      // Refresh doctor slots after booking
      if (selectedDoctor) {
        await fetchDoctorSlots(selectedDoctor); // Re-fetch to update ticket counts
      }

      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
    } catch (err: any) {
      showNotification(err.message || "Failed to book appointment", "error");
    }
  };

  const openBookingDialog = (slot: ChannelingSlot) => {
    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };

  // Filter doctors
  const specializations = [...new Set(doctors.map(doc => doc.specialist_in).filter(Boolean).map(String))];
  
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name || ""} ${doctor.last_name || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (doctor.specialist_in?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === "all" || 
                                 doctor.specialist_in === selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const firstInitial = (firstName && firstName.length > 0) ? firstName[0].toUpperCase() : "D";
    const lastInitial = (lastName && lastName.length > 0) ? lastName[0].toUpperCase() : "R";
    return `${firstInitial}${lastInitial}`;
  };

  const { role } = getAuthData();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading doctors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Custom Notification Component */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex">Book Appointments</h1>
          <p className="text-muted-foreground">Select a doctor to view available appointment slots</p>
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
                    <AvatarFallback>{getInitials(doctor.first_name, doctor.last_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{doctor.first_name || "Doctor"} {doctor.last_name || "Name"}</CardTitle>
                    <CardDescription>{doctor.specialist_in || "General Practice"}</CardDescription>
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
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.department || "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.location}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => fetchDoctorSlots(doctor)}
                  disabled={slotsLoading}
                >
                  {slotsLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-1" />
                  )}
                  View Available Slots
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

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="!max-w-4xl px-4">
          <DialogHeader>
            <DialogTitle>
              Available Slots - Dr. {selectedDoctor?.first_name || "Doctor"} {selectedDoctor?.last_name || "Name"}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctor?.specialist_in || "General Practice"} • {selectedDoctor?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
              <div className="bg-gray-50 px-4 py-2 font-medium text-sm border-b">
                <div className="grid grid-cols-6 gap-4">
                  <div>Date</div>
                  <div>Time</div>
                  <div>Room</div>
                  <div>Tickets</div>
                  <div>Status</div>
                  <div>Action</div>
                </div>
              </div>
              
              {doctorSlots.map((slot) => (
                <div key={slot.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {slot.slot_date_time.split('T')[0]}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {new Date(slot.slot_date_time).toISOString().split('T')[1]?.slice(0, 5)}
                    </div>
                    <div className="text-sm">{slot.room_no}</div>
                    <div className="text-sm">{slot.remainingTickets} available</div> {/* Updated to show remaining tickets */}
                    <div>
                      <Badge
                        variant="secondary"
                        className={statusColors[slot.status as keyof typeof statusColors] || ""}
                      >
                        {slot.status}
                      </Badge>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        onClick={() => openBookingDialog(slot)}
                        disabled={slot.remainingTickets <= 0} // Disable if no tickets left
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {doctorSlots.map((slot) => (
                <Card key={slot.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    {/* Date & Time Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{slot.slot_date_time.split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(slot.slot_date_time).toISOString().split('T')[1]?.slice(0, 5)}
                      </div>
                    </div>

                    {/* Room & Available Tickets Row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Room {slot.room_no}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {slot.remainingTickets} tickets available
                      </div>
                    </div>

                    {/* Status & Action Row */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={statusColors[slot.status as keyof typeof statusColors] || ""}
                      >
                        {slot.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => openBookingDialog(slot)}
                        disabled={slot.remainingTickets <= 0} // Disable if no tickets left
                        className="px-6"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {doctorSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No available slots found for this doctor
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Confirm appointment details
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <div className="text-sm">Dr. {selectedDoctor?.first_name || "Doctor"} {selectedDoctor?.last_name || "Name"}</div>
              </div>

              <div className="space-y-2">
                <Label>Date & Time</Label>
                <div className="text-sm">
                  {selectedSlot.slot_date_time.split('T')[0]} at{" "}
                  {new Date(selectedSlot.slot_date_time).toISOString().split('T')[1]?.slice(0, 5)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Room</Label>
                <div className="text-sm">{selectedSlot.room_no}</div>
              </div>

              {/* Patient selection for staff */}
              {role === "staff" && (
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.first_name || "Patient"} {patient.last_name || "Name"} - P{patient.id.toString().padStart(3, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Available Tickets</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedSlot.remainingTickets} tickets available for this slot
                  <br />
                  <span className="text-xs">Ticket number will be assigned automatically</span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleBookAppointment} disabled={selectedSlot.remainingTickets <= 0}>
                  Confirm Booking
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}