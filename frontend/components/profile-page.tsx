"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
} from "lucide-react";
import { useProfile } from "@/lib/redux/useProfile";
import type { RootState } from "@/lib/redux/store";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";

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

const TABS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "skills", label: "Skills & Docs", icon: Award },
];

const selectStyle =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

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
  const [livePercentage, setLivePercentage] = useState<number | null>(null);
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

  const displayPercentage =
    livePercentage ?? Math.round(completionStatus?.completion_percentage || 0);

  const calculateLivePercentage = useCallback((): number => {
    let completed = 0;
    const checks = [
      user?.first_name?.trim(),
      user?.last_name?.trim(),
      formData.phone?.trim(),
      formData.bio?.trim(),
      formData.city?.trim(),
      formData.country?.trim(),
      formData.profession?.trim(),
      formData.employment_status,
      formData.experience_level,
      formData.skills?.trim(),
      formData.date_of_birth,
      formData.linkedin_url?.trim(),
      formData.expected_salary_min?.trim(),
      files.avatar || profile?.avatar,
      files.resume || profile?.resume,
      profile?.work_experience?.length,
      profile?.education?.length,
      profile?.languages?.length,
      profile?.certifications?.length,
    ];
    checks.forEach((c) => {
      if (c) completed++;
    });
    return Math.round((completed / 20) * 100);
  }, [user, formData, files, profile]);

  useEffect(() => {
    setLivePercentage(isEditing ? calculateLivePercentage() : null);
  }, [isEditing, calculateLivePercentage]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!loading) {
      setIsNewProfile(
        !profile?.phone &&
          !profile?.profession &&
          !profile?.bio &&
          (!profile?.skills || profile.skills.length === 0)
      );
    }
  }, [profile, loading]);

  useEffect(() => {
    if (profile?.id) {
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
  }, [profile, user]);

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
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        setFiles((prev) => ({
          ...prev,
          avatar: new File([compressed], file.name, { type: compressed.type }),
        }));
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
      const ok = await updateProfile({
        ...formData,
        skills: skillsArray,
        expected_salary_min: formData.expected_salary_min
          ? parseFloat(formData.expected_salary_min)
          : null,
        expected_salary_max: formData.expected_salary_max
          ? parseFloat(formData.expected_salary_max)
          : null,
        ...files,
      });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Profile strength color
  const strengthColor =
    displayPercentage >= 80
      ? "text-emerald-600"
      : displayPercentage >= 50
      ? "text-amber-500"
      : "text-blue-600";
  const strokeColor =
    displayPercentage >= 80
      ? "#10b981"
      : displayPercentage >= 50
      ? "#f59e0b"
      : "#2563eb";
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Welcome banner (new profile only) ── */}
        {isNewProfile && (
          <div className="bg-blue-600 rounded-2xl px-6 py-5 text-white">
            <p className="text-lg font-bold">
              Welcome! Let&apos;s build your profile 👋
            </p>
            <p className="text-blue-200 text-sm mt-0.5">
              Complete your profile to unlock all features and get noticed by
              employers.
            </p>
          </div>
        )}

        {/* ── Profile header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar — always clickable to change photo */}
            <div
              className="relative shrink-0 group cursor-pointer"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                {files.avatar ? (
                  <Image
                    src={URL.createObjectURL(files.avatar)}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : profile?.avatar ? (
                  <Image
                    src={`${profile.avatar}?v=${Date.now()}`}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                {/* Hover overlay — always visible on hover */}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              {/* Always-visible camera badge */}
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
                <Camera className="h-3.5 w-3.5" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "avatar")}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm font-semibold text-blue-600 mt-0.5">
                {profile?.profession || "No profession set"}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                {(profile?.city || profile?.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <div className="flex items-center gap-3 shrink-0">
              {completionStatus && (
                <span className={cn("text-sm font-bold", strengthColor)}>
                  {displayPercentage}%
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEdit(activeTab)}
                className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-9 px-4 rounded-xl"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid gap-5 lg:grid-cols-4">
          {/* ── Main content (3/4) ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 overflow-x-auto">
              <div className="flex gap-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-800"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Desktop save/cancel */}
              {isEditing && editingSection === activeTab && (
                <div className="hidden lg:flex items-center gap-2 shrink-0 pl-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancel}
                    disabled={loading}
                    className="border-gray-200 h-8 px-3 rounded-xl text-xs"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={save}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-xl text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            {/* Tab content */}
            <div className={cn("p-6", isEditing ? "pb-24 lg:pb-6" : "")}>
              {/* ── PERSONAL ── */}
              {activeTab === "personal" && (
                <div>
                  {isEditing && editingSection === "personal" ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            First Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Last Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+256..."
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Date of Birth
                          </Label>
                          <Input
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            City
                          </Label>
                          <Input
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Country
                          </Label>
                          <Input
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Gender
                          </Label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={selectStyle}
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
                      <div className="max-w-xs">
                        <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                          Marital Status
                        </Label>
                        <select
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleInputChange}
                          className={selectStyle}
                        >
                          <option value="">Select</option>
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED">Married</option>
                          <option value="DIVORCED">Divorced</option>
                          <option value="WIDOWED">Widowed</option>
                        </select>
                      </div>
                    </div>
                  ) : !profile?.phone &&
                    !profile?.date_of_birth &&
                    !profile?.gender ? (
                    <EmptySection
                      icon={<User className="h-8 w-8 text-gray-300" />}
                      title="Add personal information"
                      onEdit={() => startEdit("personal")}
                    />
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <InfoRow label="Phone" value={profile?.phone} />
                      <InfoRow
                        label="Date of Birth"
                        value={profile?.date_of_birth}
                      />
                      <InfoRow
                        label="Location"
                        value={
                          profile?.city && profile?.country
                            ? `${profile.city}, ${profile.country}`
                            : undefined
                        }
                      />
                      <InfoRow
                        label="Gender"
                        value={profile?.gender?.replace(/_/g, " ")}
                        capitalize
                      />
                      {profile?.marital_status && (
                        <InfoRow
                          label="Marital Status"
                          value={profile.marital_status}
                          capitalize
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeTab === "professional" && (
                <div>
                  {isEditing && editingSection === "professional" ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                          Profession <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="e.g. Nurse, Driver, Developer"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Employment Status{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <select
                            name="employment_status"
                            value={formData.employment_status}
                            onChange={handleInputChange}
                            className={selectStyle}
                          >
                            <option value="">Select</option>
                            <option value="EMPLOYED">Employed</option>
                            <option value="UNEMPLOYED">Looking for Work</option>
                            <option value="STUDENT">Student</option>
                            <option value="FREELANCER">Freelancer</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                            Experience Level
                          </Label>
                          <select
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleInputChange}
                            className={selectStyle}
                          >
                            <option value="">Select</option>
                            <option value="ENTRY">Entry (0–2 yrs)</option>
                            <option value="JUNIOR">Junior (2–5 yrs)</option>
                            <option value="MID">Mid (5–8 yrs)</option>
                            <option value="SENIOR">Senior (8+ yrs)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                          Professional Bio{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          name="bio"
                          rows={4}
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about your experience..."
                          className="rounded-xl border-gray-200 resize-none"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                          LinkedIn URL
                        </Label>
                        <Input
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/..."
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                  ) : !profile?.profession && !profile?.employment_status ? (
                    <EmptySection
                      icon={<Briefcase className="h-8 w-8 text-gray-300" />}
                      title="Add professional information"
                      onEdit={() => startEdit("professional")}
                    />
                  ) : (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <InfoRow
                          label="Employment Status"
                          value={profile?.employment_status?.replace(/_/g, " ")}
                          capitalize
                        />
                        <InfoRow
                          label="Experience Level"
                          value={profile?.experience_level}
                        />
                      </div>
                      {profile?.bio && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Bio
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {profile.bio}
                          </p>
                        </div>
                      )}
                      {profile?.linkedin_url && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
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
                </div>
              )}

              {/* ── SKILLS & DOCS ── */}
              {activeTab === "skills" && (
                <div className="space-y-8">
                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        Skills & Expertise
                      </h3>
                    </div>
                    {isEditing && editingSection === "skills" ? (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                          Skills (comma-separated)
                        </Label>
                        <Textarea
                          name="skills"
                          rows={3}
                          value={formData.skills}
                          onChange={handleInputChange}
                          placeholder="e.g. Nursing, Excel, Customer Service..."
                          className="rounded-xl border-gray-200 resize-none"
                        />
                      </div>
                    ) : !profile?.skills || profile.skills.length === 0 ? (
                      <EmptySection
                        icon={<Award className="h-8 w-8 text-gray-300" />}
                        title="Add your skills to stand out"
                        onEdit={() => startEdit("skills")}
                        buttonLabel="Add Skills"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Resume */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Resume / CV
                    </h3>
                    {isEditing && editingSection === "skills" ? (
                      <div className="space-y-3">
                        <div
                          onClick={() =>
                            document.getElementById("resume-upload")?.click()
                          }
                          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                        >
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange(e, "resume")}
                            className="hidden"
                          />
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-700">
                            {profile?.resume
                              ? "Replace Resume"
                              : "Upload Resume"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PDF, DOC, DOCX · max 5MB
                          </p>
                          {files.resume && (
                            <p className="mt-3 text-sm font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-4 h-4" />
                              {files.resume.name}
                            </p>
                          )}
                        </div>
                        {profile?.resume && !files.resume && (
                          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
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
                              className="text-blue-600 h-8 px-3 text-xs"
                            >
                              View
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : !profile?.resume ? (
                      <EmptySection
                        icon={<FileText className="h-8 w-8 text-gray-300" />}
                        title="Upload your resume to get noticed"
                        onEdit={() => startEdit("skills")}
                        buttonLabel="Upload Resume"
                      />
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              Resume Uploaded
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {profile.resume
                                .split("/")
                                .pop()
                                ?.split("-")
                                .pop() || "Resume.pdf"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(profile.resume!, "_blank")
                            }
                            className="border-gray-200 h-9 px-3 text-xs rounded-xl"
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 h-9 px-3 rounded-xl"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = profile.resume!;
                              a.download = "resume.pdf";
                              a.click();
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar (1/4) ── */}
          <div className="space-y-4">
            {/* Profile strength */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="relative inline-flex items-center justify-center mb-3">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke={strokeColor}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (1 - displayPercentage / 100)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-2xl font-bold", strengthColor)}>
                    {displayPercentage}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Profile Strength
              </p>
              <p className="text-xs text-gray-400">
                {displayPercentage === 100
                  ? "Your profile is complete! 🎉"
                  : displayPercentage >= 80
                  ? "Almost there!"
                  : displayPercentage >= 50
                  ? "Keep going!"
                  : "Let's build your profile"}
              </p>
            </div>

            {/* Tips */}
            {displayPercentage < 100 &&
              (completionStatus?.missing_fields?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Complete Your Profile
                  </h3>
                  <div className="space-y-2.5">
                    {completionStatus?.missing_fields
                      ?.slice(0, 4)
                      .map((field: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                          <span className="capitalize">
                            {field.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                  </div>
                  {displayPercentage < 80 && (
                    <Button
                      size="sm"
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl"
                      onClick={() => {
                        const first = completionStatus?.missing_fields?.[0];
                        if (
                          first?.includes("profession") ||
                          first?.includes("employment")
                        )
                          startEdit("professional");
                        else if (first?.includes("phone"))
                          startEdit("personal");
                        else startEdit("skills");
                      }}
                    >
                      Complete Profile
                    </Button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Mobile save bar */}
      {isEditing && editingSection === activeTab && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-100 p-4 shadow-xl z-50">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              onClick={save}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={cancel}
              className="flex-1 border-gray-200 h-11 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small reusable helpers ────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string | null;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium text-gray-900",
          capitalize && "capitalize"
        )}
      >
        {value || (
          <span className="text-gray-300 font-normal">Not provided</span>
        )}
      </p>
    </div>
  );
}

function EmptySection({
  icon,
  title,
  onEdit,
  buttonLabel = "Get Started",
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  buttonLabel?: string;
}) {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm text-gray-500 mb-4">{title}</p>
      <Button
        onClick={onEdit}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl text-xs font-semibold"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
