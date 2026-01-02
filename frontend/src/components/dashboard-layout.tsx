import { Outlet } from "react-router-dom";
import { ClinicSidebar } from "@/components/clinic/clinic-sidebar";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"; 
import { PatientSidebar } from "@/components/patient/patient-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  userRole: "clinic" | "doctor" | "patient";
}

export default function DashboardLayout({ userRole }: DashboardLayoutProps) {
  const getSidebarComponent = () => {
    switch (userRole) {
      case "clinic":
        return <ClinicSidebar variant="inset" />;
      case "doctor":
        return <DoctorSidebar variant="inset" />; 
      case "patient":
        return <PatientSidebar variant="inset" />;
      default:
        return <ClinicSidebar variant="inset" />;
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {getSidebarComponent()}
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}