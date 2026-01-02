import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Edit, Trash2, Search } from "lucide-react";
import { getReservations, getPatients, getDoctors, getSlots } from "@/lib/api"; // Updated imports
import type { ActualReservation, Patient, Doctor, ChannelingSlot } from "@/lib/api"; // Use new types
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Backend-provided status palette (updated to include CONFIRM)
const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-800 hover:bg-green-100",
  Booked: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  CONFIRM: "bg-blue-100 text-blue-800 hover:bg-blue-100", // Added for backend status
};

const mockDoctors = [
  { id: "D001", name: "Dr. Smith", specialization: "General Medicine" },
  { id: "D002", name: "Dr. Johnson", specialization: "Cardiology" },
  { id: "D003", name: "Dr. Davis", specialization: "Orthopedics" },
];

const mockPatients = [
  { id: "P001", name: "John Doe" },
  { id: "P002", name: "Jane Wilson" },
  { id: "P003", name: "Mike Brown" },
];

export default function AppointmentsManagement() {
  const [reservations, setReservations] = useState<ActualReservation[]>([]); // Updated type
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<ChannelingSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    duration: "30",
    type: "",
    notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token") || "";
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || role !== "staff") {
      setError("Unauthorized. Please login as clinic staff.");
      return;
    }
    setLoading(true);
    Promise.all([
      getReservations({ accessToken: token, role: "staff" }),
      getPatients({ accessToken: token }),
      getDoctors({ accessToken: token }),
      getSlots({ accessToken: token, role: "staff" }),
    ])
      .then(([resData, patData, docData, slotData]) => {
        setReservations(resData);
        setPatients(patData);
        setDoctors(docData);
        setSlots(slotData);
      })
      .catch((err) => setError(err.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Memoized enriched appointments with fetched names, dates, etc.
  const enrichedAppointments = useMemo(() => {
    return reservations.map((res) => {
      const slot = slots.find((s) => s.id === res.slot_id);
      const patient = patients.find((p) => p.id === res.patient_id);
      const doctor = doctors.find((d) => d.id === slot?.doctor_id);
      return {
        ...res,
        patientName: patient ? `${patient.first_name} ${patient.last_name}` : "N/A",
        doctorName: doctor ? `${doctor.first_name} ${doctor.last_name}` : "N/A",
        slotDateTime: slot?.slot_date_time || null,
      };
    });
  }, [reservations, patients, doctors, slots]);

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return enrichedAppointments.filter((apt) => {
      const dateOnly = apt.slotDateTime ? apt.slotDateTime.split("T")[0] : "";
      const matchesDate = selectedDate === "" || dateOnly === selectedDate;
      const matchesSearch =
        apt.reference_no?.toLowerCase().includes(term) ||
        apt.patientName.toLowerCase().includes(term) ||
        apt.doctorName.toLowerCase().includes(term) ||
        apt.status?.toLowerCase().includes(term);
      return matchesDate && matchesSearch;
    });
  }, [enrichedAppointments, searchTerm, selectedDate]);

  const handlecreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    // Creation is handled via backend in a separate flow; close dialog for now
    setIsCreateDialogOpen(false);
  };

  // Generate calendar view data (updated to use enriched data)
  const getCalendarData = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const dayAppointments = enrichedAppointments
        .filter((apt) => apt.slotDateTime && apt.slotDateTime.split("T")[0] === dateString)
        .map((apt) => ({
          time: apt.slotDateTime ? new Date(apt.slotDateTime)
            .toISOString()
            .split("T")[1]
            ?.slice(0, 5) : "Unknown",
          patientName: apt.patientName,
          doctorName: apt.doctorName,
        }));
      days.push({
        date: dateString,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        appointments: dayAppointments,
      });
    }
    return days;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments Management</h1>
          <p className="text-muted-foreground flex">
            Schedule and manage patient appointments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for a patient
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlecreateSlot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={newAppointment.patientId}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, patientId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <Select
                  value={newAppointment.doctorId}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, doctorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        time: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Select
                    value={newAppointment.duration}
                    onValueChange={(value) =>
                      setNewAppointment({ ...newAppointment, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value) =>
                      setNewAppointment({ ...newAppointment, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Appointments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex align-left">
                    All Appointments
                  </CardTitle>
                  <CardDescription>
                    Manage and track all appointments
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <div className="relative max-w-[300px] w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-red-600 text-sm mb-3">{error}</div>
              )}
              {loading && (
                <div className="text-sm text-muted-foreground mb-3">
                  Loading appointments…
                </div>
              )}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Patient Name</TableHead>
                      <TableHead className="text-center">Doctor Name</TableHead>
                      <TableHead >Date & Time</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Ticket Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.reference_no || "N/A"}
                        </TableCell>
                        <TableCell>{appointment.patientName}</TableCell> {/* Updated */}
                        <TableCell>{appointment.doctorName}</TableCell> {/* Updated */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {appointment.slotDateTime ? 
                              appointment.slotDateTime.split("T")[0] : 
                              "No date"
                            }
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            {appointment.slotDateTime ? 
                              new Date(appointment.slotDateTime)
                                .toISOString()
                                .split("T")[1]
                                ?.slice(0, 5) : 
                              "No time"
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[appointment.status] || ""}
                          >
                            {appointment.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{appointment.ticket_no || 0}</TableCell> {/* Updated */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calendar View</CardTitle>
              <CardDescription>
                Visual overview of scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {getCalendarData().map((day, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="text-center mb-2">
                      <div className="font-semibold">{day.day}</div>
                      <div className="text-2xl font-bold">{day.dayNumber}</div>
                    </div>
                    <div className="space-y-1">
                      {day.appointments.map((apt, aptIndex) => (
                        <div
                          key={aptIndex}
                          className="text-xs p-2 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        >
                          <div className="font-medium">{apt.time}</div>
                          <div>{apt.patientName}</div>
                          <div className="text-blue-600">{apt.doctorName}</div>
                        </div>
                      ))}
                      {day.appointments.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No appointments
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}