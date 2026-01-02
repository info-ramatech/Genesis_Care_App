import { Link, useLocation } from "react-router-dom"
import {
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  Clock,
  Home,
  Stethoscope,
  ClipboardList,
  TestTube,
  User,
  BotIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

// Doctor-specific navigation items
const doctorNavigation = {
  overview: [
    {
      title: "Dashboard",
      url: "/doctor/dashboard",
      icon: Home,
    },
    {
      title: "My Schedule",
      url: "/doctor/schedule",
      icon: Calendar,
    },
  ],
  patients: [
    {
      title: "Patient Records",
      url: "/doctor/patients/records",
      icon: FileText,
    },
    {
      title: "AI Assist",
      url: "/doctor/ai",
      icon: BotIcon,
    },
  ],
  settings: [
    {
      title: "Profile",
      url: "/doctor/profile",
      icon: User,
    },
  ],
}

interface DoctorSidebarProps {
  variant?: "inset" | "sidebar"
}

export function DoctorSidebar({ variant = "sidebar", ...props }: DoctorSidebarProps) {
  const location = useLocation()
  const userEmail = typeof localStorage !== "undefined" ? localStorage.getItem("email") || "doctor@genesis.com" : "doctor@genesis.com"
  const role = typeof localStorage !== "undefined" ? (localStorage.getItem("role") || "doctor") : "doctor"
  const displayName = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <Sidebar variant={variant} {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {doctorNavigation.overview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
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
          <SidebarGroupLabel>Patient Care</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {doctorNavigation.patients.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
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
              {doctorNavigation.settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
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
        <NavUser user={{ name: displayName, email: userEmail, avatar: "/avatars/shadcn.jpg" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}