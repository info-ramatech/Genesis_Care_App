import { Calendar, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import patientImage from "@/assets/patient-image.png";
// import { useNavigate } from "react-router-dom";

interface PatientMetrics {
  upcomingAppointments: number;
  completedVisits: number;
  pendingReports: number;
  totalReservations: number;
}

interface PatientInfo {
  name: string;
  patientId: string;
  lastVisit: string;
  nextAppointment: string;
}

interface PatientSectionCardsProps {
  metrics: PatientMetrics;
  patientInfo: PatientInfo;
}

export function PatientSectionCards({
  metrics,
  patientInfo,
}: PatientSectionCardsProps) {
  // const navigate = useNavigate();
  const cards = [
    {
      title: "Upcoming Appointments",
      value: metrics.upcomingAppointments.toString(),
      description: "Scheduled visits",
      icon: Calendar,
      trend: `Next: ${new Date(
        patientInfo.nextAppointment
      ).toLocaleDateString()}`,
    },
    {
      title: "Completed Visits",
      value: metrics.completedVisits.toString(),
      description: "Total consultations",
      icon: CheckCircle,
      trend: `Last: ${new Date(patientInfo.lastVisit).toLocaleDateString()}`,
    },
    {
      title: "Pending Reports",
      value: metrics.pendingReports.toString(),
      description: "Awaiting results",
      icon: AlertTriangle,
      trend: "Check regularly",
    },
    {
      title: "Total Reservations",
      value: metrics.totalReservations.toString(),
      description: "All time bookings",
      icon: FileText,
      trend: "Medical history",
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      {/* Hero / Welcome Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-[#c8a8ad] border">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 p-6">
          <div>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight flex text-white">
              Good Morning, {patientInfo.name}
            </h2>
            <p className="mt-2 text-sm flex text-white">
              Have a nice day at the clinic. Here’s a quick overview of your
              appointments and records.
            </p>
            {/* <div className="mt-4 flex gap-2">
              <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow hover:opacity-90"
                onClick={() => navigate("../../pages/patient-pages/patient-appointments")} >
                Book Appointment
              </button>
            </div> */}
          </div>
          {/* <div className="hidden md:block">
            <img
              src={patientImage}
              alt="Friendly clinic welcome image"
              className="h-40 w-[40%] object-contain ml-auto"
            />
          </div> */}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                {card.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
