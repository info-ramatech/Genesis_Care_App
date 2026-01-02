import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  FileText,
  Settings,
  Clock,
  Home,
  Plus,
  TestTube,
  User,
  History,
  Download,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user"
// Patient-specific navigation items
const patientNavigation = {
  overview: [
    {
      title: "Dashboard",
      url: "/patient/dashboard",
      icon: Home,
    },
    {
      title: "My Appointments",
      url: "/patient/appointments",
      icon: Calendar,
    },
  ],
  booking: [
    {
      title: "Book Appointment",
      url: "/patient/book-appointment",
      icon: Plus,
    },
  ],
  records: [
    {
      title: "Medical History",
      url: "/patient/medical-history",
      icon: History,
    },
    {
      title: "Prescriptions",
      url: "/patient/prescriptions",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/patient/reports",
      icon: Download,
    },
  ],
  account: [
    {
      title: "Profile",
      url: "/patient/profile",
      icon: User,
    },
  ],
};

interface PatientSidebarProps {
  variant?: "inset" | "sidebar";
}

export function PatientSidebar({
  variant = "sidebar",
  ...props
}: PatientSidebarProps) {
  const location = useLocation();
  const userEmail =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("email") || "doctor@genesis.com"
      : "doctor@genesis.com";
  const role =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("role") || "doctor"
      : "doctor";
  const displayName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Sidebar variant={variant} {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientNavigation.overview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Appointments</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientNavigation.booking.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Medical Records</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientNavigation.records.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientNavigation.account.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: userEmail,
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
