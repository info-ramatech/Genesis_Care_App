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
import { Search, Download, Calendar, MapPin, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PatientReservation {
  id: string
  referenceNo: string
  doctorName: string
  doctorId: string
  slotDateTime: string
  ticketNo: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  roomNo: string
  isReports: boolean
  prescriptionUrl: string | null
}

interface PatientDataTableProps {
  data: PatientReservation[]
}

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100"
}

export function PatientDataTable({ data }: PatientDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReservation, setSelectedReservation] = useState<PatientReservation | null>(null)

  const filteredData = data.filter(
    (reservation) =>
      reservation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.roomNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const isUpcoming = (dateTimeString: string) => {
    return new Date(dateTimeString) > new Date()
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>
                View your appointment history and upcoming visits
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
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
                  filteredData.map((reservation) => {
                    const dateTime = formatDateTime(reservation.slotDateTime)
                    const upcoming = isUpcoming(reservation.slotDateTime)
                    
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-mono text-sm">
                          {reservation.referenceNo}
                          <div className="text-xs text-muted-foreground">
                            Ticket #{reservation.ticketNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{reservation.doctorName}</div>
                          <div className="text-sm text-muted-foreground">ID: {reservation.doctorId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className={upcoming ? "font-medium text-blue-600" : ""}>{dateTime.date}</div>
                              <div className="text-sm text-muted-foreground">{dateTime.time}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {reservation.roomNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={reservation.isReports ? "default" : "secondary"}>
                            {reservation.isReports ? "Required" : "Not Required"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={statusColors[reservation.status]}
                          >
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedReservation(reservation)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Appointment Details</DialogTitle>
                                  <DialogDescription>
                                    {selectedReservation?.referenceNo}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Doctor</label>
                                      <p className="text-sm text-muted-foreground">{selectedReservation?.doctorName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Date & Time</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedReservation && formatDateTime(selectedReservation.slotDateTime).date} at {selectedReservation && formatDateTime(selectedReservation.slotDateTime).time}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Location</label>
                                      <p className="text-sm text-muted-foreground">{selectedReservation?.roomNo}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Ticket Number</label>
                                      <p className="text-sm text-muted-foreground">#{selectedReservation?.ticketNo}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <p className="text-sm text-muted-foreground capitalize">{selectedReservation?.status}</p>
                                  </div>
                                  {selectedReservation?.prescriptionUrl && (
                                    <div>
                                      <label className="text-sm font-medium">Prescription</label>
                                      <Button asChild variant="outline" size="sm" className="mt-1">
                                        <a 
                                          href={selectedReservation.prescriptionUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download Prescription
                                        </a>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {reservation.prescriptionUrl && (
                              <Button asChild variant="ghost" size="sm">
                                <a 
                                  href={reservation.prescriptionUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}