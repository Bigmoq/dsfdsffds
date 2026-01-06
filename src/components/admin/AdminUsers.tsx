import { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Edit, User, Shield, Building2, Package, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole extends Profile {
  role?: AppRole | null;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("user");
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل المستخدمين", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const usersWithRoles = profiles.map(p => ({
      ...p,
      role: roleMap.get(p.id) || null,
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    setProcessing(true);

    // Check if role exists
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", editUser.id)
      .maybeSingle();

    let error;
    if (existingRole) {
      ({ error } = await supabase
        .from("user_roles")
        .update({ role: editRole })
        .eq("user_id", editUser.id));
    } else {
      ({ error } = await supabase
        .from("user_roles")
        .insert({ user_id: editUser.id, role: editRole }));
    }

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الدور", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم تحديث دور المستخدم" });
      fetchUsers();
    }
    setEditUser(null);
    setProcessing(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setProcessing(true);

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deleteUser.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف المستخدم", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف المستخدم" });
      fetchUsers();
    }
    setDeleteUser(null);
    setProcessing(false);
  };

  const getRoleIcon = (role: AppRole | null | undefined) => {
    switch (role) {
      case "admin": return Shield;
      case "hall_owner": return Building2;
      case "service_provider": return Package;
      case "dress_seller": return ShoppingBag;
      default: return User;
    }
  };

  const getRoleLabel = (role: AppRole | null | undefined) => {
    switch (role) {
      case "admin": return "مدير";
      case "hall_owner": return "صاحب قاعة";
      case "service_provider": return "مقدم خدمة";
      case "dress_seller": return "بائع فساتين";
      default: return "مستخدم";
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right font-arabic"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right font-arabic">
        إجمالي: {filteredUsers.length} مستخدم
      </p>

      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          return (
            <Card key={user.id} className="card-luxe">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditUser(user);
                        setEditRole(user.role || "user");
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteUser(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-medium font-arabic">{user.full_name || "بدون اسم"}</p>
                      <p className="text-sm text-muted-foreground">{user.phone || "بدون هاتف"}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <RoleIcon className="w-3 h-3 ml-1" />
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل دور المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              المستخدم: {editUser?.full_name || "بدون اسم"}
            </p>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="hall_owner">صاحب قاعة</SelectItem>
                  <SelectItem value="service_provider">مقدم خدمة</SelectItem>
                  <SelectItem value="dress_seller">بائع فساتين</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>إلغاء</Button>
            <Button onClick={handleUpdateRole} disabled={processing} className="gold-gradient">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف المستخدم "{deleteUser?.full_name}"؟
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
