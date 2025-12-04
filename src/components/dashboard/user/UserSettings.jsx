// src/components/dashboard/user/UserSettings.jsx
import React, { useRef, useState } from "react";
import { User, Bell, MapPin, Shield, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../../store/useStore";
import { updateProfile, API_BASE_URL } from "../../../lib/apiClient";
import toast from "react-hot-toast";

const DEFAULT_AVATAR =
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";

function resolveAvatar(avatar) {
  if (!avatar) return DEFAULT_AVATAR;

  // already an absolute url or blob preview
  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:")
  ) {
    return avatar;
  }

  // relative path from Laravel, e.g. /storage/avatars/xxx.jpg
  return `${API_BASE_URL}${avatar}`;
}

const UserSettings = () => {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: resolveAvatar(user?.avatar),
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false,
    communityUpdates: true,
    aiRecommendations: true,
  });

  const [addresses] = useState([
    {
      id: "1",
      type: "home",
      name: "Home Address",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      isDefault: true,
    },
  ]);

  // ===== Avatar upload =====
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null); // keep the File here

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Max file size is 3MB");
      return;
    }

    // store the File to send to backend
    setAvatarFile(file);

    // show preview using object URL
    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({
      ...prev,
      avatar: previewUrl,
    }));
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      formData.append("bio", profileData.bio || "");
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updated = await updateProfile(formData);

      const normalizedUser = {
        ...updated,
        avatar: resolveAvatar(updated.avatar),
      };

      setUser(normalizedUser);
      try {
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } catch {}

      setProfileData((prev) => ({
        ...prev,
        avatar: resolveAvatar(updated.avatar || prev.avatar),
      }));
      setAvatarFile(null);

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err.response?.data || err.message);
      toast.error(
        err?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Notification settings updated!");
    } catch (error) {
      toast.error("Failed to update notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "addresses", name: "Addresses", icon: MapPin },
  ];

  return (
    <section className="w-full px-6 md:px-10 pt-4 pb-10">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          Account Settings
        </h2>
        <p className="text-sm text-gray-600">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Tabs bar */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap border-b border-gray-200 px-4 md:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-4 md:p-6"
        >
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Profile Information
              </h3>

              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Avatar upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profileData.avatar || DEFAULT_AVATAR}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      <span>Change Photo</span>
                    </button>
                    <p className="text-xs text-gray-500">
                      JPG or PNG, max 3MB.
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                <span>{isLoading ? "Updating..." : "Update Profile"}</span>
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Security Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                <span>{isLoading ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600">
                        {key === "emailNotifications" &&
                          "Receive notifications via email"}
                        {key === "pushNotifications" &&
                          "Receive push notifications in browser"}
                        {key === "orderUpdates" &&
                          "Get updates about your orders"}
                        {key === "promotions" &&
                          "Receive promotional offers and discounts"}
                        {key === "communityUpdates" &&
                          "Get notified about community activity"}
                        {key === "aiRecommendations" &&
                          "Receive AI-powered style recommendations"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 relative">
                        <span className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpdateNotifications}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                <span>
                  {isLoading ? "Updating..." : "Update Notifications"}
                </span>
              </button>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  Saved Addresses
                </h3>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-colors">
                  Add New Address
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-medium text-gray-900">
                            {address.name}
                          </h4>
                          {address.isDefault && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.street}
                          <br />
                          {address.city}, {address.state} {address.zipCode}
                          <br />
                          {address.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default UserSettings;
