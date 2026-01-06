import { useState, useEffect } from "react";
import { Loader2, Send, Users, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  recipients_count: number;
  sent_at: string;
}

export function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetRole, setTargetRole] = useState<"all" | AppRole>("all");
  const [sending, setSending] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersCount();
    // Load sent notifications from localStorage for history
    const saved = localStorage.getItem("admin_sent_notifications");
    if (saved) {
      setSentNotifications(JSON.parse(saved));
    }
  }, [targetRole]);

  const fetchUsersCount = async () => {
    let query = supabase.from("profiles").select("id", { count: "exact", head: true });
    
    if (targetRole !== "all") {
      const { data: roleUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", targetRole);
      
      if (roleUsers) {
        setUsersCount(roleUsers.length);
        return;
      }
    }
    
    const { count } = await query;
    setUsersCount(count || 0);
  };

  const handleSendNotifications = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      // Get target users
      let userIds: string[] = [];
      
      if (targetRole === "all") {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id");
        userIds = profiles?.map(p => p.id) || [];
      } else {
        const { data: roleUsers } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", targetRole);
        userIds = roleUsers?.map(r => r.user_id) || [];
      }

      if (userIds.length === 0) {
        toast({ title: "خطأ", description: "لا يوجد مستخدمين للإرسال إليهم", variant: "destructive" });
        setSending(false);
        return;
      }

      // Create notifications for all users
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: title.trim(),
        message: message.trim(),
        type: type,
        is_read: false,
      }));

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const { error } = await supabase.from("notifications").insert(batch);
        if (error) throw error;
      }

      // Save to history
      const newNotification: SentNotification = {
        id: crypto.randomUUID(),
        title: title.trim(),
        message: message.trim(),
        type,
        recipients_count: userIds.length,
        sent_at: new Date().toISOString(),
      };
      
      const updatedHistory = [newNotification, ...sentNotifications].slice(0, 20);
      setSentNotifications(updatedHistory);
      localStorage.setItem("admin_sent_notifications", JSON.stringify(updatedHistory));

      toast({ 
        title: "تم الإرسال", 
        description: `تم إرسال الإشعار إلى ${userIds.length} مستخدم` 
      });

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast({ title: "خطأ", description: "فشل في إرسال الإشعارات", variant: "destructive" });
    }

    setSending(false);
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "info": return "معلومات";
      case "success": return "نجاح";
      case "warning": return "تحذير";
      case "error": return "خطأ";
      default: return t;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "all": return "جميع المستخدمين";
      case "user": return "المستخدمين العاديين";
      case "hall_owner": return "أصحاب القاعات";
      case "service_provider": return "مقدمي الخدمات";
      case "dress_seller": return "بائعي الفساتين";
      case "admin": return "المدراء";
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Send Notification Form */}
      <Card className="card-luxe">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-arabic text-right justify-end">
            <span>إرسال إشعار جماعي</span>
            <Bell className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-right block">نوع الإشعار</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="error">تنبيه هام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-right block">المستهدفين</Label>
              <Select value={targetRole} onValueChange={(v) => setTargetRole(v as "all" | AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  <SelectItem value="user">المستخدمين العاديين</SelectItem>
                  <SelectItem value="hall_owner">أصحاب القاعات</SelectItem>
                  <SelectItem value="service_provider">مقدمي الخدمات</SelectItem>
                  <SelectItem value="dress_seller">بائعي الفساتين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-right block">العنوان</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الإشعار"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-right block">الرسالة</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="نص الإشعار..."
              rows={4}
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handleSendNotifications}
              disabled={sending || !title.trim() || !message.trim()}
              className="gold-gradient"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Send className="w-4 h-4 ml-2" />
              )}
              <span className="font-arabic">إرسال</span>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-arabic text-sm">سيصل إلى {usersCount} مستخدم</span>
              <Users className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sent Notifications History */}
      {sentNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-right">
            الإشعارات المرسلة
          </h3>
          <div className="space-y-3">
            {sentNotifications.map((notification) => (
              <Card key={notification.id} className="card-luxe">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-left">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {notification.recipients_count}
                      </span>
                    </div>
                    <div className="text-right flex-1 mr-4">
                      <div className="flex items-center gap-2 justify-end">
                        <p className="font-medium font-arabic">{notification.title}</p>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground font-arabic line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.sent_at).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
