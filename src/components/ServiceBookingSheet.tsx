import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Package, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ServicePackage {
  id: string;
  name_ar: string;
  name_en: string | null;
  price: number;
  description: string | null;
}

interface ServiceBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    name_ar: string;
    name_en?: string | null;
  };
  packages: ServicePackage[];
  initialDate?: Date;
  initialPackage?: ServicePackage;
}

export const ServiceBookingSheet = ({ isOpen, onClose, provider, packages, initialDate, initialPackage }: ServiceBookingSheetProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(initialPackage || null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const { toast } = useToast();

  // Update selected date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  // Update selected package when initialPackage changes
  useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage);
    }
  }, [initialPackage]);

  // Fetch availability for the provider
  const { data: availability } = useQuery({
    queryKey: ['provider-availability', provider.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_provider_availability')
        .select('date, status')
        .eq('provider_id', provider.id);
      
      if (error) throw error;
      return data;
    },
  });

  const bookedDates = availability
    ?.filter(a => a.status === 'booked' || a.status === 'unavailable')
    .map(a => new Date(a.date)) || [];

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    return bookedDates.some(
      bookedDate => bookedDate.toDateString() === date.toDateString()
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedPackage) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار التاريخ والباقة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "يرجى تسجيل الدخول",
          description: "يجب تسجيل الدخول لإتمام الحجز",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('service_bookings')
        .insert({
          provider_id: provider.id,
          package_id: selectedPackage.id,
          user_id: user.id,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          total_price: selectedPackage.price,
          notes: notes.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      setBookingConfirmed(true);
      toast({
        title: "تم إرسال الحجز",
        description: "سيتم مراجعة طلبك وتأكيده قريباً",
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الحجز",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedPackage(null);
    setNotes("");
    setBookingConfirmed(false);
    onClose();
  };

  if (bookingConfirmed) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">تم إرسال الحجز بنجاح!</h2>
              <p className="text-muted-foreground">
                سيتم مراجعة طلبك من قبل {provider.name_ar} وتأكيده قريباً
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 w-full max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">التاريخ</span>
                <span className="font-medium">{selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: ar })}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">الباقة</span>
                <span className="font-medium">{selectedPackage?.name_ar}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-bold text-primary">{selectedPackage?.price.toLocaleString()} ر.س</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full max-w-sm">
              إغلاق
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="text-right mb-4">
          <SheetTitle>حجز موعد</SheetTitle>
          <SheetDescription>
            احجز موعداً مع {provider.name_ar}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Date Selection */}
          <div>
            <Label className="flex items-center gap-2 mb-3 text-base">
              <CalendarDays className="w-5 h-5" />
              اختر التاريخ
            </Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                locale={ar}
                className={cn("rounded-xl border pointer-events-auto")}
              />
            </div>
            {selectedDate && (
              <p className="text-center mt-2 text-sm text-muted-foreground">
                التاريخ المختار: {format(selectedDate, 'EEEE، dd MMMM yyyy', { locale: ar })}
              </p>
            )}
          </div>

          {/* Package Selection */}
          <div>
            <Label className="flex items-center gap-2 mb-3 text-base">
              <Package className="w-5 h-5" />
              اختر الباقة
            </Label>
            <div className="grid gap-3">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedPackage?.id === pkg.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border"
                  )}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{pkg.name_ar}</h4>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                        )}
                      </div>
                      <Badge variant={selectedPackage?.id === pkg.id ? "default" : "secondary"}>
                        {pkg.price.toLocaleString()} ر.س
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 block">
              ملاحظات إضافية (اختياري)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي ملاحظات أو متطلبات خاصة..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedPackage && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">ملخص الحجز</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">مقدم الخدمة</span>
                    <span>{provider.name_ar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التاريخ</span>
                    <span>{format(selectedDate, 'dd/MM/yyyy', { locale: ar })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الباقة</span>
                    <span>{selectedPackage.name_ar}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">الإجمالي</span>
                    <span className="font-bold text-primary">{selectedPackage.price.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedPackage || isSubmitting}
            className="w-full h-12 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الإرسال...
              </>
            ) : (
              "تأكيد الحجز"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
