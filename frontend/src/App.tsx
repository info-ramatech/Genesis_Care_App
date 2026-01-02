import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Dashboard components
import ClinicDashboard from "./pages/clinic-pages/clinic-dashboard";
import DoctorDashboard from "./pages/doctor-pages/doctor-dashboard";
import PatientDashboard from "./pages/patient-pages/patient-dashboard";

// Clinic page components
import PatientManagement from "./pages/clinic-pages/patients";
import AppointmentsManagement from "./pages/clinic-pages/appointments";
import DoctorsManagement from "./pages/clinic-pages/doctors";
import SlotsManagement from "./pages/clinic-pages/slots";
import AIChatInterface from "./pages/doctor-pages/ai-agent";
// Layout component for dashboard pages
import DashboardLayout from "./components/dashboard-layout";
import LoginPage from "./pages/LoginPage";
import ProfileManagement from "./pages/ProfilePage";
import PatientAppointments from "./pages/patient-pages/patient-appointments";

function App() {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Clinic Dashboard and Pages */}
      <Route path="/" element={<DashboardLayout userRole="clinic" />}>
        <Route index element={<ClinicDashboard />} />
        <Route path="dashboard" element={<ClinicDashboard />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="patients/add" element={<PatientManagement />} />
        <Route path="appointments" element={<AppointmentsManagement />} />
        <Route path="doctors" element={<DoctorsManagement />} />
        <Route path="/channeling/slots" element={<SlotsManagement />} />
        <Route path="doctors/availability" element={<DoctorsManagement />} />
        <Route path="profile" element={<ProfileManagement/>} />
        <Route path="reports" element={<div>Reports Page - Coming Soon</div>} />
        <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
      </Route>

      {/* Patient Dashboard and Pages */}
      <Route path="/patient" element={<DashboardLayout userRole="patient" />}>
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<div>My Appointments - Coming Soon</div>} />
        <Route path="book-appointment" element={<PatientAppointments/>} />
        <Route path="medical-history" element={<div>Medical History - Coming Soon</div>} />
        <Route path="test-results" element={<div>Test Results - Coming Soon</div>} />
        <Route path="profile" element={<ProfileManagement/>} />
      </Route>

      {/* Doctor Dashboard and Pages */}
      <Route path="/doctor" element={<DashboardLayout userRole="doctor" />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<div>Doctor Patient Records - Coming Soon</div>} />
        <Route path="appointments" element={<div>Doctor Appointments - Coming Soon</div>} />
        <Route path="medical-records" element={<div>Medical Records - Coming Soon</div>} />
        <Route path="lab-results" element={<div>Lab Results - Coming Soon</div>} />
        <Route path="ai" element={<AIChatInterface/>} />
        <Route path="profile" element={<ProfileManagement/>} />
        <Route path="schedule" element={<div>Doctor Schedule - Coming Soon</div>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;