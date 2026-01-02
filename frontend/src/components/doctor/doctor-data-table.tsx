import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, User, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DoctorAppointment {
  id: string
  referenceNo: string
  patientName: string
  patientId: string
  time: string
  ticketNo: number
  status: "confirmed" | "in_progress" | "completed" | "pending" | "cancelled"
  roomNo: string
  isReports: boolean
  prescriptionUrl: string | null
}

interface DoctorDataTableProps {
  data: DoctorAppointment[]
}

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  in_progress: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  pending: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100"
}

export function DoctorDataTable({ data }: DoctorDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<DoctorAppointment | null>(null)

  const filteredData = data.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusUpdate = (appointmentId: string, newStatus: DoctorAppointment["status"]) => {
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`)
    // Here you would typically make an API call to update the status
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Patient Schedule</CardTitle>
              <CardDescription>
                Manage consultations and patient records
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
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
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        #{appointment.ticketNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(appointment.time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.patientName}</div>
                          <div className="text-sm text-muted-foreground">ID: {appointment.patientId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {appointment.referenceNo}
                      </TableCell>
                      <TableCell>
                        <Badge variant={appointment.isReports ? "default" : "secondary"}>
                          {appointment.isReports ? "Required" : "Not Required"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={statusColors[appointment.status]}
                        >
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedPatient(appointment)}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Patient Details</DialogTitle>
                                <DialogDescription>
                                  {selectedPatient?.patientName} - {selectedPatient?.referenceNo}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Patient ID</label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient?.patientId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Ticket Number</label>
                                    <p className="text-sm text-muted-foreground">#{selectedPatient?.ticketNo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Room</label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient?.roomNo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Reports Required</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedPatient?.isReports ? "Yes" : "No"}
                                    </p>
                                  </div>
                                </div>
                                {selectedPatient?.prescriptionUrl && (
                                  <div>
                                    <label className="text-sm font-medium">Prescription</label>
                                    <a 
                                      href={selectedPatient.prescriptionUrl} 
                                      className="text-sm text-blue-600 hover:underline block"
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      View Prescription
                                    </a>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(appointment.id, "in_progress")}
                              >
                                Start Consultation
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(appointment.id, "completed")}
                              >
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Add Prescription
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Request Reports
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}