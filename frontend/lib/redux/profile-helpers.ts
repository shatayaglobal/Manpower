import axiosInstance from "./axios";
import {
  UserProfile,
  ProfileCheckResponse,
  ProfileUpdateData,
} from "@/lib/types";

export const profileAPI = {
  // Check if profile is complete
  checkComplete: async (): Promise<ProfileCheckResponse> => {
    const response = await axiosInstance.get("/profile/check-complete/");
    return response.data;
  },

  getProfile: async (): Promise<{
    profile: UserProfile;
    completion_percentage: number;
    is_complete: boolean;
  }> => {
    const response = await axiosInstance.get("/profiles/");
    const profiles = response.data.results || response.data;
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;

    if (!profile) {

    }


    const completionResponse = await profileAPI.checkComplete();

    return {
      profile,
      completion_percentage: completionResponse.completion_percentage,
      is_complete: completionResponse.is_complete,
    };
  },


  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const formData = new FormData();

    const fileFields = ["avatar", "resume", "portfolio"];
    const jsonFields = [
      "skills",
      "languages",
      "certifications",
      "work_experience",
      "education",
      "references",
    ];

    (Object.keys(data) as (keyof ProfileUpdateData)[]).forEach((key) => {
      const value = data[key];

      if (fileFields.includes(key as string) && value instanceof File) {
        formData.append(key, value);
      } else if (jsonFields.includes(key as string) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    try {
      const profilesResponse = await axiosInstance.get("/profiles/");
      const profiles = profilesResponse.data.results || profilesResponse.data;
      const existingProfile = Array.isArray(profiles) ? profiles[0] : profiles;

      if (existingProfile) {
        const response = await axiosInstance.patch(
          `/profiles/${existingProfile.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } else {
        // Create new profile
        const response = await axiosInstance.post("/profiles/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        throw new Error(
          axiosError.response?.data?.message || "Failed to update profile"
        );
      }
      throw new Error("Failed to update profile");
    }
  },


  deleteProfile: async (profileId: string): Promise<void> => {
    await axiosInstance.delete(`/profiles/${profileId}/`);
  },
  getProfileById: async (profileId: string): Promise<UserProfile> => {
    const response = await axiosInstance.get(`/profiles/${profileId}/`);
    return response.data;
  },
};
