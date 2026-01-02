import { ClinicSidebar } from "@/components/clinic/clinic-sidebar"
import { ClinicChartInteractive } from "@/components/clinic/clinic-chart-interactive"
import { ClinicDataTable } from "@/components/clinic/clinic-data-table"
import { ClinicSectionCards } from "@/components/clinic/clinic-section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Mock data for clinic dashboard - replace with actual API calls
const clinicData = {
  appointments: [
    {
      id: "1",
      patientName: "John Doe",
      doctorName: "Dr. Smith",
      time: "09:00 AM",
      status: "confirmed" as const,
      type: "consultation"
    },
    {
      id: "2",
      patientName: "Jane Wilson",
      doctorName: "Dr. Johnson",
      time: "10:30 AM",
      status: "pending" as const,
      type: "follow-up"
    },
    {
      id: "3",
      patientName: "Mike Brown",
      doctorName: "Dr. Davis",
      time: "02:00 PM",
      status: "confirmed" as const,
      type: "check-up"
    },
    {
      id: "4",
      patientName: "Sarah Lee",
      doctorName: "Dr. Smith",
      time: "03:30 PM",
      status: "cancelled" as const,
      type: "consultation"
    }
  ],
  metrics: {
    totalPatients: 1247,
    todaysAppointments: 23,
    availableDoctors: 8,
    pendingTasks: 12
  }
}

export default function ClinicDashboard() {
  return (
 
      <SidebarInset>
        <div className="container mx-auto p-6">
          <div>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <ClinicSectionCards metrics={clinicData.metrics} />
              <div className="px-4 lg:px-6">
                <ClinicChartInteractive />
              </div>
              <ClinicDataTable data={clinicData.appointments} />
            </div>
          </div>
        </div>
      </SidebarInset>

  )
}