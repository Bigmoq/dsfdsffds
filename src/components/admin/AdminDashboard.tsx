import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  ShoppingBag, 
  Calendar,
  MessageSquare,
  Megaphone,
  FileCheck,
  ArrowRight,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminStats } from "./AdminStats";
import { AdminUsers } from "./AdminUsers";
import { AdminHalls } from "./AdminHalls";
import { AdminServices } from "./AdminServices";
import { AdminDresses } from "./AdminDresses";
import { AdminBookings } from "./AdminBookings";
import { AdminComplaints } from "./AdminComplaints";
import { AdminAds } from "./AdminAds";
import { AdminApplications } from "./AdminApplications";
import { AdminNotifications } from "./AdminNotifications";

type AdminTab = "dashboard" | "users" | "halls" | "services" | "dresses" | "bookings" | "complaints" | "ads" | "applications" | "notifications";

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const tabs = [
    { id: "dashboard" as AdminTab, label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "users" as AdminTab, label: "المستخدمين", icon: Users },
    { id: "halls" as AdminTab, label: "القاعات", icon: Building2 },
    { id: "services" as AdminTab, label: "الخدمات", icon: Package },
    { id: "dresses" as AdminTab, label: "الفساتين", icon: ShoppingBag },
    { id: "bookings" as AdminTab, label: "الحجوزات", icon: Calendar },
    { id: "notifications" as AdminTab, label: "الإشعارات", icon: Bell },
    { id: "complaints" as AdminTab, label: "الشكاوى", icon: MessageSquare },
    { id: "ads" as AdminTab, label: "الإعلانات", icon: Megaphone },
    { id: "applications" as AdminTab, label: "طلبات البائعين", icon: FileCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminStats />;
      case "users": return <AdminUsers />;
      case "halls": return <AdminHalls />;
      case "services": return <AdminServices />;
      case "dresses": return <AdminDresses />;
      case "bookings": return <AdminBookings />;
      case "notifications": return <AdminNotifications />;
      case "complaints": return <AdminComplaints />;
      case "ads": return <AdminAds />;
      case "applications": return <AdminApplications />;
      default: return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">لوحة الإدارة</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-x-auto border-b border-border">
        <div className="flex px-4 py-2 gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 ${activeTab === tab.id ? "gold-gradient" : ""}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-arabic text-sm">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}
