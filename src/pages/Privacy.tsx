import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>سياسة الخصوصية - زفاف</title>
        <meta name="description" content="سياسة الخصوصية لتطبيق زفاف - تعرف على كيفية حماية بياناتك" />
      </Helmet>
      
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">سياسة الخصوصية</h1>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                العودة
              </Link>
            </Button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <p className="text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مقدمة</h2>
              <p>
                مرحباً بك في تطبيق زفاف. نحن نقدر ثقتك بنا ونلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام تطبيقنا.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">المعلومات التي نجمعها</h2>
              <p>نقوم بجمع أنواع المعلومات التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف عند التسجيل</li>
                <li><strong>معلومات الملف الشخصي:</strong> المدينة، الصورة الشخصية (اختياري)</li>
                <li><strong>بيانات الاستخدام:</strong> تفاعلاتك مع التطبيق، الحجوزات، المفضلات</li>
                <li><strong>معلومات الجهاز:</strong> نوع الجهاز، نظام التشغيل، معرف الجهاز</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">كيف نستخدم معلوماتك</h2>
              <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>توفير وتحسين خدماتنا</li>
                <li>معالجة الحجوزات والمعاملات</li>
                <li>إرسال إشعارات مهمة حول حجوزاتك</li>
                <li>التواصل معك بشأن استفساراتك</li>
                <li>تخصيص تجربتك في التطبيق</li>
                <li>ضمان أمان حسابك</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مشاركة المعلومات</h2>
              <p>
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>مع مقدمي الخدمات (قاعات الأفراح، المصورين، إلخ) لإتمام حجوزاتك</li>
                <li>للامتثال للمتطلبات القانونية</li>
                <li>لحماية حقوقنا وسلامة مستخدمينا</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">أمان البيانات</h2>
              <p>
                نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. تشمل هذه الإجراءات التشفير والخوادم الآمنة وضوابط الوصول.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">حقوقك</h2>
              <p>لديك الحق في:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>طلب حذف بياناتك</li>
                <li>سحب موافقتك في أي وقت</li>
                <li>تقديم شكوى إلى الجهات المختصة</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">ملفات تعريف الارتباط</h2>
              <p>
                نستخدم ملفات تعريف الارتباط وتقنيات مماثلة لتحسين تجربتك وتحليل استخدام التطبيق. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الاحتفاظ بالبيانات</h2>
              <p>
                نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. يمكنك طلب حذف حسابك في أي وقت.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التغييرات على سياسة الخصوصية</h2>
              <p>
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">اتصل بنا</h2>
              <p>
                إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: privacy@zafaf.app</li>
                <li>من خلال صفحة "المساعدة" في التطبيق</li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} زفاف. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
