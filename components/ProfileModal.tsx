import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import CloseIcon from "@mui/icons-material/Close";

interface ProfileSettingsModalProps { 

  open: boolean;
  onClose: () => void;
  userId: string;
}
const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ open, onClose, userId }) => {
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [specialization, setSpecialization] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, is_public, is_available, game_specialization, profile_pic")
          .eq("id", userId)
          .single();
        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }
        if (data) {
          setFullName(data.full_name);
          setEmail(data.email);
          setIsPublic(data.is_public);
          setIsAvailable(data.is_available);
          setSpecialization(data.game_specialization || "");
          setProfilePic(data.profile_pic);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (open) fetchProfile();
  }, [open, userId]);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true);
      const file = event.target.files[0];
      const filePath = `profile_pictures/${userId}/${file.name}`;
      try {
        const { error } = await supabase.storage
          .from("profile_pictures")
          .upload(filePath, file, { upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage
            .from("profile_pictures")
            .getPublicUrl(filePath);
          setProfilePic(urlData.publicUrl);
        } else {
          console.error("Error uploading image:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          is_public: isPublic,
          is_available: isAvailable,
          game_specialization: specialization,
          profile_pic: profilePic,
        })
        .eq("id", userId);
      console.log("Saved profile with public status:", isPublic);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  // Toggle handlers with explicit logging
  const togglePublicProfile = () => {
    const newValue = !isPublic;
    console.log("Changing public profile from", isPublic, "to", newValue);
    setIsPublic(newValue);
  };
  const toggleAvailability = () => {
    const newValue = !isAvailable;
    console.log("Changing availability from", isAvailable, "to", newValue);
    setIsAvailable(newValue);
  };
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="p-5 flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative">
            {profilePic ? (
              <img
                src={profilePic}
                alt={fullName || "Profile"}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials()}
              </div>
            )}
          </div>
          <label className="mt-3 text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
            Change Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {/* User Info */}
          <div className="mt-4 text-center">
            <h3 className="font-medium text-gray-800">{fullName || "N/A"}</h3>
            <p className="text-sm text-gray-500">{email || "N/A"}</p>
          </div>
          {/* Settings */}
          <div className="w-full mt-6 space-y-5">
            {/* Public Profile Toggle - IMPROVED IMPLEMENTATION */}
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Public Profile
              </label>
              <button
                onClick={togglePublicProfile}
                className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                role="switch"
                aria-checked={isPublic}
                tabIndex={0}
              >
                <span
                  className={`${isPublic ? 'bg-blue-500' : 'bg-gray-300'} inline-block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out`}
                ></span>
                <span
                  className={`${isPublic ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Profile is currently: {isPublic ? "Public" : "Private"}
            </div>
<div className="space-y-1">
  <label htmlFor="specialization" className="block text-sm font-medium text-black">
    Game Specialization
  </label>
  <input
    id="specialization"
    type="text"
    value={specialization}
    onChange={(e) => setSpecialization(e.target.value)}
    placeholder="e.g. Esports, Strategy Games, FPS"
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-black"
  />
</div>
            {/* Availability Toggle - IMPROVED IMPLEMENTATION */}
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Available for Matches
              </label>
              <button
                onClick={toggleAvailability}
                className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                role="switch"
                aria-checked={isAvailable}
                tabIndex={0}
              >
                <span
                  className={`${isAvailable ? 'bg-blue-500' : 'bg-gray-300'} inline-block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out`}
                ></span>
                <span
                  className={`${isAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Availability status: {isAvailable ? "Available" : "Not Available"}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md font-medium text-sm transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
// Add a keyframe animation in your global CSS or in a style tag in your layout
const FadeInKeyframes = () => (
  <style jsx global>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `}</style>
);
const ProfileSettingsModalWithAnimation: React.FC<ProfileSettingsModalProps> = (props) => (
  <>
    <FadeInKeyframes />
    <ProfileSettingsModal {...props} />
  </>
);
export default ProfileSettingsModalWithAnimation