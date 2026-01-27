import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>سياسة الخصوصية - زفاف</title>
        <meta name="description" content="سياسة الخصوصية لتطبيق زفاف - حماية بياناتك وفقاً لنظام حماية البيانات الشخصية السعودي" />
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
              آخر تحديث: ١٥ محرم ١٤٤٧هـ (الموافق ٢٠ يوليو ٢٠٢٥م)
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مقدمة</h2>
              <p>
                نلتزم في تطبيق "زفاف" بحماية خصوصية مستخدمينا وفقاً لأحكام نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) وتاريخ 9/2/1443هـ ولائحته التنفيذية. توضح هذه السياسة كيفية جمع ومعالجة وحماية بياناتك الشخصية.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الجهة المسؤولة عن معالجة البيانات</h2>
              <p>
                تطبيق زفاف مسجل في المملكة العربية السعودية، ونعمل بموجب السجل التجاري الخاص بنا. نحن الجهة المسؤولة عن معالجة بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">البيانات الشخصية التي نجمعها</h2>
              <p>نجمع الأنواع التالية من البيانات الشخصية بموافقتك الصريحة:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>بيانات التعريف:</strong> الاسم الكامل، البريد الإلكتروني، رقم الجوال</li>
                <li><strong>بيانات الموقع:</strong> المدينة والمنطقة (لتقديم خدمات قريبة منك)</li>
                <li><strong>بيانات الملف الشخصي:</strong> الصورة الشخصية (اختياري)</li>
                <li><strong>بيانات الاستخدام:</strong> سجل الحجوزات، المفضلات، التقييمات</li>
                <li><strong>بيانات الجهاز:</strong> نوع الجهاز، نظام التشغيل، معرف الجهاز للإشعارات</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الأساس النظامي لمعالجة البيانات</h2>
              <p>نعالج بياناتك الشخصية بناءً على:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>موافقتك الصريحة:</strong> التي تمنحها عند التسجيل واستخدام التطبيق</li>
                <li><strong>تنفيذ العقد:</strong> لتقديم خدمات الحجز والتواصل مع مقدمي الخدمات</li>
                <li><strong>المصلحة المشروعة:</strong> لتحسين خدماتنا وضمان أمان التطبيق</li>
                <li><strong>الالتزام النظامي:</strong> للامتثال للأنظمة السعودية المعمول بها</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">أغراض معالجة البيانات</h2>
              <p>نستخدم بياناتك للأغراض التالية فقط:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>إنشاء وإدارة حسابك في التطبيق</li>
                <li>تسهيل عمليات الحجز والتواصل مع مقدمي الخدمات</li>
                <li>إرسال إشعارات متعلقة بحجوزاتك ومواعيدك</li>
                <li>تخصيص تجربتك وعرض خدمات مناسبة لموقعك</li>
                <li>تحسين جودة التطبيق وخدماتنا</li>
                <li>حماية حسابك ومنع الاحتيال</li>
                <li>الامتثال للمتطلبات النظامية</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مشاركة البيانات مع أطراف ثالثة</h2>
              <p>
                لا نبيع ولا نؤجر ولا نتاجر ببياناتك الشخصية. قد نشارك بياناتك في الحالات التالية فقط:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>مقدمو الخدمات:</strong> نشارك بيانات الاتصال الضرورية مع مقدمي الخدمات (قاعات الأفراح، المصورين، إلخ) لإتمام حجوزاتك بموافقتك</li>
                <li><strong>الجهات الحكومية:</strong> عند الطلب من الجهات المختصة وفقاً للأنظمة السعودية</li>
                <li><strong>مقدمو الخدمات التقنية:</strong> شركات الاستضافة والتخزين السحابي الموثوقة التي تلتزم بمعايير حماية البيانات</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">نقل البيانات خارج المملكة</h2>
              <p>
                في حال نقل بياناتك خارج المملكة العربية السعودية، نضمن:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الحصول على موافقتك المسبقة</li>
                <li>نقل البيانات لدول توفر مستوى حماية مناسباً</li>
                <li>توقيع اتفاقيات تضمن حماية بياناتك وفق المعايير السعودية</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">حماية البيانات وأمنها</h2>
              <p>
                نطبق إجراءات أمنية صارمة تشمل:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تشفير البيانات أثناء النقل والتخزين باستخدام بروتوكولات حديثة</li>
                <li>ضوابط وصول صارمة للموظفين المخولين فقط</li>
                <li>مراقبة أمنية مستمرة لاكتشاف التهديدات</li>
                <li>نسخ احتياطية منتظمة لضمان سلامة البيانات</li>
                <li>تدريب الموظفين على أفضل ممارسات حماية البيانات</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">حقوقك وفقاً لنظام حماية البيانات الشخصية</h2>
              <p>يكفل لك النظام الحقوق التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>حق الاطلاع:</strong> الحصول على نسخة من بياناتك الشخصية المحفوظة لدينا</li>
                <li><strong>حق التصحيح:</strong> تصحيح أي بيانات غير دقيقة أو ناقصة</li>
                <li><strong>حق الحذف:</strong> طلب حذف بياناتك عند انتفاء الحاجة إليها</li>
                <li><strong>حق سحب الموافقة:</strong> سحب موافقتك على معالجة البيانات في أي وقت</li>
                <li><strong>حق الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة</li>
                <li><strong>حق نقل البيانات:</strong> الحصول على بياناتك بصيغة قابلة للقراءة آلياً</li>
                <li><strong>حق الشكوى:</strong> تقديم شكوى للهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)</li>
              </ul>
              <p className="mt-2">
                لممارسة هذه الحقوق، تواصل معنا عبر البريد الإلكتروني: privacy@zafaf.app
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مدة الاحتفاظ بالبيانات</h2>
              <p>
                نحتفظ ببياناتك الشخصية طوال فترة نشاط حسابك أو حسب الحاجة لتقديم خدماتنا. عند إلغاء حسابك:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>نحذف بياناتك الشخصية خلال (30) يوماً</li>
                <li>نحتفظ ببيانات المعاملات المالية لمدة (10) سنوات للامتثال لنظام الزكاة والضريبة</li>
                <li>قد نحتفظ ببيانات مجهولة الهوية لأغراض إحصائية</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">ملفات تعريف الارتباط (الكوكيز)</h2>
              <p>
                نستخدم ملفات تعريف الارتباط الضرورية لتشغيل التطبيق وتحسين تجربتك. يمكنك التحكم في إعدادات الكوكيز من خلال متصفحك، علماً بأن تعطيلها قد يؤثر على بعض وظائف التطبيق.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">حماية بيانات الأطفال</h2>
              <p>
                التطبيق غير موجه للأشخاص دون سن (18) عاماً. لا نجمع عمداً بيانات شخصية من الأطفال. إذا علمنا بجمع بيانات طفل، سنحذفها فوراً.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التحديثات على سياسة الخصوصية</h2>
              <p>
                قد نحدث هذه السياسة من وقت لآخر. سنخطرك بالتغييرات الجوهرية عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>إشعار داخل التطبيق</li>
                <li>رسالة بريد إلكتروني على عنوانك المسجل</li>
              </ul>
              <p>
                استمرارك في استخدام التطبيق بعد التحديث يعني موافقتك على السياسة المحدثة.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الجهة الرقابية</h2>
              <p>
                نخضع لرقابة الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) فيما يتعلق بحماية البيانات الشخصية. يحق لك تقديم شكوى للهيئة في حال عدم رضاك عن معالجة بياناتك.
              </p>
              <p className="mt-2">
                الموقع الإلكتروني للهيئة: <a href="https://sdaia.gov.sa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sdaia.gov.sa</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">اتصل بنا</h2>
              <p>
                لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقك، تواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: privacy@zafaf.app</li>
                <li>صفحة "المساعدة" في التطبيق</li>
              </ul>
              <p className="mt-2">
                سنرد على طلبك خلال (30) يوماً من تاريخ استلامه.
              </p>
            </section>

            {/* Link to Terms */}
            <section className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                اطلع أيضاً على{" "}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  شروط الاستخدام
                </Link>
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} زفاف. جميع الحقوق محفوظة.</p>
            <p className="mt-1">المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
