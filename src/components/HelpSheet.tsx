import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  BookOpen,
  CreditCard,
  Calendar,
  Shield,
  Users
} from "lucide-react";

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    category: "الحجوزات",
    icon: Calendar,
    questions: [
      {
        q: "كيف أحجز قاعة أفراح؟",
        a: "يمكنك تصفح القاعات المتاحة من الصفحة الرئيسية، اختر القاعة المناسبة، ثم اضغط على 'احجز الآن' واختر التاريخ المناسب. ستتلقى تأكيداً على طلب الحجز."
      },
      {
        q: "كيف أحجز مقدم خدمة؟",
        a: "من قسم 'الخدمات'، اختر الفئة المطلوبة (مصور، مكياج، كوافير...)، ثم اختر مقدم الخدمة واضغط على 'احجز الآن' لاختيار التاريخ والباقة المناسبة."
      },
      {
        q: "هل يمكنني إلغاء الحجز؟",
        a: "نعم، يمكنك إلغاء الحجز من قسم 'حجوزاتي' في الملف الشخصي. يرجى ملاحظة أن سياسة الإلغاء تختلف حسب مقدم الخدمة والوقت المتبقي للحجز."
      },
      {
        q: "كيف أعرف حالة حجزي؟",
        a: "يمكنك متابعة حالة جميع حجوزاتك من قسم 'حجوزاتي'. ستتلقى أيضاً إشعارات عند تحديث حالة الحجز."
      }
    ]
  },
  {
    category: "الدفع",
    icon: CreditCard,
    questions: [
      {
        q: "ما هي طرق الدفع المتاحة؟",
        a: "نوفر عدة طرق للدفع تشمل: البطاقات الائتمانية (فيزا، ماستركارد)، مدى، Apple Pay، والدفع عند الاستلام (حسب مقدم الخدمة)."
      },
      {
        q: "هل مدفوعاتي آمنة؟",
        a: "نعم، جميع عمليات الدفع مشفرة ومحمية بأعلى معايير الأمان. نحن نستخدم بوابات دفع موثوقة ومعتمدة."
      },
      {
        q: "كيف أسترد أموالي؟",
        a: "في حالة إلغاء الحجز المؤهل للاسترداد، ستتم إعادة المبلغ إلى نفس وسيلة الدفع خلال 5-10 أيام عمل."
      }
    ]
  },
  {
    category: "الحساب",
    icon: Users,
    questions: [
      {
        q: "كيف أنشئ حساباً جديداً؟",
        a: "اضغط على 'تسجيل الدخول' ثم 'إنشاء حساب جديد'. أدخل بريدك الإلكتروني وكلمة المرور، ثم أكمل بياناتك الشخصية."
      },
      {
        q: "نسيت كلمة المرور، ماذا أفعل؟",
        a: "اضغط على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، أدخل بريدك الإلكتروني وستصلك رسالة لإعادة تعيين كلمة المرور."
      },
      {
        q: "كيف أصبح مقدم خدمة؟",
        a: "من الملف الشخصي، اضغط على 'انضم كمقدم خدمة' واختر نوع الخدمة التي تقدمها. سيتم مراجعة طلبك والرد عليك خلال 24-48 ساعة."
      }
    ]
  },
  {
    category: "الأمان والخصوصية",
    icon: Shield,
    questions: [
      {
        q: "كيف تحمون بياناتي الشخصية؟",
        a: "نحن نتبع أعلى معايير حماية البيانات. بياناتك مشفرة ولا نشاركها مع أي طرف ثالث دون موافقتك."
      },
      {
        q: "هل يمكنني حذف حسابي؟",
        a: "نعم، يمكنك طلب حذف حسابك من خلال التواصل مع الدعم الفني. سيتم حذف جميع بياناتك نهائياً."
      }
    ]
  }
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "واتساب",
    description: "تواصل معنا مباشرة",
    action: "https://wa.me/966500000000",
    buttonText: "ابدأ المحادثة",
    color: "bg-green-500"
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    description: "support@zefaf.app",
    action: "mailto:support@zefaf.app",
    buttonText: "أرسل رسالة",
    color: "bg-blue-500"
  },
  {
    icon: Phone,
    title: "الهاتف",
    description: "من 9 صباحاً - 9 مساءً",
    action: "tel:+966500000000",
    buttonText: "اتصل الآن",
    color: "bg-primary"
  }
];

export function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-right font-display flex items-center justify-end gap-2">
            <span>المساعدة والدعم</span>
            <HelpCircle className="w-5 h-5 text-primary" />
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Contact Methods */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">تواصل معنا</h3>
            </div>

            <div className="space-y-3">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Button size="sm" variant="outline" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span className="font-arabic text-xs">{method.buttonText}</span>
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-sm">{method.title}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center`}>
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">الأسئلة الشائعة</h3>
            </div>

            <div className="space-y-4">
              {faqs.map((category, catIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + catIndex * 0.1 }}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
                    <category.icon className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">{category.category}</h4>
                  </div>
                  
                  <Accordion type="single" collapsible className="px-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${catIndex}-${index}`} className="border-b-0">
                        <AccordionTrigger className="text-right text-sm py-3 hover:no-underline">
                          <span className="text-right flex-1">{faq.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-right text-sm text-muted-foreground pb-3 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-4 border-t"
          >
            <p className="text-xs text-muted-foreground mb-1">تطبيق زفاف</p>
            <p className="text-xs text-muted-foreground">الإصدار 1.0.0</p>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
