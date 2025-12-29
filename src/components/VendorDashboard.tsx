import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Calendar, Package, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HallManagement } from "./HallManagement";
import type { Database } from "@/integrations/supabase/types";

type VendorRole = Database["public"]["Enums"]["vendor_role"];
type VendorStatus = Database["public"]["Enums"]["vendor_status"];

interface VendorApplication {
  id: string;
  role: VendorRole;
  status: VendorStatus;
  business_name: string;
}

export function VendorDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVendorView, setActiveVendorView] = useState<VendorRole | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("vendor_applications")
      .select("id, role, status, business_name")
      .eq("user_id", user.id);
    
    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  const approvedApplications = applications.filter(app => app.status === "approved");
  const pendingApplications = applications.filter(app => app.status === "pending");

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (activeVendorView === "hall_owner") {
    return (
      <div>
        <button
          onClick={() => setActiveVendorView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <HallManagement />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Approved Vendor Sections */}
      {approvedApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            خدماتي
          </h3>
          
          {approvedApplications.map((app) => (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveVendorView(app.role)}
              className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
            >
              <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                {app.role === "hall_owner" && <Building2 className="w-7 h-7 text-white" />}
                {app.role === "service_provider" && <Package className="w-7 h-7 text-white" />}
                {app.role === "dress_seller" && <Calendar className="w-7 h-7 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-bold text-foreground">
                  {app.business_name}
                </h4>
                <p className="text-muted-foreground font-arabic text-sm">
                  {app.role === "hall_owner" && "إدارة القاعات والحجوزات"}
                  {app.role === "service_provider" && "إدارة الخدمات والباقات"}
                  {app.role === "dress_seller" && "إدارة الفساتين"}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            طلبات قيد المراجعة
          </h3>
          
          {pendingApplications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxe rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-resale/20 text-resale rounded-full text-xs font-arabic">
                  قيد المراجعة
                </span>
                <h4 className="font-display font-bold text-foreground">
                  {app.business_name}
                </h4>
              </div>
              <p className="text-muted-foreground font-arabic text-sm mt-2 text-right">
                سنراجع طلبك ونتواصل معك قريباً
              </p>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {applications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            ابدأ رحلتك معنا
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">
            انضم كمقدم خدمة من صفحة الحساب
          </p>
        </div>
      )}
    </div>
  );
}
