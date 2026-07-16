import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Sprout, 
  Package, 
  ShieldCheck, 
  QrCode, 
  BarChart3, 
  User 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QrScannerModal } from "@/components/QrScannerModal";
import { IconCard } from "./IconCard";

export const NavigationGrid: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isIndonesian = i18n.language?.startsWith("id");

  const validateQrPayload = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (!data || typeof data !== "object") return null;
      if (!data.batchId || typeof data.batchId !== "string") return null;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.batchId)) return null;

      if (data.verificationUrl) {
        if (typeof data.verificationUrl !== "string") return null;
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
        if (!urlRegex.test(data.verificationUrl)) return null;
        if (data.verificationUrl.toLowerCase().includes("javascript:") || data.verificationUrl.includes("<script")) {
          return null;
        }
      }
      return { batchId: data.batchId, verificationUrl: data.verificationUrl || "" };
    } catch {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (urlRegex.test(text) && text.toLowerCase().includes("/verify/")) {
        if (text.toLowerCase().includes("javascript:") || text.includes("<script")) {
          return null;
        }
        return { rawUrl: text };
      }
      return null;
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setIsScannerOpen(false);
    const parsed = validateQrPayload(decodedText);
    if (parsed) {
      if (parsed.batchId) {
        toast({
          title: isIndonesian ? "Kode QR Berhasil Dibaca" : "QR Code Decoded",
          description: isIndonesian 
            ? "Membuka halaman verifikasi batch..." 
            : "Navigating to batch verification page...",
        });
        navigate(`/verify/${parsed.batchId}`);
      } else if (parsed.rawUrl) {
        try {
          const url = new URL(parsed.rawUrl);
          toast({
            title: isIndonesian ? "URL Verifikasi Berhasil Dibaca" : "Verification URL Decoded",
            description: isIndonesian 
              ? "Membuka halaman sertifikat..." 
              : "Navigating to certificate page...",
          });
          navigate(url.pathname);
        } catch {
          toast({
            title: isIndonesian ? "Kode QR Tidak Valid" : "Invalid QR Code",
            description: isIndonesian 
              ? "Format URL kode QR tidak valid." 
              : "The QR code URL format is invalid.",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: isIndonesian ? "Kode QR Tidak Valid" : "Invalid QR Code",
        description: isIndonesian 
          ? "Kode QR yang dipindai bukan merupakan payload AgroDex yang valid." 
          : "The scanned QR code is not a valid AgroDex payload.",
        variant: "destructive",
      });
    }
  };

  const items = [
    {
      label: isIndonesian ? "Daftar Batch" : "Register Batch",
      emoji: "🌾",
      icon: Sprout,
      to: "/register",
      ariaLabel: isIndonesian ? "Daftarkan Batch Baru" : "Register a new crop batch",
      colorClass: {
        bg: "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900/60",
        border: "border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-500",
        text: "text-emerald-700 dark:text-emerald-300",
        iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
      }
    },
    {
      label: isIndonesian ? "Batch Saya" : "My Batches",
      emoji: "📦",
      icon: Package,
      to: "/dashboard",
      ariaLabel: isIndonesian ? "Lihat daftar batch saya" : "View my batches list",
      colorClass: {
        bg: "from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900/60",
        border: "border-blue-100 dark:border-blue-900/30 hover:border-blue-500 dark:hover:border-blue-500",
        text: "text-blue-700 dark:text-blue-300",
        iconBg: "bg-blue-100 dark:bg-blue-950/50",
      }
    },
    {
      label: isIndonesian ? "Verifikasi Produk" : "Verify Product",
      emoji: "🔍",
      icon: ShieldCheck,
      to: "/verify",
      ariaLabel: isIndonesian ? "Verifikasi Keaslian Produk" : "Verify product authenticity",
      colorClass: {
        bg: "from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900/60",
        border: "border-purple-100 dark:border-purple-900/30 hover:border-purple-500 dark:hover:border-purple-500",
        text: "text-purple-700 dark:text-purple-300",
        iconBg: "bg-purple-100 dark:bg-purple-950/50",
      }
    },
    {
      label: isIndonesian ? "Pindai QR" : "Scan QR",
      emoji: "📱",
      icon: QrCode,
      onClick: () => setIsScannerOpen(true),
      ariaLabel: isIndonesian ? "Pindai Kode QR kemasan produk" : "Scan product packaging QR code",
      colorClass: {
        bg: "from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900/60",
        border: "border-rose-100 dark:border-rose-900/30 hover:border-rose-500 dark:hover:border-rose-500",
        text: "text-rose-700 dark:text-rose-300",
        iconBg: "bg-rose-100 dark:bg-rose-950/50",
      }
    },
    {
      label: isIndonesian ? "Dasbor" : "Dashboard",
      emoji: "📊",
      icon: BarChart3,
      to: "/dashboard",
      ariaLabel: isIndonesian ? "Buka Dasbor Utama" : "Open Main Dashboard",
      colorClass: {
        bg: "from-orange-50 to-white dark:from-orange-950/20 dark:to-slate-900/60",
        border: "border-orange-100 dark:border-orange-900/30 hover:border-orange-500 dark:hover:border-orange-500",
        text: "text-orange-700 dark:text-orange-300",
        iconBg: "bg-orange-100 dark:bg-orange-950/50",
      }
    },
    {
      label: isIndonesian ? "Profil" : "Profile",
      emoji: "👤",
      icon: User,
      to: "/profile",
      ariaLabel: isIndonesian ? "Buka Pengaturan Profil" : "Open Profile Settings",
      colorClass: {
        bg: "from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-900/60",
        border: "border-slate-200 dark:border-slate-800 hover:border-slate-500 dark:hover:border-slate-500",
        text: "text-slate-700 dark:text-slate-300",
        iconBg: "bg-slate-100 dark:bg-slate-800/50",
      }
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {items.map((item, idx) => (
          <IconCard
            key={idx}
            label={item.label}
            emoji={item.emoji}
            icon={item.icon}
            to={item.to}
            onClick={item.onClick}
            ariaLabel={item.ariaLabel}
            colorClass={item.colorClass}
          />
        ))}
      </div>

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default NavigationGrid;
