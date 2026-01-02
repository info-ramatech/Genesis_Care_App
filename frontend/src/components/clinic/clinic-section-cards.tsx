import { Users, Calendar, UserCheck, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClinicMetrics {
  totalPatients: number
  todaysAppointments: number
  availableDoctors: number
  pendingTasks: number
}

interface ClinicSectionCardsProps {
  metrics: ClinicMetrics
}

export function ClinicSectionCards({ metrics }: ClinicSectionCardsProps) {
  const cards = [
    {
      title: "Total Patients",
      value: metrics.totalPatients.toLocaleString(),
      description: "Registered in system",
      icon: Users,
      trend: "+12% from last month"
    },
    {
      title: "Today's Appointments",
      value: metrics.todaysAppointments.toString(),
      description: "Scheduled for today",
      icon: Calendar,
      trend: "3 pending confirmation"
    },
    {
      title: "Available Doctors",
      value: `${metrics.availableDoctors}/10`,
      description: "Currently on duty",
      icon: UserCheck,
      trend: "2 on break"
    },
    {
      title: "Pending Tasks",
      value: metrics.pendingTasks.toString(),
      description: "Require attention",
      icon: ClipboardList,
      trend: "-5 from yesterday"
    }
  ]

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {card.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}