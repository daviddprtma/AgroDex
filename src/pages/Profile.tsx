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
import {
  Wallet,
  Mail,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Award,
  ShieldCheck,
  Trash2,
  Plus,
  Activity,
  FileText,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { DeleteProfileModal } from "@/components/DeleteProfileModal";
import { useToast } from "@/hooks/use-toast";
import { getProducerTrust, addProducerCertification, deleteProducerCertification } from "@/lib/api";

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
  
  // States for adding a new certification
  const [certName, setCertName] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [addingCert, setAddingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  const loadTrustData = async (userId: string) => {
    setLoadingTrust(true);
    try {
      const data = await getProducerTrust(userId);
      if (data.ok) {
        setTrustData(data.data);
      }
    } catch (err: any) {
      console.error("Error loading trust score details:", err);
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

  const handleDeleteCertification = async (certId: string) => {
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

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
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
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">User Profile</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Manage your account and linked Hedera wallet
            </CardDescription>
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
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {user?.email || "Anonymous"}
                  </span>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Username
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {profile?.username || "Not set"}
                </p>
              </div>

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
                        Threshold for Trusted status is {trustData.trustedThreshold}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-slate-900 border-4 border-purple-500 text-2xl font-black text-purple-700 dark:text-purple-400 shadow-md">
                      {trustData.verificationAnalytics.successRate}%
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Verification Success</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {trustData.verificationAnalytics.successfulVerifications} of {trustData.verificationAnalytics.totalVerifications} verified lots
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Analytics Detail */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-blue-500" />
                    Verification Analytics
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-border">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{trustData.verificationAnalytics.totalVerifications}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Total checked</p>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{trustData.verificationAnalytics.successfulVerifications}</p>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Successful</p>
                    </div>
                    <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                      <p className="text-lg font-bold text-red-650 dark:text-red-400">{trustData.verificationAnalytics.failedVerifications}</p>
                      <p className="text-[10px] uppercase font-bold text-red-650 dark:text-red-400">Failed / Flagged</p>
                    </div>
                  </div>
                </div>

                {/* Compliance Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Compliance & Fraud Engine Summary
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Average Batch Risk Score:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{trustData.complianceSummary.averageRiskScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Compliance Status:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{trustData.complianceSummary.complianceLevel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Registered Batches:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{trustData.complianceSummary.totalBatches}</span>
                    </div>
                  </div>
                </div>

                {/* Certification History Manager */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Certification History
                  </h4>
                  
                  {trustData.certificationHistory.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed border-border text-center">
                      No certifications registered. Add your active agricultural certificates below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {trustData.certificationHistory.map((cert: any) => (
                        <div key={cert.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-border shadow-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{cert.name}</p>
                              <Badge className={cert.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600 text-white text-[10px]' : 'bg-red-500 hover:bg-red-650 text-white text-[10px]'}>
                                {cert.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Issued: {new Date(cert.issue_date).toLocaleDateString()} · Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDeleteCertification(cert.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-550 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
