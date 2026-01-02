// api.ts
// Handles login API requests for Clinic App

// Base URL for backend API
const BASE_URL = "http://13.48.192.110:8000";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const body = new URLSearchParams();
    body.append("grant_type", "password"); // ✅ required by backend
    body.append("username", email); // API expects "username"
    body.append("password", password);
    body.append("scope", "");
    body.append("client_id", "");
    body.append("client_secret", "");

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ===============================
// USER MANAGEMENT TYPES
// ===============================

export interface Patient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  specialist_in?: string;
  department?: string;
  qualification?: string[];
  // is_active: boolean;
}

export interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===============================
// PATIENT MANAGEMENT APIs
// ===============================

/**
 * Get all patients. Requires authentication.
 */
export async function getPatients(options: {
  accessToken: string;
}): Promise<Patient[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/patients/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch patients: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as Patient[];
}

/**
 * Get a specific patient by ID. Requires authentication.
 */
export async function getPatient(
  patientId: number,
  options: { accessToken: string }
): Promise<Patient> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/patients/${patientId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch patient: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Patient;
}

// ** NEW API FUNCTION FOR PATIENT REGISTRATION **
export interface RegisterPatientPayload {
  email: string;
  role: string; // Fixed role for patient registration
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
}

/**
 * Registers a new patient.
 * This function assumes a staff member is logged in and performing the registration.
 */
export async function registerPatient(
  payload: RegisterPatientPayload,
  options: { accessToken: string }
): Promise<Patient> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  // Assumes a new API endpoint for staff-led patient registration
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register patient: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Patient;
}

// ===============================
// DOCTOR MANAGEMENT APIs
// ===============================

/**
 * Get all doctors. Requires authentication.
 */
export async function getDoctors(options: {
  accessToken: string;
}): Promise<Doctor[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/doctors/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch doctors: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Doctor[];
}

/**
 * Get a specific doctor by ID. Requires authentication.
 */
export async function getDoctor(
  doctorId: number,
  options: { accessToken: string }
): Promise<Doctor> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/doctors/${doctorId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch doctor: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Doctor;
}

/**
 * Fetch slots for a specific doctor (patient or clinic). 
 */
export async function getDoctorSlots(
  doctorId: number,
  options: { accessToken: string; role: string }
): Promise<ChannelingSlot[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  const role = options?.role?.toLowerCase();
  if (role !== "staff" && role !== "patient") {
    throw new Error("Only clinic staff or patients can view slots");
  }

  const url = `${BASE_URL}/channeling/slots/${doctorId}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${options.accessToken}`
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor slots: ${response.status} ${responseText}`);
    }

    try {
      const jsonData = JSON.parse(responseText);
      return jsonData as ChannelingSlot[];
    } catch (parseError) {
      throw new Error(`Response is not valid JSON. Got: ${responseText.substring(0, 100)}...`);
    }

  } catch (fetchError) {
    console.error("❌ Fetch error:", fetchError);
    throw fetchError;
  }
}

// ===============================
// STAFF MANAGEMENT APIs
// ===============================

/**
 * Get all staff members. Requires authentication.
 */
export async function getStaffs(options: {
  accessToken: string;
}): Promise<Staff[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/staffs/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch staff: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Staff[];
}

/**
 * Get a specific staff member by ID. Requires authentication.
 */
export async function getStaff(
  staffId: number,
  options: { accessToken: string }
): Promise<Staff> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/users/staffs/${staffId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch staff member: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as Staff;
}

// ===============================
// EXISTING APPOINTMENT/SLOT APIs
// ===============================

export type SlotStatus = "Available" | "Booked" | "Cancelled" | "CONFIRM"; // Added CONFIRM to match backend

export interface ChannelingSlot { // Renamed for clarity; this is slot data
  id: number;
  unique_id: string;
  doctor_id: number;
  slot_date_time: string;
  status: SlotStatus;
  ticket_count: number;
  created_by: number;
  remainingTickets: number;
  room_no: string;
}

export interface ActualReservation { // NEW: Matches actual /reservations response
  id: number;
  reference_no: string;
  slot_id: number;
  patient_id: number;
  ticket_no: number;
  status: string;
  created_at: string;
}

export interface createSlotPayload {
  doctor_id: number;
  slot_date_time: string; // ISO datetime string
  status: SlotStatus;
  ticket_count: number;
  created_by: number; // user id of clinic staff
  room_no: string;
}

/**
 * Creates an appointment slot. Only clinic staff are allowed.
 */
export async function createSlot(
  payload: createSlotPayload,
  options: { accessToken: string; role: string }
): Promise<ChannelingSlot> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  if (options?.role?.toLowerCase() !== "staff") {
    throw new Error("Only clinic staff can create appointments");
  }

  const response = await fetch(`${BASE_URL}/channeling/slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create slot: ${response.status} ${errorText}`);
  }

  return (await response.json()) as ChannelingSlot;
}

/**
 * Fetch slots (patient or clinic). Patients can view available slots;
 * clinic staff can view all slots.
 */
export async function getSlots(options: {
  accessToken: string;
  role: string;
}): Promise<ChannelingSlot[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  const role = options?.role?.toLowerCase();
  if (role !== "staff" && role !== "patient") {
    throw new Error("Only clinic staff or patients can view slots");
  }

  const url = `${BASE_URL}/channeling/slots`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
    });

    // Get the raw response text first
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch slots: ${response.status} ${responseText}`
      );
    }

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(responseText);
      return jsonData as ChannelingSlot[];
    } catch (parseError) {
      throw new Error(
        `Response is not valid JSON. Got: ${responseText.substring(0, 100)}...`
      );
    }
  } catch (fetchError) {
    console.error("❌ Fetch error:", fetchError);
    throw fetchError;
  }
}

/**
 * Fetch all appointment reservations. Restricted to clinic staff.
 * Updated to use ActualReservation type.
 */
export async function getReservations(options: {
  accessToken: string;
  role: string;
}): Promise<ActualReservation[]> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  if (options?.role?.toLowerCase() !== "staff") {
    throw new Error("Only clinic staff can view appointments");
  }

  const response = await fetch(`${BASE_URL}/reservations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch appointments: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as ActualReservation[];
}

// Reservation types and API
export interface CreateReservationPayload {
  slot_id: number;
  patient_id: number;
  status: string;
  prescription_url?: string;
  is_reports?: boolean;
}

/**
 * Patients reserve a slot.
 */
export async function createReservation(
  payload: CreateReservationPayload,
  options: { accessToken: string; role: string }
): Promise<ActualReservation> { // Updated type
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  if (options?.role?.toLowerCase() !== "patient") {
    throw new Error("Only patients can create reservations");
  }

  const response = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create reservation: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as ActualReservation;
}

// ===============================
// AI CHAT APIs
// ===============================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  patient_id: number;
  message: string;
}

export interface ChatResponse {
  answer: string;
  timestamp: string;
}

export interface PatientSummaryResponse {
  summary: string;
}

/**
 * Chat with AI about a patient's history
 */
export async function chatWithPatientHistory(
  payload: ChatRequest,
  options: { accessToken: string; role: string }
): Promise<ChatResponse> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  if (options?.role?.toLowerCase() !== "doctor") {
    throw new Error("Only doctors can chat with AI");
  }

  // Construct URL with query parameter
  const url = new URL(`${BASE_URL}/doctor/ai/chat/${payload.patient_id}`);
  url.searchParams.append("message", payload.message );

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
    // No body needed since message is now a query parameter
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to chat with AI: ${response.status} ${errorText}`);
  }

  return (await response.json()) as ChatResponse;
}

/**
 * Get AI summary of patient history
 */
export async function summarizePatientHistory(
  patientId: number,
  options: { accessToken: string; role: string }
): Promise<PatientSummaryResponse> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }
  if (options?.role?.toLowerCase() !== "doctor") {
    throw new Error("Only doctors can get AI summaries");
  }

  const response = await fetch(`${BASE_URL}/doctor/ai/summarize/${patientId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get patient summary: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as PatientSummaryResponse;
}

// Optional alias for clarity for staff usage
export const createChannelSlot = createSlot;

// ===============================
// PROFILE MANAGEMENT APIs
// ===============================

export interface Profile {
  id: number;
  unique_id: string;
  email: string;
  role: "patient" | "doctor" | "staff";
  first_name: string | null;
  last_name: string | null;
  contact_no: string | null;
  blood_type: string | null;
  allergies_history: string | null;
  previous_diseases_history: string | null;
  specialist_in: string | null;
  image: string | null;
}

export interface CreateProfilePayload {
  email?: string; 
  first_name?: string;
  last_name?: string;
  contact_no?: string;
  blood_type?: string;
  allergies_history?: string;
  previous_diseases_history?: string;
  specialist_in?: string;
  image?: string;
}

export interface UpdateProfilePayload extends CreateProfilePayload {}

/**
 * Get the logged-in user's own profile
 */
export async function getOwnProfile(options: { accessToken: string }): Promise<Profile> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/profiles/own`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  });

  const errorText = !response.ok ? await response.text() : "";

  console.log("📢 getOwnProfile response", {
    status: response.status,
    ok: response.ok,
    body: errorText,
  });

  if (response.status === 404) {
    throw new Error("Profile not found");
  }

  // 🔑 Handle your backend's broken 500 response
  if (response.status === 500 && errorText.includes("Internal server error")) {
    throw new Error("Profile not found");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Profile;
}

/**
 * Create a new profile for the logged-in user
 */
export async function createProfile(
  payload: CreateProfilePayload,
  options: { accessToken: string }
): Promise<Profile> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create profile: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Profile;
}

/**
 * Update the logged-in user's profile
 */
export async function updateProfile(
  payload: UpdateProfilePayload,
  options: { accessToken: string }
): Promise<Profile> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch(`${BASE_URL}/profiles`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Profile;
}

/**
 * Upload a profile image for a given user.
 * STAFF and SUPER_USER can upload for any user; others can only upload for themselves.
 */
export async function uploadProfileImage(
  userId: number,
  file: File,
  options: { accessToken: string; role: string }
): Promise<{ image_url: string }> {
  if (!options?.accessToken) {
    throw new Error("Missing access token");
  }

  const formData = new FormData();
  formData.append("file", file); // Changed from "image" to "file" to match backend expectation

  const response = await fetch(`${BASE_URL}/profiles/upload-image/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload profile image: ${response.status} ${errorText}`);
  }

  return await response.json();
}