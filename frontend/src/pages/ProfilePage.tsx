import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  UserCheck,
  Heart,
  AlertTriangle,
  FileText,
  Stethoscope,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getOwnProfile,
  createProfile,
  updateProfile,
  uploadProfileImage,
  type Profile,
  type CreateProfilePayload,
} from "../lib/api";

export default function ProfileManagement() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (removed image from formData since it's handled separately)
  const [formData, setFormData] = useState<CreateProfilePayload>({
    first_name: "",
    last_name: "",
    contact_no: "",
    blood_type: "",
    allergies_history: "",
    previous_diseases_history: "",
    specialist_in: "",
    image: "", // No longer needed as a base64 string
  });

  // Track uploaded image file
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const BASE_URL = "http://13.48.192.110:8000";

  // Get auth data
  const getAuthData = () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const role = (localStorage.getItem("role") || "").toLowerCase();
      return { token, role };
    } catch (error) {
      return { token: "", role: "" };
    }
  };

  // Load profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      const { token } = getAuthData();

      if (!token) {
        setError("Unauthorized. Please login.");
        setLoading(false);
        return;
      }

      try {
        const profileData = await getOwnProfile({ accessToken: token });
        console.log("Fetched profile data:", profileData.image);''
        setProfile(profileData);
        setHasProfile(true);
        // Populate form with existing data
        setFormData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          contact_no: profileData.contact_no || "",
          blood_type: profileData.blood_type || "",
          allergies_history: profileData.allergies_history || "",
          previous_diseases_history: profileData.previous_diseases_history || "",
          specialist_in: profileData.specialist_in || "",
          image: "http://13.48.192.110:8000"+ "/" + profileData.image || "",
        });
      } catch (err: any) {
        const message = err?.message?.toLowerCase() || "";

        if (message.includes("profile not found")) {
          setHasProfile(false);
          setIsEditing(true); // start in edit mode
          setError(null); // ✅ don't show red banner
        } else {
          setError(err?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (
    field: keyof CreateProfilePayload,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file); // Store the File object
      // Preview the image (optional, for UI feedback)
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile((prev) =>
          prev ? { ...prev, image: e.target?.result as string } : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save (including image upload)
  const handleSave = async () => {
    const { token, role } = getAuthData();

    if (!token) {
      setError("Unauthorized access");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const email = localStorage.getItem("email") || "";

      // Pick only allowed fields based on role
      const roleFields = getRoleFields(role);
      const filteredData = roleFields.reduce((acc, field) => {
        const key = field as keyof CreateProfilePayload;
        acc[key] = formData[key] || "";
        return acc;
      }, {} as Partial<CreateProfilePayload>);

      // Add email to payload
      const payload: CreateProfilePayload = { ...filteredData, email };

      let updatedProfile: Profile;

      if (hasProfile) {
        updatedProfile = await updateProfile(payload, { accessToken: token });
        setSuccess("Profile updated successfully!");
      } else {
        updatedProfile = await createProfile(payload, { accessToken: token });
        setHasProfile(true);
        setSuccess("Profile created successfully!");
      }

      // Upload image only if selected and updatedProfile.id is available
      if (uploadedImage && updatedProfile.id) {
        const imageResponse = await uploadProfileImage(
          updatedProfile.id,
          uploadedImage,
          { accessToken: token, role }
        );
        updatedProfile = { ...updatedProfile, image: imageResponse.image_url }; // Update with new image URL
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setUploadedImage(null); // Clear uploaded image after success
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Get role-specific fields
  const getRoleFields = (role: string) => {
    const commonFields = ["first_name", "last_name", "contact_no"];

    switch (role) {
      case "patient":
        return [
          ...commonFields,
          "blood_type",
          "allergies_history",
          "previous_diseases_history",
        ];
      case "doctor":
        return [...commonFields, "specialist_in"];
      case "clinic":
        return commonFields;
      default:
        return commonFields;
    }
  };

  // Get field configuration
  const getFieldConfig = (field: string) => {
    const configs: Record<
      string,
      {
        label: string;
        icon: any;
        type: string;
        placeholder: string;
        options?: string[];
      }
    > = {
      first_name: {
        label: "First Name",
        icon: User,
        type: "input",
        placeholder: "Enter your first name",
      },
      last_name: {
        label: "Last Name",
        icon: User,
        type: "input",
        placeholder: "Enter your last name",
      },
      contact_no: {
        label: "Contact Number",
        icon: Phone,
        type: "input",
        placeholder: "Enter your phone number",
      },
      blood_type: {
        label: "Blood Type",
        icon: Heart,
        type: "select",
        placeholder: "Select your blood type",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      allergies_history: {
        label: "Allergies History",
        icon: AlertTriangle,
        type: "textarea",
        placeholder: "List any known allergies...",
      },
      previous_diseases_history: {
        label: "Previous Diseases",
        icon: FileText,
        type: "textarea",
        placeholder: "List any previous diseases or conditions...",
      },
      specialist_in: {
        label: "Specialization",
        icon: Stethoscope,
        type: "input",
        placeholder: "Enter your medical specialization",
      },
    };
    return (
      configs[field] || {
        label: field,
        icon: User,
        type: "input",
        placeholder: "",
      }
    );
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  const { role } = getAuthData();
  const roleFields = getRoleFields(role);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-blue-500" />
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information and settings
          </p>
        </div>
        {hasProfile && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.image || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(
                      formData.first_name || profile?.first_name,
                      formData.last_name || profile?.last_name
                    )}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {formData.first_name || profile?.first_name || "No Name"}{" "}
                  {formData.last_name || profile?.last_name || ""}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {profile?.role || role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {profile?.unique_id}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.email}</span>
            </div>
            {(formData.contact_no || profile?.contact_no) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.contact_no || profile?.contact_no}</span>
              </div>
            )}
            {role === "doctor" &&
              (formData.specialist_in || profile?.specialist_in) && (
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formData.specialist_in || profile?.specialist_in}
                  </span>
                </div>
              )}
            {role === "patient" &&
              (formData.blood_type || profile?.blood_type) && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Blood Type: {formData.blood_type || profile?.blood_type}
                  </span>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {hasProfile
                ? isEditing
                  ? "Edit Profile"
                  : "Profile Information"
                : "Create Your Profile"}
            </CardTitle>
            <CardDescription>
              {hasProfile
                ? "Update your personal information below"
                : "Complete your profile to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleFields.map((field) => {
                  const config = getFieldConfig(field);
                  const Icon = config.icon;

                  return (
                    <div
                      key={field}
                      className={
                        config.type === "textarea" ? "md:col-span-2" : ""
                      }
                    >
                      <Label
                        htmlFor={field}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </Label>

                      {config.type === "select" ? (
                        <Select
                          value={
                            formData[field as keyof CreateProfilePayload] || ""
                          }
                          onValueChange={(value) =>
                            handleInputChange(
                              field as keyof CreateProfilePayload,
                              value
                            )
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={config.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {config.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : config.type === "textarea" ? (
                        <Textarea
                          id={field}
                          value={
                            formData[field as keyof CreateProfilePayload] || ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              field as keyof CreateProfilePayload,
                              e.target.value
                            )
                          }
                          placeholder={config.placeholder}
                          disabled={!isEditing}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field}
                          type="text"
                          value={
                            formData[field as keyof CreateProfilePayload] || ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              field as keyof CreateProfilePayload,
                              e.target.value
                            )
                          }
                          placeholder={config.placeholder}
                          disabled={!isEditing}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  {hasProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {hasProfile ? "Update Profile" : "Create Profile"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Information Cards */}
      {role === "patient" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {(formData.allergies_history || profile?.allergies_history) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {formData.allergies_history ||
                    profile?.allergies_history ||
                    "No allergies recorded"}
                </p>
              </CardContent>
            </Card>
          )}

          {(formData.previous_diseases_history ||
            profile?.previous_diseases_history) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {formData.previous_diseases_history ||
                    profile?.previous_diseases_history ||
                    "No previous diseases recorded"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}