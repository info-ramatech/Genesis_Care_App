import { PatientSidebar } from "@/components/patient/patient-sidebar"
// import { PatientChartInteractive } from "@/components/patient/patient-chart-interactive"
import { PatientDataTable } from "@/components/patient/patient-data-table"
import { PatientSectionCards } from "@/components/patient/patient-section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Mock data for patient dashboard - replace with actual API calls
const patientData = {
  reservations: [
    {
      id: "R001",
      referenceNo: "REF-2024-001",
      doctorName: "Dr. Sarah Smith",
      doctorId: "D001",
      slotDateTime: "2024-01-20T09:00:00",
      ticketNo: 1,
      status: "confirmed",
      roomNo: "Room 101",
      isReports: false,
      prescriptionUrl: null
    },
    {
      id: "R002", 
      referenceNo: "REF-2024-002",
      doctorName: "Dr. Michael Johnson",
      doctorId: "D002",
      slotDateTime: "2024-01-25T14:00:00",
      ticketNo: 2,
      status: "pending",
      roomNo: "Room 205",
      isReports: true,
      prescriptionUrl: null
    },
    {
      id: "R003",
      referenceNo: "REF-2024-003", 
      doctorName: "Dr. Emily Davis",
      doctorId: "D003",
      slotDateTime: "2023-12-15T11:00:00",
      ticketNo: 3,
      status: "completed",
      roomNo: "Room 308",
      isReports: false,
      prescriptionUrl: "https://example.com/prescription.pdf"
    }
  ],
  metrics: {
    upcomingAppointments: 2,
    completedVisits: 8,
    pendingReports: 1,
    totalReservations: 15
  },
  patientInfo: {
    name: "John Doe",
    patientId: "P001",
    lastVisit: "2023-12-15",
    nextAppointment: "2024-01-20"
  }
}

export default function PatientDashboard() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <PatientSectionCards 
                metrics={patientData.metrics} 
                patientInfo={patientData.patientInfo}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}