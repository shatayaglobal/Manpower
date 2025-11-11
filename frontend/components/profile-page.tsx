"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Briefcase,
  Upload,
  FileText,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Globe,
  Award,
  CheckCircle,
} from "lucide-react";
import { useProfile } from "@/lib/redux/useProfile";
import type { RootState } from "@/lib/redux/store";
import Image from "next/image";
import imageCompression from "browser-image-compression";

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  country: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  profession: string;
  employment_status: string;
  experience_level: string;
  bio: string;
  linkedin_url: string;
  expected_salary_min: string;
  expected_salary_max: string;
  salary_currency: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  skills: string;
}

/* ------------------------------------------------------------------ */
/*                         MAIN COMPONENT                              */
/* ------------------------------------------------------------------ */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    profile,
    loading,
    loadProfile,
    updateProfile,
    completionStatus,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState<FormData>({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: "",
    city: "",
    country: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    profession: "",
    employment_status: "",
    experience_level: "",
    bio: "",
    linkedin_url: "",
    expected_salary_min: "",
    expected_salary_max: "",
    salary_currency: "UGX",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    skills: "",
  });
  const [files, setFiles] = useState({
    avatar: null as File | null,
    resume: null as File | null,
  });

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "skills", label: "Skills & Docs", icon: Award },
  ];

  /* ------------------------------------------------------------------ */
  /*                         LIFECYCLE                                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [isAuthenticated, user, router, loadProfile]);

  useEffect(() => {
    if (!loading) {
      const empty =
        !profile?.phone &&
        !profile?.profession &&
        !profile?.bio &&
        (!profile?.skills || profile.skills.length === 0);
      setIsNewProfile(empty);
    }
  }, [profile, loading]);

  useEffect(() => {
    if (profile?.id) {
      if (completionStatus?.is_complete) {
        toast.success("Your profile is already complete!");
        router.push("/jobs");
        return;
      }

      setFormData({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: profile.phone || "",
        city: profile.city || "",
        country: profile.country || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        marital_status: profile.marital_status || "",
        profession: profile.profession || "",
        employment_status: profile.employment_status || "",
        experience_level: profile.experience_level || "",
        bio: profile.bio || "",
        linkedin_url: profile.linkedin_url || "",
        expected_salary_min: profile.expected_salary_min?.toString() || "",
        expected_salary_max: profile.expected_salary_max?.toString() || "",
        salary_currency: profile.salary_currency || "UGX",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relationship:
          profile.emergency_contact_relationship || "",
        skills: Array.isArray(profile.skills)
          ? profile.skills.join(", ")
          : "",
      });
    }
  }, [profile, completionStatus, user, router]);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "resume"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        const converted = new File([compressed], file.name, {
          type: compressed.type,
        });
        setFiles((prev) => ({ ...prev, avatar: converted }));
        toast.success("Image selected");
      } catch {
        toast.error("Error compressing image");
      }
    } else {
      setFiles((prev) => ({ ...prev, resume: file }));
    }
  };

  const startEdit = (section: string) => {
    setEditingSection(section);
    setIsEditing(true);
    setActiveTab(section);
  };

  const save = async () => {
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        ...formData,
        skills: skillsArray,
        expected_salary_min: formData.expected_salary_min
          ? parseFloat(formData.expected_salary_min)
          : null,
        expected_salary_max: formData.expected_salary_max
          ? parseFloat(formData.expected_salary_max)
          : null,
        ...files,
      };
      const ok = await updateProfile(payload);
      if (ok) {
        toast.success("Profile updated!");
        setIsEditing(false);
        setEditingSection(null);
        setFiles({ avatar: null, resume: null });
        await loadProfile();
      }
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setEditingSection(null);
    setFiles({ avatar: null, resume: null });
    // reset form to current profile values
    if (profile) {
      setFormData({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: profile.phone || "",
        city: profile.city || "",
        country: profile.country || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        marital_status: profile.marital_status || "",
        profession: profile.profession || "",
        employment_status: profile.employment_status || "",
        experience_level: profile.experience_level || "",
        bio: profile.bio || "",
        linkedin_url: profile.linkedin_url || "",
        expected_salary_min: profile.expected_salary_min?.toString() || "",
        expected_salary_max: profile.expected_salary_max?.toString() || "",
        salary_currency: profile.salary_currency || "UGX",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relationship:
          profile.emergency_contact_relationship || "",
        skills: Array.isArray(profile.skills)
          ? profile.skills.join(", ")
          : "",
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {isNewProfile && (
          <div className="mb-6 text-center sm:text-left">
            <p className="text-lg font-medium text-gray-800">
              Welcome! Let&apos;s create your profile
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Complete your profile to unlock all features.
            </p>
          </div>
        )}

        {/* ---------- PROFILE HEADER ---------- */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                  {files.avatar ? (
                    <Image
                      src={URL.createObjectURL(files.avatar)}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : profile?.avatar ? (
                    <Image
                      src={`${profile.avatar}?v=${Date.now()}`}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-12 w-12 text-blue-500" />
                    </div>
                  )}
                </div>

                {isEditing && editingSection === "personal" && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white shadow-md border-2 border-white"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "avatar")}
                  className="hidden"
                />
              </div>

              {/* Name + Profession */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-base text-blue-500">
                  {profile?.profession || "No profession set"}
                </p>
                <div className="mt-2 flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    {profile?.city && profile?.country
                      ? `${profile.city}, ${profile.country}`
                      : "Location not set"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Completion Badge + Edit */}
              <div className="flex items-center gap-2 sm:gap-3">
                {completionStatus && (
                  <Badge
                    variant={
                      completionStatus.completion_percentage >= 80
                        ? "default"
                        : "secondary"
                    }
                    className={
                      completionStatus.completion_percentage >= 80
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    {Math.round(completionStatus.completion_percentage)}%
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => startEdit(activeTab)}
                  className="text-blue-500 hover:bg-blue-50 border-gray-300"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-5">

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completionStatus && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Completion</span>
                        <span>{Math.round(completionStatus.completion_percentage)}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${completionStatus.completion_percentage}%` }}
                        />
                      </div>

                      {completionStatus.missing_fields.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">
                          Missing:{" "}
                          {completionStatus.missing_fields
                            .slice(0, 2)
                            .map((f) => f.replace(/_/g, " "))
                            .join(", ")}
                          {completionStatus.missing_fields.length > 2 &&
                            ` +${completionStatus.missing_fields.length - 2} more`}
                        </p>
                      )}

                      {completionStatus.completion_percentage < 50 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-center">
                          <p className="text-xs text-amber-600 mb-2">
                            Complete your profile for better matches!
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-blue-500"
                            onClick={() => {
                              const first = completionStatus.missing_fields[0];
                              if (first?.includes("profession") || first?.includes("employment"))
                                startEdit("professional");
                              else if (first?.includes("phone") || first?.includes("personal"))
                                startEdit("personal");
                              else startEdit("skills");
                            }}
                          >
                            Continue Setup
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="lg:col-span-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                {/* Tabs – scrollable on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex overflow-x-auto gap-2 pb-2 sm:pb-0 scrollbar-hide">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Edit button (only when NOT editing) */}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(activeTab)}
                      className="text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent
                className={`p-4 sm:p-6 overflow-y-auto ${
                  isEditing && editingSection === activeTab ? "pb-20 lg:pb-6" : ""
                }`}
              >
                {activeTab === "personal" && (
                  <div className="space-y-5">
                    {isEditing && editingSection === "personal" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              First Name <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-1">
                              Last Name <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              Phone <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label>Date of Birth</Label>
                            <Input
                              name="date_of_birth"
                              type="date"
                              value={formData.date_of_birth}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label>City</Label>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Input
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label>Gender</Label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                              <option value="PREFER_NOT_TO_SAY">
                                Prefer not to say
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label>Marital Status</Label>
                          <select
                            name="marital_status"
                            value={formData.marital_status}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="">Select</option>
                            <option value="SINGLE">Single</option>
                            <option value="MARRIED">Married</option>
                            <option value="DIVORCED">Divorced</option>
                            <option value="WIDOWED">Widowed</option>
                          </select>
                        </div>

                        {/* Desktop buttons */}
                        <div className="hidden lg:flex gap-3 pt-2">
                          <Button
                            onClick={save}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancel}
                            className="text-blue-500 border-gray-300"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!profile?.phone &&
                        !profile?.date_of_birth &&
                        !profile?.gender &&
                        !profile?.marital_status ? (
                          <div className="text-center py-8">
                            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm mb-3">
                              Add your personal information
                            </p>
                            <Button
                              onClick={() => startEdit("personal")}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="font-medium">
                                {profile?.phone || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Date of Birth
                              </p>
                              <p className="font-medium">
                                {profile?.date_of_birth || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Location</p>
                              <p className="font-medium">
                                {profile?.city && profile?.country
                                  ? `${profile.city}, ${profile.country}`
                                  : "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Gender</p>
                              <p className="font-medium">
                                {profile?.gender || "Not provided"}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ==================== PROFESSIONAL ==================== */}
                {activeTab === "professional" && (
                  <div className="space-y-5">
                    {isEditing && editingSection === "professional" ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-1">
                            Profession <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            name="profession"
                            value={formData.profession}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              Employment Status <span className="text-red-600">*</span>
                            </Label>
                            <select
                              name="employment_status"
                              value={formData.employment_status}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="EMPLOYED">Employed</option>
                              <option value="UNEMPLOYED">Looking for Work</option>
                              <option value="STUDENT">Student</option>
                              <option value="FREELANCER">Freelancer</option>
                            </select>
                          </div>
                          <div>
                            <Label>Experience Level</Label>
                            <select
                              name="experience_level"
                              value={formData.experience_level}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="ENTRY">Entry (0-2 yrs)</option>
                              <option value="JUNIOR">Junior (2-5 yrs)</option>
                              <option value="MID">Mid (5-8 yrs)</option>
                              <option value="SENIOR">Senior (8+ yrs)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label>Professional Bio</Label>
                          <Textarea
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about your experience..."
                          />
                        </div>

                        <div>
                          <Label>LinkedIn URL</Label>
                          <Input
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>

                        {/* Desktop buttons */}
                        <div className="hidden lg:flex gap-3 pt-2">
                          <Button
                            onClick={save}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancel}
                            className="text-blue-500 border-gray-300"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!profile?.profession && !profile?.employment_status ? (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm mb-3">
                              Add your professional information
                            </p>
                            <Button
                              onClick={() => startEdit("professional")}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Employment Status
                              </p>
                              <p className="font-medium">
                                {profile?.employment_status || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Experience Level
                              </p>
                              <p className="font-medium">
                                {profile?.experience_level || "Not provided"}
                              </p>
                            </div>
                            {profile?.bio && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Professional Bio
                                </p>
                                <p className="text-sm leading-relaxed">
                                  {profile.bio}
                                </p>
                              </div>
                            )}
                            {profile?.linkedin_url && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  LinkedIn
                                </p>
                                <a
                                  href={profile.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                                >
                                  <Globe className="h-4 w-4" />
                                  {profile.linkedin_url}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ==================== SKILLS & DOCS ==================== */}
                {activeTab === "skills" && (
                  <div className="space-y-6">
                    {/* ---- Skills ---- */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Skills</h3>
                      {isEditing && editingSection === "skills" ? (
                        <div>
                          <Label>Skills (comma-separated)</Label>
                          <Textarea
                            name="skills"
                            rows={3}
                            value={formData.skills}
                            onChange={handleInputChange}
                            placeholder="JavaScript, React, Python..."
                          />
                        </div>
                      ) : (
                        <>
                          {!profile?.skills ||
                          (Array.isArray(profile.skills) && profile.skills.length === 0) ? (
                            <div className="text-center py-6">
                              <Award className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm mb-3">Add your skills</p>
                              <Button
                                onClick={() => startEdit("skills")}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                Add Skills
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((s: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="bg-blue-50 text-blue-600 border-blue-200"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ---- Documents ---- */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Documents</h3>
                      {isEditing && editingSection === "skills" ? (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(e, "resume")}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              onClick={() =>
                                document.getElementById("resume-upload")?.click()
                              }
                              className="text-blue-500"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {profile?.resume ? "Replace Resume" : "Upload Resume"}
                            </Button>
                            {files.resume && (
                              <p className="mt-2 text-sm text-green-600">
                                New: {files.resume.name}
                              </p>
                            )}
                          </div>

                          {profile?.resume && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-600">
                                  {profile.resume.split("/").pop()?.split("-").pop() ||
                                    "Resume"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(profile.resume!, "_blank")}
                                className="text-blue-500"
                              >
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {!profile?.resume ? (
                            <div className="text-center py-6">
                              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm mb-3">Upload your resume</p>
                              <Button
                                onClick={() => startEdit("skills")}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                Upload Now
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {profile.resume.split("/").pop()?.split("-").pop() ||
                                    "Resume"}
                                </span>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(profile.resume!, "_blank")}
                                  className="flex-1 sm:flex-initial text-blue-500"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const a = document.createElement("a");
                                    a.href = profile.resume!;
                                    a.download =
                                      profile.resume?.split("/").pop() || "resume";
                                    a.click();
                                  }}
                                  className="flex-1 sm:flex-initial text-blue-500 border-gray-300"
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Desktop buttons for skills section */}
                    {isEditing && editingSection === "skills" && (
                      <div className="hidden lg:flex gap-3 pt-2">
                        <Button
                          onClick={save}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancel}
                          className="text-blue-500 border-gray-300"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ---------- MOBILE STICKY ACTION BAR ---------- */}
        {isEditing && editingSection === activeTab && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
            <div className="max-w-6xl mx-auto flex gap-3">
              <Button
                onClick={save}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={cancel}
                className="flex-1 text-blue-500 border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
