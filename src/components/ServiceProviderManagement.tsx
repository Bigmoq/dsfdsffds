import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Star, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AddServiceProviderSheet } from "./AddServiceProviderSheet";
import { EditServiceProviderSheet } from "./EditServiceProviderSheet";
import { ManagePackagesSheet } from "./ManagePackagesSheet";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];

export function ServiceProviderManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [showEditProvider, setShowEditProvider] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProviders();
    }
  }, [user]);

  const fetchProviders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setProviders(data);
    }
    setLoading(false);
  };

  const confirmDeleteProvider = (providerId: string) => {
    setProviderToDelete(providerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProvider = async () => {
    if (!providerToDelete) return;
    
    const { error } = await supabase
      .from("service_providers")
      .delete()
      .eq("id", providerToDelete);
    
    if (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الخدمة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحذف",
        description: "تم حذف الخدمة بنجاح",
      });
      fetchProviders();
    }
    
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  const openPackages = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowPackages(true);
  };

  const getCategoryLabel = (categoryId: string): string => {
    const categories: Record<string, string> = {
      'hair': 'تساريح',
      'makeup': 'مكياج',
      'coordinator': 'مشرفات قاعة',
      'kosha': 'كوش افراح',
      'coffee-corner': 'ركن قهوة',
      'favors': 'توزيعات',
      'photographer-w': 'تصوير نسائي',
      'photographer-m': 'تصوير رجالي',
      'henna': 'نقاشات حناء',
      'dj': 'دي جي',
      'singers': 'مطربات',
      'buffet': 'بوفيهات',
      'sabbabeen': 'قهوجيين وصبابين',
      'incense': 'تطييب وبخور',
      'ardah': 'فرق العرضة',
    };
    return categories[categoryId] || categoryId;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowAddProvider(true)}
          className="gold-gradient text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          <span className="font-arabic">إضافة خدمة</span>
        </Button>
        <h2 className="font-display text-xl font-bold text-foreground">
          خدماتي
        </h2>
      </div>
      
      {providers.length > 0 ? (
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-luxe rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => openPackages(provider)}
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingProvider(provider);
                        setShowEditProvider(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => confirmDeleteProvider(provider.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {provider.name_ar}
                    </h3>
                    <div className="flex items-center gap-2 justify-end text-muted-foreground text-sm">
                      <span className="font-arabic">{provider.city}</span>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">{provider.rating}</span>
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground font-arabic">
                      ({provider.reviews_count} تقييم)
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-arabic">
                    {getCategoryLabel(provider.category_id)}
                  </span>
                </div>
                
                {provider.description && (
                  <p className="text-muted-foreground font-arabic text-sm mt-3 text-right line-clamp-2">
                    {provider.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            لا توجد خدمات
          </h3>
          <p className="text-muted-foreground font-arabic text-sm mb-4">
            أضف خدمتك الأولى للبدء في استقبال الطلبات
          </p>
          <Button onClick={() => setShowAddProvider(true)} className="gold-gradient text-white">
            <Plus className="w-4 h-4 ml-2" />
            <span className="font-arabic">إضافة خدمة</span>
          </Button>
        </div>
      )}
      
      <AddServiceProviderSheet
        open={showAddProvider}
        onOpenChange={setShowAddProvider}
        onSuccess={fetchProviders}
      />
      
      {selectedProvider && (
        <ManagePackagesSheet
          open={showPackages}
          onOpenChange={setShowPackages}
          provider={selectedProvider}
        />
      )}
      
      {editingProvider && (
        <EditServiceProviderSheet
          open={showEditProvider}
          onOpenChange={setShowEditProvider}
          provider={editingProvider}
          onSuccess={fetchProviders}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه الخدمة؟ سيتم حذف جميع الباقات والبيانات المرتبطة بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProvider}
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
