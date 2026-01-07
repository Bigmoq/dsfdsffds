import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, MapPin, Tag, Edit2, Trash2, Eye, EyeOff, 
  Loader2, ShoppingBag, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddDressSheet } from "./AddDressSheet";
import type { Database } from "@/integrations/supabase/types";

type Dress = Database["public"]["Tables"]["dresses"]["Row"];

export function DressSellerManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDress, setShowAddDress] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dressToDelete, setDressToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDresses();
    }
  }, [user]);

  const fetchDresses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("dresses")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDresses(data);
    }
    setLoading(false);
  };

  const confirmDeleteDress = (dressId: string) => {
    setDressToDelete(dressId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDress = async () => {
    if (!dressToDelete) return;
    
    const { error } = await supabase
      .from("dresses")
      .delete()
      .eq("id", dressToDelete);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الإعلان",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحذف",
        description: "تم حذف الإعلان بنجاح",
      });
      fetchDresses();
    }
    
    setDeleteDialogOpen(false);
    setDressToDelete(null);
  };

  const toggleDressStatus = async (dress: Dress) => {
    const { error } = await supabase
      .from("dresses")
      .update({ is_active: !dress.is_active })
      .eq("id", dress.id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الإعلان",
        variant: "destructive",
      });
    } else {
      toast({
        title: dress.is_active ? "تم إيقاف الإعلان" : "تم تفعيل الإعلان",
        description: dress.is_active 
          ? "لن يظهر الإعلان للمشترين" 
          : "أصبح الإعلان مرئياً للمشترين",
      });
      fetchDresses();
    }
  };

  const markAsSold = async (dress: Dress) => {
    const { error } = await supabase
      .from("dresses")
      .update({ is_sold: true, is_active: false })
      .eq("id", dress.id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الفستان",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تهانينا! 🎉",
        description: "تم وضع علامة تم البيع على الفستان",
      });
      fetchDresses();
    }
  };

  const handleEdit = (dress: Dress) => {
    setEditingDress(dress);
    setShowAddDress(true);
  };

  const handleSheetClose = () => {
    setShowAddDress(false);
    setEditingDress(null);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowAddDress(true)}
          className="gold-gradient text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          <span className="font-arabic">إضافة فستان</span>
        </Button>
        <h2 className="font-display text-xl font-bold text-foreground">
          فساتيني
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{dresses.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {dresses.filter(d => d.is_active && !d.is_sold).length}
          </p>
          <p className="text-xs text-muted-foreground">نشط</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">
            {dresses.filter(d => d.is_sold).length}
          </p>
          <p className="text-xs text-muted-foreground">مُباع</p>
        </div>
      </div>

      {/* Dresses List */}
      {dresses.length > 0 ? (
        <div className="space-y-4">
          {dresses.map((dress, index) => (
            <motion.div
              key={dress.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card-luxe rounded-xl overflow-hidden ${
                dress.is_sold ? "opacity-60" : ""
              }`}
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {dress.images && dress.images[0] ? (
                    <img 
                      src={dress.images[0]} 
                      alt={dress.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-1 flex-wrap">
                      {dress.is_sold ? (
                        <Badge className="bg-primary/10 text-primary border-0">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تم البيع
                        </Badge>
                      ) : dress.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-0">
                          نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-600 border-0">
                          متوقف
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-foreground text-right truncate">
                      {dress.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {dress.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {dress.city}
                    </span>
                  </div>

                  <p className="font-bold text-primary">
                    SAR {dress.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!dress.is_sold && (
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border/50">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => confirmDeleteDress(dress.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleEdit(dress)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => toggleDressStatus(dress)}
                    >
                      {dress.is_active ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 gold-gradient text-white"
                    onClick={() => markAsSold(dress)}
                  >
                    <CheckCircle className="w-3 h-3 ml-1" />
                    تم البيع
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            لا توجد فساتين
          </h3>
          <p className="text-muted-foreground font-arabic text-sm mb-4">
            أضيفي فستانك الأول للبدء في البيع
          </p>
          <Button onClick={() => setShowAddDress(true)} className="gold-gradient text-white">
            <Plus className="w-4 h-4 ml-2" />
            <span className="font-arabic">إضافة فستان</span>
          </Button>
        </div>
      )}

      <AddDressSheet
        open={showAddDress}
        onOpenChange={handleSheetClose}
        editingDress={editingDress}
        onSuccess={fetchDresses}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا الفستان؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
