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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createChannelSlot,
  type ChannelingSlot,
  type SlotStatus,
  getDoctors,
} from "@/lib/api";

type Doctor = {
  id: number;
  first_name: string;
  last_name: string;
  specialist_in: string;
};

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-800 hover:bg-green-100",
  Booked: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

export default function SlotsManagement() {
  const [slots, setSlots] = useState<ChannelingSlot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSlot, setNewSlot] = useState({
    doctor_id: "",
    date: "",
    time: "",
    status: "Available" as SlotStatus,
    ticket_count: 10,
    room_no: "",
  });

  // ✅ Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      const token = localStorage.getItem("access_token") || "";
      const role = (localStorage.getItem("role") || "").toLowerCase();
      if (!token || (role !== "staff" && role !== "patient")) {
        setError("Unauthorized. Please login.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `http://13.48.192.110:8000/channeling/slots`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(
            `Failed to fetch slots: ${response.status} ${responseText}`
          );
        }

        const data: ChannelingSlot[] = JSON.parse(responseText);
        setSlots(data);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  // ✅ Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("access_token") || "";
        if (!token) return;
        const data = await getDoctors({ accessToken: token });

        // normalize specialist_in so it’s always a string
        const normalized = data.map((doc: any) => ({
          ...doc,
          specialist_in: doc.specialist_in ?? "General",
        }));

        setDoctors(normalized);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  const filteredSlots = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return slots.filter((s) => {
      const dateOnly = s.slot_date_time.split("T")[0];
      const matchesDate = selectedDate === "" || dateOnly === selectedDate;
      const matchesSearch =
        s.unique_id.toLowerCase().includes(term) ||
        String(s.doctor_id).includes(term) ||
        s.room_no.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term);
      return matchesDate && matchesSearch;
    });
  }, [slots, searchTerm, selectedDate]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("access_token") || "";
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || role !== "staff") {
      setError("Only clinic staff can create slots");
      return;
    }

    try {
      const slotDateTime = new Date(
        `${newSlot.date}T${newSlot.time}:00`
      ).toISOString();
      const created_by =
        Number.parseInt(localStorage.getItem("user_id") || "0", 10) || 0;
      const payload = {
        doctor_id: Number(newSlot.doctor_id),
        slot_date_time: slotDateTime,
        status: newSlot.status,
        ticket_count: Number(newSlot.ticket_count),
        created_by,
        room_no: newSlot.room_no,
      };
      const created = await createChannelSlot(payload, {
        accessToken: token,
        role: "staff",
      });
      setSlots([created, ...slots]);
      setIsCreateDialogOpen(false);
      setNewSlot({
        doctor_id: "",
        date: "",
        time: "",
        status: "Available",
        ticket_count: 10,
        room_no: "",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to create slot");
    }
  };

  const getDoctorName = (doctorId: number) => {
    const doc = doctors.find((d) => d.id === doctorId);
    return doc
      ? `${doc.first_name} ${doc.last_name} — ${doc.specialist_in}`
      : `Doctor #${doctorId}`;
  };

  const getCalendarData = () => {
    const today = new Date();
    const days: Array<{
      date: string;
      day: string;
      dayNumber: number;
      appointments: Array<{ time: string; doctorName: string }>;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const dayAppointments = slots
        .filter((apt) => apt.slot_date_time.split("T")[0] === dateString)
        .map((apt) => ({
          time: new Date(apt.slot_date_time)
            .toISOString()
            .split("T")[1]
            ?.slice(0, 5),
          doctorName: getDoctorName(apt.doctor_id),
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
      {/* Header & Create Dialog */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex">Slots</h1>
          <p className="text-muted-foreground">
            Create and manage doctor channeling slots
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Slot</DialogTitle>
              <DialogDescription>
                Define a new available slot for a doctor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              {/* Doctor Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <select
                  id="doctor"
                  className="w-full border rounded px-3 py-2"
                  value={newSlot.doctor_id}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, doctor_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.first_name} {doc.last_name} — {doc.specialist_in}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSlot.date}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSlot.time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="tickets">Tickets *</Label>
                  <Input
                    id="tickets"
                    type="number"
                    min={1}
                    value={newSlot.ticket_count}
                    onChange={(e) =>
                      setNewSlot({
                        ...newSlot,
                        ticket_count: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room No *</Label>
                  <Input
                    id="room"
                    value={newSlot.room_no}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, room_no: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Slot</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs: List & Calendar */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Slots</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex align-left">All Slots</CardTitle>
                  <CardDescription>Manage and track all slots</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by unique id, doctor id, status, room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[300px]"
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
                  Loading slots…
                </div>
              )}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>ID</TableHead> */}
                      <TableHead className="text-center">Unique ID</TableHead>
                      <TableHead className="text-center">Doctor</TableHead>
                      <TableHead >Date & Time</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Tickets</TableHead>
                      <TableHead className="text-center">Room</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        {/* <TableCell className="font-medium">{slot.id}</TableCell> */}
                        <TableCell>{slot.unique_id}</TableCell>
                        <TableCell>{getDoctorName(slot.doctor_id)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {slot.slot_date_time.split("T")[0]}
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          {new Date(slot.slot_date_time)
                            .toISOString()
                            .split("T")[1]
                            ?.slice(0, 5)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[slot.status] || ""}
                          >
                            {slot.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{slot.ticket_count}</TableCell>
                        <TableCell>{slot.room_no}</TableCell>
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
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calendar View</CardTitle>
              <CardDescription>Visual overview of booked slots</CardDescription>
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
                          <div className="text-blue-600">{apt.doctorName}</div>
                        </div>
                      ))}
                      {day.appointments.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No slots
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
