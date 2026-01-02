import { Users, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DoctorMetrics {
  todaysPatients: number
  completedConsultations: number
  pendingReports: number
  upcomingAppointments: number
}

interface DoctorInfo {
  name: string
  specialization: string
  roomNo: string
  schedule: string
}

interface DoctorSectionCardsProps {
  metrics: DoctorMetrics
  doctorInfo: DoctorInfo
}

export function DoctorSectionCards({ metrics, doctorInfo }: DoctorSectionCardsProps) {
  const cards = [
    {
      title: "Today's Patients",
      value: metrics.todaysPatients.toString(),
      description: "Scheduled consultations",
      icon: Users,
      trend: `${metrics.completedConsultations}/${metrics.todaysPatients} completed`
    },
    {
      title: "Completed",
      value: metrics.completedConsultations.toString(), 
      description: "Consultations today",
      icon: CheckCircle,
      trend: "Good progress"
    },
    {
      title: "Pending Reports",
      value: metrics.pendingReports.toString(),
      description: "Require attention",
      icon: AlertCircle,
      trend: "Review needed"
    },
    {
      title: "Upcoming",
      value: metrics.upcomingAppointments.toString(),
      description: "Future appointments",
      icon: Calendar,
      trend: "This week"
    }
  ]

  return (
    <div className="px-4 lg:px-6">
      {/* Doctor Info Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Welcome back, {doctorInfo.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Specialization:</span>
              <div className="font-medium">{doctorInfo.specialization}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Room:</span>
              <div className="font-medium">{doctorInfo.roomNo}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Schedule:</span>
              <div className="font-medium">{doctorInfo.schedule}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
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