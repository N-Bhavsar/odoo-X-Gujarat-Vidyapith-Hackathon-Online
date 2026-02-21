import { useState, useEffect } from "react";
import { User, Mail, Shield, Clock, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services";
import { getRoleDisplayName, type UserRole } from "@/lib/permissions";

interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<UserProfile>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setProfile(userData);
        setEditData(userData);
      } else {
        const response = await authService.getProfile();
        setProfile(response.user);
        setEditData(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field: keyof UserProfile, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Here you would typically call an API to update the profile
      // For now, we'll just update the local state
      setProfile(editData);
      localStorage.setItem("user", JSON.stringify(editData));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your profile information</p>
        </div>
        <button
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isEditing ? <X className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0">
            <span className="text-3xl font-bold text-primary">
              {(profile.firstName?.charAt(0) || "")}{(profile.lastName?.charAt(0) || "")}
            </span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground mt-1">{profile.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {getRoleDisplayName(profile.role as UserRole)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          {/* First Name */}
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              First Name
            </label>
            {isEditing ? (
              <Input
                value={editData.firstName || ""}
                onChange={(e) => handleEditChange("firstName", e.target.value)}
                className="bg-secondary/50"
              />
            ) : (
              <p className="py-2 text-foreground">{profile.firstName || "-"}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Last Name
            </label>
            {isEditing ? (
              <Input
                value={editData.lastName || ""}
                onChange={(e) => handleEditChange("lastName", e.target.value)}
                className="bg-secondary/50"
              />
            ) : (
              <p className="py-2 text-foreground">{profile.lastName || "-"}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <p className="py-2 text-foreground">{profile.email || "-"}</p>
          </div>

          {/* Role */}
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </label>
            <p className="py-2 text-foreground">{getRoleDisplayName(profile.role as UserRole)}</p>
          </div>

          {/* Account Created */}
          {profile.createdAt && (
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Account Created
              </label>
              <p className="py-2 text-muted-foreground text-sm">
                {new Date(profile.createdAt).toLocaleDateString()} at{" "}
                {new Date(profile.createdAt).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Last Updated */}
          {profile.updatedAt && (
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Updated
              </label>
              <p className="py-2 text-muted-foreground text-sm">
                {new Date(profile.updatedAt).toLocaleDateString()} at{" "}
                {new Date(profile.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-secondary/50 border border-border/30 rounded-lg p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Note:</strong> Some profile information like email and role cannot be changed directly.
          Contact your system administrator if you need to update these details.
        </p>
      </div>
    </div>
  );
};

export default Profile;
