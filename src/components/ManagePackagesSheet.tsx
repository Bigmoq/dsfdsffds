import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];
type ServicePackage = Database["public"]["Tables"]["service_packages"]["Row"];

interface ManagePackagesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider;
}

export function ManagePackagesSheet({ open, onOpenChange, provider }: ManagePackagesSheetProps) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (open && provider) {
      fetchPackages();
    }
  }, [open, provider]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("service_packages")
      .select("*")
      .eq("provider_id", provider.id)
      .order("price", { ascending: true });
    
    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      name_en: "",
      description: "",
      price: "",
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAddPackage = async () => {
    if (!formData.name_ar || !formData.price) return;
    
    try {
      const { error } = await supabase.from("service_packages").insert({
        provider_id: provider.id,
        name_ar: formData.name_ar,
        name_en: formData.name_en || null,
        description: formData.description || null,
        price: parseInt(formData.price),
      });
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة!",
        description: "تم إضافة الباقة بنجاح",
      });
      
      fetchPackages();
      resetForm();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة الباقة",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePackage = async (packageId: string) => {
    if (!formData.name_ar || !formData.price) return;
    
    try {
      const { error } = await supabase
        .from("service_packages")
        .update({
          name_ar: formData.name_ar,
          name_en: formData.name_en || null,
          description: formData.description || null,
          price: parseInt(formData.price),
        })
        .eq("id", packageId);
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث!",
        description: "تم تحديث الباقة بنجاح",
      });
      
      fetchPackages();
      resetForm();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الباقة",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .delete()
        .eq("id", packageId);
      
      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف الباقة بنجاح",
      });
      
      fetchPackages();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الباقة",
        variant: "destructive",
      });
    }
  };

  const startEdit = (pkg: ServicePackage) => {
    setFormData({
      name_ar: pkg.name_ar,
      name_en: pkg.name_en || "",
      description: pkg.description || "",
      price: pkg.price.toString(),
    });
    setEditingId(pkg.id);
    setShowAddForm(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right mb-4">
          <SheetTitle className="font-display text-2xl">
            باقات {provider.name_ar}
          </SheetTitle>
        </SheetHeader>
        
        {/* Add Package Button */}
        {!showAddForm && !editingId && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full gold-gradient text-white mb-4"
          >
            <Plus className="w-4 h-4 ml-2" />
            <span className="font-arabic">إضافة باقة جديدة</span>
          </Button>
        )}
        
        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxe rounded-xl p-4 mb-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
              >
                <X className="w-5 h-5" />
              </Button>
              <h4 className="font-display font-bold text-foreground">
                {editingId ? "تعديل الباقة" : "إضافة باقة جديدة"}
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic text-sm">الاسم بالإنجليزية</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Package Name"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic text-sm">الاسم بالعربية *</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder="اسم الباقة"
                  className="text-right font-arabic"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-arabic text-sm">السعر (ر.س) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-arabic text-sm">وصف الباقة</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب تفاصيل الباقة وما تتضمنه"
                className="text-right font-arabic min-h-[80px]"
                dir="rtl"
              />
            </div>
            
            <Button
              onClick={() => editingId ? handleUpdatePackage(editingId) : handleAddPackage()}
              disabled={!formData.name_ar || !formData.price}
              className="w-full gold-gradient text-white"
            >
              <Check className="w-4 h-4 ml-2" />
              <span className="font-arabic">
                {editingId ? "حفظ التعديلات" : "إضافة الباقة"}
              </span>
            </Button>
          </motion.div>
        )}
        
        {/* Packages List */}
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))
          ) : packages.length > 0 ? (
            packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card-luxe rounded-xl p-4 ${editingId === pkg.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => startEdit(pkg)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <h4 className="font-display font-bold text-foreground">
                      {pkg.name_ar}
                    </h4>
                    {pkg.name_en && (
                      <p className="text-sm text-muted-foreground">{pkg.name_en}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-lg">
                    {pkg.price.toLocaleString()} ر.س
                  </span>
                  {pkg.description && (
                    <p className="text-muted-foreground font-arabic text-sm text-right flex-1 mr-4 line-clamp-1">
                      {pkg.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-display font-bold text-foreground mb-1">
                لا توجد باقات
              </h4>
              <p className="text-muted-foreground font-arabic text-sm">
                أضف باقات الأسعار لخدمتك
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
