import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>شروط الاستخدام - زفاف</title>
        <meta name="description" content="شروط وأحكام استخدام تطبيق زفاف وفقاً لأنظمة المملكة العربية السعودية" />
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
              آخر تحديث: ١٥ محرم ١٤٤٧هـ (الموافق ٢٠ يوليو ٢٠٢٥م)
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">مقدمة</h2>
              <p>
                مرحباً بك في تطبيق "زفاف". تحكم هذه الشروط والأحكام استخدامك للتطبيق وخدماته، وهي ملزمة قانونياً وفقاً لأنظمة المملكة العربية السعودية، بما في ذلك نظام التجارة الإلكترونية الصادر بالمرسوم الملكي رقم (م/126) وتاريخ 7/11/1440هـ. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">تعريفات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>"التطبيق" أو "المنصة":</strong> تطبيق زفاف للهواتف الذكية والويب</li>
                <li><strong>"نحن" أو "إدارة التطبيق":</strong> الجهة المالكة والمشغلة لتطبيق زفاف</li>
                <li><strong>"المستخدم" أو "أنت":</strong> أي شخص يستخدم التطبيق سواء كان عميلاً أو مقدم خدمة</li>
                <li><strong>"العميل":</strong> المستخدم الذي يبحث عن خدمات أو يقوم بالحجز</li>
                <li><strong>"مقدم الخدمة":</strong> أصحاب القاعات، المصورون، خبراء التجميل، وغيرهم من مقدمي خدمات الأفراح</li>
                <li><strong>"الخدمات":</strong> جميع الخدمات المقدمة عبر التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الأهلية القانونية</h2>
              <p>للتسجيل واستخدام التطبيق، يجب أن:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تكون بالغاً سن الرشد (18 سنة هجرية فأكثر)</li>
                <li>تتمتع بالأهلية القانونية الكاملة للتعاقد</li>
                <li>تقيم في المملكة العربية السعودية أو تستخدم خدماتنا من داخلها</li>
                <li>تقدم معلومات صحيحة ودقيقة عند التسجيل</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">إنشاء الحساب والتحقق</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>يتطلب التسجيل تقديم بريد إلكتروني صحيح ورقم جوال سعودي</li>
                <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
                <li>يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                <li>يحق لنا تعليق أو إغلاق الحسابات التي تنتهك هذه الشروط</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">طبيعة المنصة ودورها</h2>
              <p>
                تطبيق زفاف منصة إلكترونية وسيطة تربط بين العملاء ومقدمي خدمات الأفراح. نوضح التالي:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>نحن وسيط تقني فقط ولسنا طرفاً في العقود بين العملاء ومقدمي الخدمات</li>
                <li>لا نقدم خدمات الأفراح مباشرة</li>
                <li>العلاقة التعاقدية للحجوزات تكون بين العميل ومقدم الخدمة مباشرة</li>
                <li>نسعى لضمان جودة المعلومات المعروضة لكن لا نضمن دقتها الكاملة</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التزامات المستخدم</h2>
              <p>يلتزم المستخدم بـ:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>استخدام التطبيق للأغراض المشروعة فقط</li>
                <li>عدم انتهاك الأنظمة السعودية أو الآداب العامة</li>
                <li>عدم نشر محتوى مخالف للشريعة الإسلامية أو النظام العام</li>
                <li>عدم انتحال شخصية الغير أو تقديم معلومات مضللة</li>
                <li>عدم محاولة اختراق أو تعطيل أنظمة التطبيق</li>
                <li>عدم استخدام التطبيق لأغراض احتيالية أو غير قانونية</li>
                <li>احترام حقوق الملكية الفكرية للغير</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التزامات مقدمي الخدمات</h2>
              <p>يلتزم مقدمو الخدمات بـ:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الحصول على جميع التراخيص والتصاريح اللازمة من الجهات المختصة</li>
                <li>تقديم معلومات دقيقة وصحيحة عن خدماتهم وأسعارهم</li>
                <li>الالتزام بالحجوزات المؤكدة وتقديم الخدمة وفق المواصفات المعلنة</li>
                <li>الرد على استفسارات العملاء في وقت معقول</li>
                <li>الامتثال لنظام حماية المستهلك السعودي</li>
                <li>إصدار الفواتير الضريبية عند الاقتضاء وفق نظام ضريبة القيمة المضافة</li>
                <li>حماية بيانات العملاء وعدم استخدامها لأغراض غير مصرح بها</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الحجوزات والعقود</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الحجز عبر التطبيق يعد عرضاً للتعاقد مع مقدم الخدمة</li>
                <li>يكتمل العقد بقبول مقدم الخدمة للحجز</li>
                <li>الأسعار المعروضة قد تتغير حتى تأكيد الحجز</li>
                <li>يجب على العميل التحقق من تفاصيل الحجز قبل التأكيد</li>
                <li>أي اتفاقات خاصة يجب توثيقها كتابياً عبر التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">سياسة الإلغاء والاسترداد</h2>
              <p>
                تخضع سياسات الإلغاء والاسترداد لشروط كل مقدم خدمة على حدة، مع مراعاة التالي:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>يجب على مقدم الخدمة الإفصاح عن سياسة الإلغاء بوضوح</li>
                <li>في حال عدم وجود سياسة محددة، يحق للعميل الإلغاء قبل (72) ساعة من الموعد</li>
                <li>يلتزم مقدم الخدمة برد المبالغ وفق سياسته المعلنة</li>
                <li>النزاعات حول الاسترداد تخضع لنظام حماية المستهلك</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التقييمات والمراجعات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>يجب أن تكون التقييمات صادقة وموضوعية ومبنية على تجربة فعلية</li>
                <li>يُحظر نشر تقييمات كاذبة أو مسيئة أو تشهيرية</li>
                <li>يحق لنا حذف التقييمات المخالفة دون إشعار مسبق</li>
                <li>لا يجوز لمقدمي الخدمات تحفيز العملاء على نشر تقييمات إيجابية زائفة</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">الملكية الفكرية</h2>
              <p>
                جميع حقوق الملكية الفكرية للتطبيق بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>العلامة التجارية "زفاف" والشعارات المرتبطة بها</li>
                <li>تصميم التطبيق وواجهاته</li>
                <li>الأكواد البرمجية وقواعد البيانات</li>
                <li>المحتوى النصي والرسومي المملوك لنا</li>
              </ul>
              <p className="mt-2">
                محفوظة لنا أو مرخصة لنا، ولا يجوز استخدامها دون إذن كتابي مسبق. يحتفظ مقدمو الخدمات بحقوق محتواهم المرفوع على التطبيق.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">حدود المسؤولية</h2>
              <p>نوضح حدود مسؤوليتنا وفقاً للتالي:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>لا نتحمل مسؤولية جودة الخدمات المقدمة من مقدمي الخدمات</li>
                <li>لا نضمن توفر التطبيق بشكل دائم أو خلوه من الأخطاء التقنية</li>
                <li>لا نتحمل مسؤولية الأضرار غير المباشرة أو التبعية</li>
                <li>لا نتحمل مسؤولية النزاعات بين العملاء ومقدمي الخدمات</li>
                <li>مسؤوليتنا القصوى تقتصر على المبالغ المدفوعة لنا كعمولة (إن وجدت)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التعويض</h2>
              <p>
                يوافق المستخدم على تعويضنا وإخلاء مسؤوليتنا عن أي مطالبات أو أضرار ناشئة عن:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>انتهاك هذه الشروط والأحكام</li>
                <li>انتهاك حقوق أي طرف ثالث</li>
                <li>أي محتوى ينشره المستخدم على التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">تعليق وإنهاء الحساب</h2>
              <p>يحق لنا تعليق أو إنهاء حسابك في الحالات التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>انتهاك هذه الشروط والأحكام</li>
                <li>تقديم معلومات كاذبة أو مضللة</li>
                <li>ممارسة سلوك يضر بالمستخدمين الآخرين أو بسمعة التطبيق</li>
                <li>أي نشاط غير قانوني أو احتيالي</li>
                <li>بناءً على طلب الجهات المختصة</li>
              </ul>
              <p className="mt-2">
                كما يحق لك إلغاء حسابك في أي وقت من خلال إعدادات التطبيق أو بالتواصل معنا.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">تسوية النزاعات</h2>
              <p>
                في حال نشوء أي نزاع:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>نشجع على حل النزاعات ودياً عبر التواصل المباشر</li>
                <li>يمكن تقديم شكوى عبر التطبيق وسنرد خلال (5) أيام عمل</li>
                <li>النزاعات التي لا يمكن حلها ودياً تخضع لاختصاص المحاكم السعودية</li>
                <li>يمكن للمستهلك تقديم شكوى لوزارة التجارة عبر تطبيق "بلاغ تجاري"</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">القوة القاهرة</h2>
              <p>
                لا نتحمل المسؤولية عن أي تأخير أو إخفاق في تنفيذ التزاماتنا بسبب ظروف خارجة عن إرادتنا، بما في ذلك الكوارث الطبيعية، الحروب، الأوبئة، القرارات الحكومية، أو أي ظروف قاهرة أخرى.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">التعديلات على الشروط</h2>
              <p>
                نحتفظ بالحق في تعديل هذه الشروط. سنخطرك بالتغييرات الجوهرية قبل (30) يوماً من سريانها عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>إشعار داخل التطبيق</li>
                <li>رسالة على بريدك الإلكتروني المسجل</li>
              </ul>
              <p>
                استمرارك في استخدام التطبيق بعد سريان التعديلات يعني موافقتك عليها.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">القانون الواجب التطبيق والاختصاص القضائي</h2>
              <p>
                تخضع هذه الشروط وتُفسر وفقاً لأنظمة المملكة العربية السعودية. تختص المحاكم السعودية بالنظر في أي نزاع ينشأ عن هذه الشروط أو يتعلق بها.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">أحكام عامة</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>التنازل:</strong> لا يجوز لك التنازل عن حقوقك أو التزاماتك بموجب هذه الشروط</li>
                <li><strong>الاستقلالية:</strong> إذا حُكم ببطلان أي بند، تظل البنود الأخرى سارية</li>
                <li><strong>الاتفاق الكامل:</strong> تمثل هذه الشروط الاتفاق الكامل بيننا وبينك</li>
                <li><strong>التواصل:</strong> الإشعارات الرسمية تكون عبر البريد الإلكتروني أو داخل التطبيق</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">اتصل بنا</h2>
              <p>
                لأي استفسارات حول شروط الاستخدام، تواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: support@zafaf.app</li>
                <li>صفحة "المساعدة" في التطبيق</li>
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
            <p className="mt-1">المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
