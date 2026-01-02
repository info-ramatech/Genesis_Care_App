import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
// import { DoctorChartInteractive } from "@/components/doctor/doctor-chart-interactive"
import { DoctorDataTable } from "@/components/doctor/doctor-data-table"
import { DoctorSectionCards } from "@/components/doctor/doctor-section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Mock data for doctor dashboard - replace with actual API calls
const doctorData = {
  todaysAppointments: [
    {
      id: "R001",
      referenceNo: "REF-2024-001",
      patientName: "John Doe",
      patientId: "P001",
      time: "09:00 AM",
      ticketNo: 1,
      status: "confirmed",
      roomNo: "Room 101",
      isReports: false,
      prescriptionUrl: null
    },
    {
      id: "R002",
      referenceNo: "REF-2024-002", 
      patientName: "Jane Wilson",
      patientId: "P002",
      time: "10:30 AM",
      ticketNo: 2,
      status: "in_progress",
      roomNo: "Room 101",
      isReports: true,
      prescriptionUrl: null
    },
    {
      id: "R003",
      referenceNo: "REF-2024-003",
      patientName: "Mike Brown",
      patientId: "P003", 
      time: "02:00 PM",
      ticketNo: 3,
      status: "pending",
      roomNo: "Room 101",
      isReports: false,
      prescriptionUrl: null
    }
  ],
  metrics: {
    todaysPatients: 8,
    completedConsultations: 5,
    pendingReports: 3,
    upcomingAppointments: 12
  },
  doctorInfo: {
    name: "Dr. Sarah Smith",
    specialization: "General Medicine",
    roomNo: "Room 101",
    schedule: "9:00 AM - 5:00 PM"
  }
}

export default function DoctorDashboard() {
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
              <DoctorSectionCards 
                metrics={doctorData.metrics} 
                doctorInfo={doctorData.doctorInfo}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}