import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>شروط الاستخدام - زفاف</title>
        <meta name="description" content="شروط وأحكام استخدام تطبيق زفاف لحجز خدمات الأفراح" />
      </Helmet>
      
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">شروط الاستخدام</h1>
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
                مرحباً بك في تطبيق زفاف. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">تعريفات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>"التطبيق":</strong> تطبيق زفاف للهواتف الذكية والويب</li>
                <li><strong>"المستخدم":</strong> أي شخص يستخدم التطبيق سواء كان عميلاً أو مقدم خدمة</li>
                <li><strong>"مقدم الخدمة":</strong> أصحاب القاعات، المصورون، خبراء التجميل، وغيرهم</li>
                <li><strong>"الخدمات":</strong> جميع الخدمات المقدمة عبر التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">شروط التسجيل</h2>
              <p>للتسجيل في التطبيق، يجب أن:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تكون بالغاً (18 سنة فأكثر)</li>
                <li>تقدم معلومات صحيحة ودقيقة</li>
                <li>تحافظ على سرية بيانات حسابك</li>
                <li>تخطرنا فوراً بأي استخدام غير مصرح به</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">استخدام التطبيق</h2>
              <p>يوافق المستخدم على:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>استخدام التطبيق للأغراض المشروعة فقط</li>
                <li>عدم انتهاك حقوق الآخرين أو خصوصيتهم</li>
                <li>عدم نشر محتوى مسيء أو غير لائق</li>
                <li>عدم محاولة اختراق أو تعطيل التطبيق</li>
                <li>الالتزام بالقوانين والأنظمة المعمول بها</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الحجوزات والمدفوعات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الحجوزات تخضع لتوفر الخدمة وموافقة مقدم الخدمة</li>
                <li>الأسعار المعروضة قابلة للتغيير حسب مقدم الخدمة</li>
                <li>سياسات الإلغاء والاسترداد تختلف حسب كل مقدم خدمة</li>
                <li>التطبيق يعمل كوسيط ولا يتحمل مسؤولية النزاعات المالية</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مسؤوليات مقدمي الخدمات</h2>
              <p>يلتزم مقدمو الخدمات بـ:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تقديم معلومات دقيقة عن خدماتهم وأسعارهم</li>
                <li>الحفاظ على جودة الخدمة المعلن عنها</li>
                <li>الرد على استفسارات العملاء في وقت معقول</li>
                <li>الالتزام بالحجوزات المؤكدة</li>
                <li>الحصول على التراخيص اللازمة لمزاولة نشاطهم</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التقييمات والمراجعات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>يجب أن تكون التقييمات صادقة وعادلة</li>
                <li>يحق لنا إزالة التقييمات المسيئة أو الكاذبة</li>
                <li>لا يجوز التلاعب بنظام التقييمات</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الملكية الفكرية</h2>
              <p>
                جميع المحتويات والعلامات التجارية والشعارات في التطبيق مملوكة لنا أو مرخصة لنا. لا يجوز نسخها أو استخدامها دون إذن كتابي مسبق.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">إخلاء المسؤولية</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>التطبيق يعمل كمنصة وسيطة فقط</li>
                <li>لا نضمن جودة الخدمات المقدمة من مقدمي الخدمات</li>
                <li>لا نتحمل مسؤولية أي أضرار ناتجة عن استخدام التطبيق</li>
                <li>لا نضمن توفر التطبيق بشكل دائم ومستمر</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">تعليق وإنهاء الحساب</h2>
              <p>يحق لنا تعليق أو إنهاء حسابك في حالة:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>انتهاك شروط الاستخدام</li>
                <li>تقديم معلومات كاذبة</li>
                <li>سلوك يضر بالمستخدمين الآخرين</li>
                <li>أي نشاط غير قانوني</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التعديلات</h2>
              <p>
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بالتغييرات الجوهرية عبر التطبيق. استمرارك في استخدام التطبيق يعني موافقتك على الشروط المحدثة.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">القانون الواجب التطبيق</h2>
              <p>
                تخضع هذه الشروط وتفسر وفقاً لأنظمة المملكة العربية السعودية. أي نزاع ينشأ يخضع لاختصاص المحاكم السعودية.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">اتصل بنا</h2>
              <p>
                لأي استفسارات حول شروط الاستخدام، يرجى التواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: support@zafaf.app</li>
                <li>من خلال صفحة "المساعدة" في التطبيق</li>
              </ul>
            </section>

            {/* Link to Privacy Policy */}
            <section className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                اطلع أيضاً على{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  سياسة الخصوصية
                </Link>
              </p>
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

export default Terms;
