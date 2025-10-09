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
  CheckCircle,
} from "lucide-react";
import { useProfile } from "@/lib/redux/useProfile";
import type { RootState } from "@/lib/redux/store";
import Image from "next/image";

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
    { id: "personal", label: "Personal Info", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "skills", label: "Skills & Documents", icon: Award },
  ];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [isAuthenticated, user, router, loadProfile]);

  useEffect(() => {
    if (!loading) {
      if (
        profile === null ||
        (profile &&
          !profile.phone &&
          !profile.profession &&
          !profile.bio &&
          (!profile.skills || profile.skills.length === 0))
      ) {
        setIsNewProfile(true);
      } else {
        setIsNewProfile(false);
      }
    }
  }, [profile, loading]);

  useEffect(() => {
    if (profile && profile.id) {
      if (completionStatus?.is_complete) {
        toast.success("Your profile is already complete!");
        router.push("/jobs");
      } else {
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
    }
  }, [profile, completionStatus, user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "avatar" | "resume"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    }
  };

  const handleSectionEdit = (section: string) => {
    setEditingSection(section);
    setIsEditing(true);
    setActiveTab(section);
  };

  const handleSectionSave = async () => {
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const profileData = {
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

      const success = await updateProfile(profileData);

      if (success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setEditingSection(null);
        setFiles({ avatar: null, resume: null });
      }
    } catch  {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleSectionCancel = () => {
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
        skills: Array.isArray(profile.skills)
          ? profile.skills.join(", ")
          : profile.skills || "",
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>

          {/* Welcome Message for New Users - Plain Text */}
          {isNewProfile && (
            <div className="mb-4">
              <p className="text-lg text-gray-700 font-medium">
                Welcome! Let&apos;s create your profile
              </p>
              <p className="text-gray-600">
                Complete your profile to unlock all features and find the best
                job opportunities. Start with your personal information below.
              </p>
            </div>
          )}
        </div>

        {/* Compact Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                  {files.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(files.avatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                {isEditing && editingSection === "personal" && (
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "avatar")}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-lg text-blue-600">
                  {profile?.profession || "No profession set"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile?.city && profile?.country
                      ? `${profile.city}, ${profile.country}`
                      : "Location not set"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {completionStatus && (
                  <Badge
                    variant={
                      completionStatus.completion_percentage >= 80
                        ? "default"
                        : "secondary"
                    }
                  >
                    {Math.round(completionStatus.completion_percentage)}%
                    Complete
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionEdit(activeTab)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content - 4 columns */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            activeTab === tab.id
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSectionEdit(activeTab)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    {isEditing && editingSection === "personal" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-1">
                              Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              Phone <span className="text-red-500">*</span>
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
                        <div className="grid grid-cols-3 gap-4">
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
                              className="w-full border border-gray-300 rounded-md p-2"
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
                            className="w-full border border-gray-300 rounded-md p-2"
                          >
                            <option value="">Select</option>
                            <option value="SINGLE">Single</option>
                            <option value="MARRIED">Married</option>
                            <option value="DIVORCED">Divorced</option>
                            <option value="WIDOWED">Widowed</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleSectionSave}
                            disabled={loading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleSectionCancel}
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
                          <div className="text-center py-8 text-gray-500">
                            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="mb-3">
                              Add your personal information
                            </p>
                            <Button
                              onClick={() => handleSectionEdit("personal")}
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Phone
                              </p>
                              <p className="font-medium">
                                {profile?.phone || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Date of Birth
                              </p>
                              <p className="font-medium">
                                {profile?.date_of_birth || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Location
                              </p>
                              <p className="font-medium">
                                {profile?.city && profile?.country
                                  ? `${profile.city}, ${profile.country}`
                                  : "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Gender
                              </p>
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

                {/* Professional Tab */}
                {activeTab === "professional" && (
                  <div className="space-y-6">
                    {isEditing && editingSection === "professional" ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-1">
                            Profession <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="profession"
                            value={formData.profession}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1">
                              Employment Status{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <select
                              name="employment_status"
                              value={formData.employment_status}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 rounded-md p-2"
                            >
                              <option value="">Select status</option>
                              <option value="EMPLOYED">
                                Currently Employed
                              </option>
                              <option value="UNEMPLOYED">
                                Looking for Work
                              </option>
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
                              className="w-full border border-gray-300 rounded-md p-2"
                            >
                              <option value="">Select level</option>
                              <option value="ENTRY">
                                Entry Level (0-2 years)
                              </option>
                              <option value="JUNIOR">Junior (2-5 years)</option>
                              <option value="MID">Mid Level (5-8 years)</option>
                              <option value="SENIOR">Senior (8+ years)</option>
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
                            placeholder="Tell us about your professional experience and goals..."
                          />
                        </div>
                        <div>
                          <Label>LinkedIn URL</Label>
                          <Input
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/yourname"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleSectionSave}
                            disabled={loading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleSectionCancel}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!profile?.profession && !profile?.employment_status ? (
                          <div className="text-center py-8 text-gray-500">
                            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="mb-3">
                              Add your professional information
                            </p>
                            <Button
                              onClick={() => handleSectionEdit("professional")}
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Employment Status
                              </p>
                              <p className="font-medium">
                                {profile?.employment_status || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Experience Level
                              </p>
                              <p className="font-medium">
                                {profile?.experience_level || "Not provided"}
                              </p>
                            </div>
                            {profile?.bio && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">
                                  Professional Bio
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                  {profile.bio}
                                </p>
                              </div>
                            )}
                            {profile?.linkedin_url && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">
                                  LinkedIn
                                </p>
                                <a
                                  href={profile.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Globe className="h-3 w-3" />
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

                {/* Skills & Documents Tab */}
                {activeTab === "skills" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Skills</h3>
                      {isEditing && editingSection === "skills" ? (
                        <div>
                          <Label>Skills (comma-separated)</Label>
                          <Textarea
                            name="skills"
                            rows={3}
                            value={formData.skills}
                            onChange={handleInputChange}
                            placeholder="JavaScript, React, Node.js, Python..."
                          />
                        </div>
                      ) : (
                        <>
                          {!profile?.skills ||
                          (Array.isArray(profile.skills) &&
                            profile.skills.length === 0) ? (
                            <div className="text-center py-8 text-gray-500">
                              <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="mb-3">
                                Add your skills to stand out
                              </p>
                              <Button
                                onClick={() => handleSectionEdit("skills")}
                              >
                                Add Skills
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {profile?.skills &&
                              Array.isArray(profile.skills) &&
                              profile.skills.length > 0 ? (
                                profile.skills.map(
                                  (skill: string, index: number) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  )
                                )
                              ) : (
                                <p className="text-gray-500">
                                  No skills added yet
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Documents</h3>
                      {isEditing && editingSection === "skills" ? (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              id="resume-upload"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(e, "resume")}
                              className="hidden"
                            />
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
                            {files.resume && (
                              <p className="text-sm text-green-600 mt-2">
                                New file selected: {files.resume.name}
                              </p>
                            )}
                          </div>
                          {profile?.resume && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">
                                    Current:{" "}
                                    {profile.resume
                                      .split("/")
                                      .pop()
                                      ?.split("-")
                                      .pop() || "Resume"}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (profile.resume) {
                                      window.open(profile.resume, "_blank");
                                    }
                                  }}
                                >
                                  View Current
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {!profile?.resume ? (
                            <div className="text-center py-6 text-gray-500">
                              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm mb-2">Upload your resume</p>
                              <Button
                                size="sm"
                                onClick={() => handleSectionEdit("documents")}
                              >
                                Upload Now
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {profile.resume
                                    .split("/")
                                    .pop()
                                    ?.split("-")
                                    .pop() || "Resume"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (profile.resume) {
                                      window.open(profile.resume, "_blank");
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (profile.resume) {
                                      const link = document.createElement("a");
                                      link.href = profile.resume;
                                      link.download =
                                        profile.resume.split("/").pop() ||
                                        "resume";
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {isEditing &&
                      (editingSection === "skills" ||
                        editingSection === "documents") && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleSectionSave}
                            disabled={loading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleSectionCancel}
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

          {/* Sidebar - Simplified */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completionStatus && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(completionStatus.completion_percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${completionStatus.completion_percentage}%`,
                          }}
                        ></div>
                      </div>
                      {completionStatus.missing_fields.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Missing:{" "}
                          {completionStatus.missing_fields
                            .slice(0, 2)
                            .map((field) => field.replace("_", " "))
                            .join(", ")}
                          {completionStatus.missing_fields.length > 2 &&
                            ` +${
                              completionStatus.missing_fields.length - 2
                            } more`}
                        </div>
                      )}
                      {completionStatus.completion_percentage < 50 && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                          <p className="text-xs text-yellow-800 mb-2">
                            Complete your profile to get better job matches!
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-7"
                            onClick={() => {
                              const firstMissingField =
                                completionStatus.missing_fields[0];
                              if (
                                firstMissingField?.includes("profession") ||
                                firstMissingField?.includes("employment")
                              ) {
                                handleSectionEdit("professional");
                              } else if (
                                firstMissingField?.includes("phone") ||
                                firstMissingField?.includes("personal")
                              ) {
                                handleSectionEdit("personal");
                              } else if (
                                firstMissingField?.includes("skills")
                              ) {
                                handleSectionEdit("skills");
                              } else {
                                handleSectionEdit("personal");
                              }
                            }}
                          >
                            Continue Setup
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
