"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Download,
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { profile, loading, loadProfile, updateProfile, completionStatus } =
    useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [applicationCount, setApplicationCount] = useState(0);
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

  // Lifecycle Effects
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
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
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
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
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
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {isNewProfile && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-900">
              Welcome! Let&apos;s create your profile
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Complete your profile to unlock all features.
            </p>
          </div>
        )}

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
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
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {isEditing && editingSection === "personal" && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white border-2 border-white"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Camera className="h-4 w-4" />
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

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-base text-blue-600 font-medium mb-3">
                  {profile?.profession || "No profession set"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile?.city && profile?.country
                      ? `${profile.city}, ${profile.country}`
                      : "Location not set"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {completionStatus && (
                  <Badge
                    variant={
                      completionStatus.completion_percentage >= 80
                        ? "default"
                        : "secondary"
                    }
                    className="px-3 py-1 text-sm font-medium"
                  >
                    {Math.round(completionStatus.completion_percentage)}%
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(activeTab)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              {/* Tab Navigation */}
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex overflow-x-auto gap-2 -mb-px scrollbar-hide">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                            isActive
                              ? "text-blue-600 border-blue-600"
                              : "text-gray-600 hover:text-gray-900 border-transparent"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Desktop Save/Cancel Buttons */}
                  {isEditing && editingSection === activeTab && (
                    <div className="hidden lg:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancel}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={save}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent
                className={`p-6 ${isEditing ? "pb-20 lg:pb-6" : ""}`}
              >
                {/* PERSONAL TAB */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    {isEditing && editingSection === "personal" ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1 mb-1.5">
                              First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-1 mb-1.5">
                              Last Name <span className="text-red-500">*</span>
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
                            <Label className="flex items-center gap-1 mb-1.5">
                              Phone Number{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+256..."
                            />
                          </div>
                          <div>
                            <Label className="mb-1.5">Date of Birth</Label>
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
                            <Label className="mb-1.5">City</Label>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="mb-1.5">Country</Label>
                            <Input
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="mb-1.5">Gender</Label>
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
                          <Label className="mb-1.5">Marital Status</Label>
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
                      </div>
                    ) : (
                      <>
                        {!profile?.phone &&
                        !profile?.date_of_birth &&
                        !profile?.gender ? (
                          <div className="text-center py-12">
                            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm text-gray-600 mb-4">
                              Add your personal information
                            </p>
                            <Button
                              onClick={() => startEdit("personal")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Phone Number
                              </p>
                              <p className="font-medium text-gray-900">
                                {profile?.phone || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Date of Birth
                              </p>
                              <p className="font-medium text-gray-900">
                                {profile?.date_of_birth || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Location
                              </p>
                              <p className="font-medium text-gray-900">
                                {profile?.city && profile?.country
                                  ? `${profile.city}, ${profile.country}`
                                  : "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Gender
                              </p>
                              <p className="font-medium text-gray-900 capitalize">
                                {profile?.gender
                                  ?.replace(/_/g, " ")
                                  .toLowerCase() || "Not provided"}
                              </p>
                            </div>
                            {profile?.marital_status && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Marital Status
                                </p>
                                <p className="font-medium text-gray-900 capitalize">
                                  {profile.marital_status.toLowerCase()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* PROFESSIONAL TAB */}
                {activeTab === "professional" && (
                  <div className="space-y-6">
                    {isEditing && editingSection === "professional" ? (
                      <div className="space-y-5">
                        <div>
                          <Label className="flex items-center gap-1 mb-1.5">
                            Profession <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="profession"
                            value={formData.profession}
                            onChange={handleInputChange}
                            placeholder="e.g. Nurse, Driver, Developer"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1 mb-1.5">
                              Employment Status{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <select
                              name="employment_status"
                              value={formData.employment_status}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="EMPLOYED">Employed</option>
                              <option value="UNEMPLOYED">
                                Looking for Work
                              </option>
                              <option value="STUDENT">Student</option>
                              <option value="FREELANCER">Freelancer</option>
                            </select>
                          </div>
                          <div>
                            <Label className="mb-1.5">Experience Level</Label>
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
                          <Label className="mb-1.5">Professional Bio</Label>
                          <Textarea
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about your experience..."
                          />
                        </div>

                        <div>
                          <Label className="mb-1.5">LinkedIn URL</Label>
                          <Input
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {!profile?.profession && !profile?.employment_status ? (
                          <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm text-gray-600 mb-4">
                              Add your professional information
                            </p>
                            <Button
                              onClick={() => startEdit("professional")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Employment Status
                                </p>
                                <p className="font-medium text-gray-900 capitalize">
                                  {profile?.employment_status
                                    ?.replace(/_/g, " ")
                                    .toLowerCase() || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Experience Level
                                </p>
                                <p className="font-medium text-gray-900">
                                  {profile?.experience_level || "Not provided"}
                                </p>
                              </div>
                            </div>

                            {profile?.bio && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">
                                  Professional Bio
                                </p>
                                <p className="text-sm leading-relaxed text-gray-700">
                                  {profile.bio}
                                </p>
                              </div>
                            )}

                            {profile?.linkedin_url && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">
                                  LinkedIn
                                </p>
                                <a
                                  href={profile.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium"
                                >
                                  <Globe className="h-4 w-4" />
                                  View LinkedIn Profile
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* SKILLS & DOCS TAB */}
                {activeTab === "skills" && (
                  <div className="space-y-8">
                    {/* Skills Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        Skills & Expertise
                      </h3>

                      {isEditing && editingSection === "skills" ? (
                        <div>
                          <Label className="mb-1.5">
                            Skills (comma-separated)
                          </Label>
                          <Textarea
                            name="skills"
                            rows={4}
                            value={formData.skills}
                            onChange={handleInputChange}
                            placeholder="e.g. Nursing, Driving License B, Excel, Customer Service..."
                            className="resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          {!profile?.skills || profile.skills.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                              <Award className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm text-gray-600 mb-4">
                                Add your skills to stand out
                              </p>
                              <Button
                                onClick={() => startEdit("skills")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Add Skills
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map(
                                (skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5"
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Resume Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Resume / CV
                      </h3>

                      {isEditing && editingSection === "skills" ? (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(e, "resume")}
                              className="hidden"
                            />
                            <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                            <Button
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById("resume-upload")
                                  ?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {profile?.resume
                                ? "Replace Resume"
                                : "Upload Resume"}
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                              PDF, DOC, DOCX (max 5MB)
                            </p>

                            {files.resume && (
                              <p className="mt-3 text-sm font-medium text-green-600">
                                Selected: {files.resume.name}
                              </p>
                            )}
                          </div>

                          {profile?.resume && !files.resume && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {profile.resume
                                    .split("/")
                                    .pop()
                                    ?.split("-")
                                    .pop() || "Resume.pdf"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(profile.resume!, "_blank")
                                }
                                className="text-blue-600"
                              >
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {!profile?.resume ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm text-gray-600 mb-4">
                                Upload your resume to get noticed
                              </p>
                              <Button
                                onClick={() => startEdit("skills")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Upload Resume
                              </Button>
                            </div>
                          ) : (
                            <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Resume Uploaded
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {profile.resume
                                        .split("/")
                                        .pop()
                                        ?.split("-")
                                        .pop() || "Resume.pdf"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(profile.resume!, "_blank")
                                    }
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const a = document.createElement("a");
                                      a.href = profile.resume!;
                                      a.download = "resume.pdf";
                                      a.click();
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Profile Insights */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Profile Strength Card */}
              <Card>
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center mb-3">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#2563eb"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            36 *
                            (1 -
                              (completionStatus?.completion_percentage || 0) /
                                100)
                          }`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            completionStatus?.completion_percentage || 0
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Profile Strength
                    </h3>
                    <p className="text-xs text-gray-600">
                      {(completionStatus?.completion_percentage ?? 0) === 100
                        ? "Your profile is complete!"
                        : (completionStatus?.completion_percentage ?? 0) >= 80
                        ? "Almost there!"
                        : (completionStatus?.completion_percentage ?? 0) >= 50
                        ? "Keep going!"
                        : "Let's build your profile"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Tips */}
              {completionStatus &&
                completionStatus.completion_percentage < 100 && (
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Profile Tips
                      </h3>
                      <div className="space-y-3">
                        {completionStatus.missing_fields
                          .slice(0, 2)
                          .map((field, i) => (
                            <div
                              key={i}
                              className="text-xs text-gray-600 flex items-start gap-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                              <span className="capitalize">
                                Add your {field.replace(/_/g, " ")}
                              </span>
                            </div>
                          ))}
                        {completionStatus.completion_percentage < 80 && (
                          <Button
                            size="sm"
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            onClick={() => {
                              const first = completionStatus.missing_fields[0];
                              if (
                                first?.includes("profession") ||
                                first?.includes("employment")
                              )
                                startEdit("professional");
                              else if (
                                first?.includes("phone") ||
                                first?.includes("personal")
                              )
                                startEdit("personal");
                              else startEdit("skills");
                            }}
                          >
                            Complete Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        </div>

        {/* Mobile Save/Cancel Bar */}
        {isEditing && editingSection === activeTab && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex gap-3">
              <Button
                onClick={save}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={cancel}
                className="flex-1 border-gray-300"
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
