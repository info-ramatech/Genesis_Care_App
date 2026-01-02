import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  UserCheck,
  FileText,
  Settings,
  BarChart3,
  Clock,
  Plus,
  Home,
  Stethoscope,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

// Clinic-specific navigation items
const clinicNavigation = {
  overview: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
  ],
  management: [
    {
      title: "Patients",
      url: "/patients",
      icon: Users,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
    },
  ],
  staff: [
    {
      title: "Doctors",
      url: "/doctors",
      icon: Stethoscope,
    },
    {
      title: "Slots",
      url: "/channeling/slots",
      icon: Clock,
    },
  ],
  account: [
    {
      title: "Profile",
      url: "/profile",
      icon: UserCheck,
    },
  ],
};

interface ClinicSidebarProps {
  variant?: "inset" | "sidebar";
}

export function ClinicSidebar({
  variant = "sidebar",
  ...props
}: ClinicSidebarProps) {
  const location = useLocation();
  const userEmail =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("email") || "user@genesis.com"
      : "user@genesis.com";
  const role =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("role") || "clinic"
      : "clinic";
  const displayName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Sidebar variant={variant} {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinicNavigation.overview.map((item) => (
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
          <SidebarGroupLabel>Patient Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinicNavigation.management.map((item) => (
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
          <SidebarGroupLabel>Staff Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinicNavigation.staff.map((item) => (
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
              {clinicNavigation.account.map((item) => (
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
