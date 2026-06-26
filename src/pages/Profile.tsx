import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/api";
import {
  Wallet,
  Mail,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Pencil,
  Save,
  X,
  Globe,
  Award,
  ShieldCheck,
  Plus,
  FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { DeleteProfileModal } from "@/components/DeleteProfileModal";
import { useToast } from "@/hooks/use-toast";
import { addProducerCertification, deleteProducerCertification } from "@/lib/api";


interface UserProfile {
  username: string | null;
  full_name: string | null;
  hedera_account_id: string | null;
  auth_method: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, linkHederaWallet, isMetaMaskConnected, metaMaskAddress } = useAuth();
  const { accountId, isConnected, connect, network } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  const [trustData, setTrustData] = useState<any>(null);
  const [loadingTrust, setLoadingTrust] = useState(false);
  const [trustError, setTrustError] = useState<string | null>(null);
  
  // States for adding a new certification
  const [certName, setCertName] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [addingCert, setAddingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  const loadTrustData = async (producerId: string) => {
    if (!producerId) return;
    setLoadingTrust(true);
    setTrustError(null);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${API}/api/trust/producer/${producerId}`);
      if (response.status === 404) {
        setTrustError("No trust data available");
        setTrustData(null);
        return;
      }
      if (response.status === 503) {
        setTrustError("Server unavailable");
        setTrustData(null);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setTrustData(data);
    } catch (err: any) {
      console.error("Error loading trust score details:", err);
      setTrustError("No trust data available");
      setTrustData(null);
    } finally {
      setLoadingTrust(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTrustData(user.id);
    }
  }, [user]);

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCertError(null);
    setAddingCert(true);

    try {
      const res = await addProducerCertification(user.id, {
        name: certName,
        issue_date: certIssueDate,
        expiry_date: certExpiryDate
      });

      if (res.ok) {
        setCertName("");
        setCertIssueDate("");
        setCertExpiryDate("");
        toast({
          title: "Certification added",
          description: "Your certification has been added successfully."
        });
        await loadTrustData(user.id);
      }
    } catch (err: any) {
      setCertError(err.message || "Failed to add certification");
    } finally {
      setAddingCert(false);
    }
  };

  const onDeleteCertification = async (certId: string) => {
    if (!user) return;
    try {
      const res = await deleteProducerCertification(user.id, certId);
      if (res.ok) {
        toast({
          title: "Certification deleted",
          description: "Certification removed successfully."
        });
        await loadTrustData(user.id);
      }
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; email?: string }>({});

  const validateFields = (usernameVal: string, emailVal: string) => {
    const errors: { username?: string; email?: string } = {};
    
    // Validate username
    const trimmedUsername = usernameVal.trim();
    if (!trimmedUsername) {
      errors.username = "Username is required";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      errors.username = "Username must be between 3 and 30 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      errors.username = "Username can only contain alphanumeric characters, underscores, and hyphens";
    }

    // Validate email
    const trimmedEmail = emailVal.trim();
    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartEdit = () => {
    setEditUsername(profile?.username || "");
    setEditEmail(user?.email || "");
    setValidationErrors({});
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(null);

    const isValid = validateFields(editUsername, editEmail);
    if (!isValid) return;

    if (!supabase) {
      setError("Supabase client is not initialized");
      return;
    }

    setUpdating(true);

    try {
      // Determine what changed
      const payload: { username?: string; email?: string } = {};
      if (editUsername.trim() !== (profile?.username || "")) {
        payload.username = editUsername.trim();
      }
      if (editEmail.trim() !== (user?.email || "")) {
        payload.email = editEmail.trim();
      }

      // If nothing changed, just exit edit mode
      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      const res = await updateProfile(payload);
      if (res.ok) {
        // Refresh local session so user.email updates in supabase client cache
        if (payload.email) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn("Failed to refresh session:", refreshError.message);
          }
        }
        await loadProfile();
        setIsEditing(false);
        setSuccess("Profile updated successfully");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };


  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError("Supabase client is not initialized");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Link the currently connected HashPack wallet to the user's Supabase profile.
   * Uses the new useWallet() hook to get the connected account ID.
   */
  const handleLinkWallet = async () => {
    setError(null);
    setSuccess(null);
    setLinking(true);

    try {
      // If wallet is not connected, trigger connection first
      if (!isConnected || !accountId) {
        await connect();
        // Wait for wallet state to update (the connect flow is async via modal)
        setLinking(false);
        return;
      }

      // Link the wallet account to the Supabase profile
      await linkHederaWallet(accountId);
      setSuccess(`Successfully linked Hedera wallet: ${accountId}`);
      await loadProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Wallet linking error:", err);
      setError(err.message || "Failed to link wallet");
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 dark:bg-background text-foreground">
      <Helmet>
        <title>Profile | AgroDex</title>
      </Helmet>
      <Navbar />
      
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Card className="bg-card text-card-foreground dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-gray-900 dark:text-white">User Profile</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Manage your account and linked Hedera wallet
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={handleStartEdit}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 dark:border-green-950/30 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Email
                </label>
                {isEditing ? (
                  <div className="mt-1 space-y-1">
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => {
                          setEditEmail(e.target.value);
                          validateFields(editUsername, e.target.value);
                        }}
                        disabled={updating}
                        className={`pl-9 bg-background border ${
                          validationErrors.email
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-slate-300 dark:border-slate-800 focus-visible:ring-primary"
                        }`}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-red-500 font-medium">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {user?.email || "Anonymous"}
                    </span>
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Username
                </label>
                {isEditing ? (
                  <div className="mt-1 space-y-1">
                    <Input
                      type="text"
                      value={editUsername}
                      onChange={(e) => {
                        setEditUsername(e.target.value);
                        validateFields(e.target.value, editEmail);
                      }}
                      disabled={updating}
                      className={`bg-background border ${
                        validationErrors.username
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-slate-300 dark:border-slate-800 focus-visible:ring-primary"
                      }`}
                    />
                    {validationErrors.username ? (
                      <p className="text-xs text-red-500 font-medium">
                        {validationErrors.username}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Alphanumeric, underscores, and hyphens, 3-30 characters.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 dark:text-white mt-1">
                    {profile?.username || "Not set"}
                  </p>
                )}
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updating || Object.keys(validationErrors).length > 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02]"
                  >
                    {updating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={updating}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}


              {/* Authentication Method */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Authentication Method
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      profile?.auth_method === "hybrid"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {profile?.auth_method || "email"}
                  </Badge>
                </div>
              </div>

              {/* Hedera Wallet */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Hedera Wallet
                </label>
                
                {profile?.hedera_account_id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-900 dark:text-white font-mono text-sm">
                      {profile.hedera_account_id}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-605 border-green-600 dark:text-green-400 dark:border-green-400"
                    >
                      Linked
                    </Badge>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                      No wallet linked. Connect your HashPack wallet to enable
                      hybrid authentication.
                    </p>
                    <Button
                      onClick={handleLinkWallet}
                      disabled={linking}
                      variant="outline"
                      className="border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {linking ? "Linking..." : "Link Hedera Wallet"}
                    </Button>
                  </div>
                )}

                {/* Show currently connected wallet session (live status) */}
                {isConnected && accountId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Active Wallet Session
                    </p>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-mono text-sm text-blue-800">
                        {accountId}
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 text-xs rounded-full font-semibold ${
                          network === "testnet"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {network}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* MetaMask Wallet (Web3 Auth) */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  MetaMask Wallet
                </label>
                {isMetaMaskConnected && metaMaskAddress ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-900 dark:text-white font-mono text-sm">
                      {metaMaskAddress}
                    </span>
                    <Badge variant="outline" className="text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400">
                      Authenticated
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    No MetaMask wallet connected.
                  </p>
                )}
              </div>

              {/* Member Since */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>

              {/* Manage Session / Danger Zone */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                <Button
                  onClick={() => navigate("/session-settings")}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 mb-4"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Manage session duration
                </Button>
                
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <DeleteProfileModal />
              </div>

            </div> {/* Closes space-y-4 */}
          </CardContent>
        </Card>

        {/* Trust Dashboard Section */}
        <Card className="mt-8 bg-card text-card-foreground dark:border-slate-800 shadow-lg">
          <CardHeader className="border-b border-gray-150 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Producer Trust Dashboard
              </CardTitle>
              {trustData?.hasTrustedBadge && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center gap-1 py-1 px-3 shadow-md animate-pulse">
                  <Award className="h-4 w-4" />
                  TRUSTED PRODUCER
                </Badge>
              )}
            </div>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
              Real-time trust score, certification management, and compliance statistics
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8">
            {loadingTrust ? (
              <div className="text-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-2 text-sm text-slate-500">Loading trust analytics...</p>
              </div>
            ) : trustError ? (
              <div className="text-center py-6">
                <p className="text-red-500 font-semibold">{trustError}</p>
              </div>
            ) : trustData ? (
              <>
                {/* Trust Score & Badging Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
                    <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 text-2xl font-black text-emerald-700 dark:text-emerald-400 shadow-md">
                      {trustData.trustScore}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Trust Score</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Dynamic AgroDex Trust Score
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-slate-900 border-4 border-purple-500 text-sm font-black text-purple-700 dark:text-purple-400 shadow-md text-center p-1 uppercase">
                      {trustData.compliance?.status || "N/A"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Compliance Status</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Compliance Engine Status
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certification History Manager */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Certification History
                  </h4>
                  
                  {!Array.isArray(trustData.certifications) || trustData.certifications.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed border-border text-center">
                      No certifications registered. Add your active agricultural certificates below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {trustData.certifications.map((cert: any, index: number) => {
                        const certLabel = typeof cert === 'string' ? cert : (cert?.name || 'Unknown Certificate');
                        const certId = typeof cert === 'object' ? cert?.id : null;
                        const certStatus = typeof cert === 'object' && cert?.status ? cert.status : 'Active';
                        return (
                          <div key={certId || index} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-border shadow-sm">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{certLabel}</p>
                                <Badge className={`${certStatus === 'Expired' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white text-[10px]`}>
                                  {certStatus}
                                </Badge>
                              </div>
                            </div>
                            {certId && (
                              <button
                                type="button"
                                onClick={() => onDeleteCertification(certId)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium ml-2 shrink-0"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Certification Form */}
                  <form onSubmit={handleAddCertification} className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-border space-y-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add Certification</p>
                    
                    {certError && (
                      <Alert variant="destructive" className="py-2 text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{certError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="certName" className="text-xs font-semibold">Name</Label>
                        <Input
                          id="certName"
                          placeholder="e.g. Organic Certificate, IndoGAP"
                          value={certName}
                          onChange={(e) => setCertName(e.target.value)}
                          className="h-9 text-sm mt-1"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="certIssueDate" className="text-xs font-semibold">Issue Date</Label>
                          <Input
                            id="certIssueDate"
                            type="date"
                            value={certIssueDate}
                            onChange={(e) => setCertIssueDate(e.target.value)}
                            className="h-9 text-sm mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="certExpiryDate" className="text-xs font-semibold">Expiry Date</Label>
                          <Input
                            id="certExpiryDate"
                            type="date"
                            value={certExpiryDate}
                            onChange={(e) => setCertExpiryDate(e.target.value)}
                            className="h-9 text-sm mt-1"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={addingCert}
                      className="w-full h-9 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      {addingCert ? "Adding..." : "Add Certification"}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 italic text-center">Unable to load trust scores.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
