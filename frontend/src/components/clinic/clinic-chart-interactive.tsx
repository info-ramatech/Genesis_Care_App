import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Mock data for appointment trends
const appointmentData = [
  { month: "Jan", appointments: 186, newPatients: 45 },
  { month: "Feb", appointments: 205, newPatients: 52 },
  { month: "Mar", appointments: 237, newPatients: 48 },
  { month: "Apr", appointments: 273, newPatients: 61 },
  { month: "May", appointments: 209, newPatients: 55 },
  { month: "Jun", appointments: 214, newPatients: 49 },
  { month: "Jul", appointments: 234, newPatients: 58 },
  { month: "Aug", appointments: 256, newPatients: 62 },
  { month: "Sep", appointments: 278, newPatients: 67 },
  { month: "Oct", appointments: 293, newPatients: 71 },
  { month: "Nov", appointments: 312, newPatients: 74 },
  { month: "Dec", appointments: 328, newPatients: 78 }
]

const chartConfig = {
  appointments: {
    label: "Total Appointments",
    color: "hsl(var(--chart-1))",
  },
  newPatients: {
    label: "New Patients",
    color: "hsl(var(--chart-2))",
  },
}

export function ClinicChartInteractive() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
        <CardDescription>
          Monthly appointment and new patient registration data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={appointmentData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="var(--color-appointments)"
                fill="var(--color-appointments)"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newPatients"
                stroke="var(--color-newPatients)"
                fill="var(--color-newPatients)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Appointments up by 12.5% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - December 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}