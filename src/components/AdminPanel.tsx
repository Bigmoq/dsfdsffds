import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Building2, Package, ShoppingBag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type VendorApplication = Database["public"]["Tables"]["vendor_applications"]["Row"];
type VendorRole = Database["public"]["Enums"]["vendor_role"];

interface ApplicationWithProfile extends VendorApplication {
  profiles?: { full_name: string | null; phone: string | null } | null;
}

export function AdminPanel() {
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_applications")
      .select("*")
      .order("applied_at", { ascending: false });
    
    // Fetch profiles separately to avoid join complexity
    let applicationsWithProfiles: ApplicationWithProfile[] = [];
    if (data) {
      const userIds = [...new Set(data.map(app => app.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      applicationsWithProfiles = data.map(app => ({
        ...app,
        profiles: profileMap.get(app.user_id) || null,
      }));
    }

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
        variant: "destructive",
      });
    } else {
      setApplications(applicationsWithProfiles);
    }
    setLoading(false);
  };

  const handleApplication = async (
    applicationId: string,
    userId: string,
    role: VendorRole,
    approve: boolean
  ) => {
    setProcessingId(applicationId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update application status
    const { error: updateError } = await supabase
      .from("vendor_applications")
      .update({
        status: approve ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", applicationId);

    if (updateError) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الطلب",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    // If approved, update user role
    if (approve) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: role })
        .eq("user_id", userId);

      if (roleError) {
        toast({
          title: "خطأ",
          description: "فشل في تحديث دور المستخدم",
          variant: "destructive",
        });
        setProcessingId(null);
        return;
      }
    }

    toast({
      title: approve ? "تمت الموافقة" : "تم الرفض",
      description: approve 
        ? "تمت الموافقة على الطلب بنجاح" 
        : "تم رفض الطلب",
    });

    setProcessingId(null);
    fetchApplications();
  };

  const getRoleIcon = (role: VendorRole) => {
    switch (role) {
      case "hall_owner": return Building2;
      case "service_provider": return Package;
      case "dress_seller": return ShoppingBag;
      default: return User;
    }
  };

  const getRoleLabel = (role: VendorRole) => {
    switch (role) {
      case "hall_owner": return "صاحب قاعة";
      case "service_provider": return "مقدم خدمة";
      case "dress_seller": return "بائع فساتين";
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="font-arabic">قيد المراجعة</Badge>;
      case "approved":
        return <Badge className="bg-green-500 font-arabic">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="font-arabic">مرفوض</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === "pending");
  const reviewedApplications = applications.filter(app => app.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      <div>
        <h3 className="font-display text-lg font-bold text-foreground text-right mb-4">
          طلبات قيد المراجعة ({pendingApplications.length})
        </h3>
        
        {pendingApplications.length === 0 ? (
          <Card className="card-luxe">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground font-arabic">لا توجد طلبات جديدة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingApplications.map((app, index) => {
              const RoleIcon = getRoleIcon(app.role);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-luxe">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(app.status || "pending")}
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <CardTitle className="text-base font-arabic">
                              {app.business_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-arabic">
                              {app.profiles?.full_name || "بدون اسم"}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <RoleIcon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-right space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(app.applied_at || "").toLocaleDateString("ar-SA")}
                          </span>
                          <span className="font-arabic text-muted-foreground">نوع الطلب:</span>
                        </div>
                        <p className="text-sm font-arabic text-primary">
                          {getRoleLabel(app.role)}
                        </p>
                        {app.business_description && (
                          <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
                            {app.business_description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleApplication(app.id, app.user_id, app.role, false)}
                          variant="outline"
                          className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                          disabled={processingId === app.id}
                        >
                          {processingId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 ml-2" />
                              <span className="font-arabic">رفض</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleApplication(app.id, app.user_id, app.role, true)}
                          className="flex-1 gold-gradient text-white"
                          disabled={processingId === app.id}
                        >
                          {processingId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 ml-2" />
                              <span className="font-arabic">موافقة</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed Applications */}
      {reviewedApplications.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-foreground text-right mb-4">
            الطلبات المراجعة ({reviewedApplications.length})
          </h3>
          <div className="space-y-3">
            {reviewedApplications.map((app) => {
              const RoleIcon = getRoleIcon(app.role);
              return (
                <Card key={app.id} className="card-luxe opacity-80">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.status || "pending")}
                        <span className="text-xs text-muted-foreground">
                          {app.reviewed_at && new Date(app.reviewed_at).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <p className="text-sm font-arabic font-medium">{app.business_name}</p>
                          <p className="text-xs text-muted-foreground font-arabic">
                            {getRoleLabel(app.role)}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <RoleIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
