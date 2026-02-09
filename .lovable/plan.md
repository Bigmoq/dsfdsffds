

# خطة إصلاح ملف الهجرة - جعله آمن للتنفيذ المتكرر

## المشكلة
ملف `complete-migration.sql` الحالي يفشل عند تنفيذه أكثر من مرة لأنه يحاول إنشاء جداول موجودة بالفعل.

## الحل
تحويل جميع الأوامر إلى نمط **Idempotent** بحيث يمكن تنفيذ الملف عدة مرات بدون أخطاء.

---

## التغييرات المطلوبة

### 1. الأنواع (ENUMs)
```text
قبل:  CREATE TYPE public.app_role AS ENUM (...)
بعد:  DO $$ BEGIN
        CREATE TYPE public.app_role AS ENUM (...);
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
```

### 2. الجداول
```text
قبل:  CREATE TABLE public.profiles (...)
بعد:  CREATE TABLE IF NOT EXISTS public.profiles (...)
```

### 3. الفهارس
```text
قبل:  CREATE INDEX idx_name ON table(column)
بعد:  CREATE INDEX IF NOT EXISTS idx_name ON table(column)
```

### 4. سياسات RLS
```text
قبل:  CREATE POLICY "policy_name" ON table ...
بعد:  DROP POLICY IF EXISTS "policy_name" ON table;
      CREATE POLICY "policy_name" ON table ...
```

### 5. الـ Triggers
```text
قبل:  CREATE TRIGGER trigger_name ...
بعد:  DROP TRIGGER IF EXISTS trigger_name ON table;
      CREATE TRIGGER trigger_name ...
```

### 6. الـ Storage Buckets
```text
إضافة التحقق من وجود الـ Bucket قبل إنشائه
```

---

## ملخص التغييرات

| العنصر | الطريقة القديمة | الطريقة الجديدة |
|--------|-----------------|-----------------|
| ENUMs | `CREATE TYPE` | `DO $$ ... EXCEPTION WHEN duplicate_object` |
| Tables | `CREATE TABLE` | `CREATE TABLE IF NOT EXISTS` |
| Indexes | `CREATE INDEX` | `CREATE INDEX IF NOT EXISTS` |
| Policies | `CREATE POLICY` | `DROP POLICY IF EXISTS` + `CREATE POLICY` |
| Triggers | `CREATE TRIGGER` | `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` |
| Functions | `CREATE FUNCTION` | `CREATE OR REPLACE FUNCTION` (موجود بالفعل ✓) |

---

## التفاصيل التقنية

سيتم تحديث ملف `public/complete-migration.sql` بالكامل ليشمل:

1. **6 أنواع ENUM** → ملفوفة بـ `DO $$ ... EXCEPTION`
2. **20+ جدول** → `IF NOT EXISTS`
3. **50+ سياسة RLS** → `DROP IF EXISTS` قبل `CREATE`
4. **10+ Trigger** → `DROP IF EXISTS` قبل `CREATE`
5. **5 Storage Buckets** → التحقق من الوجود

---

## النتيجة المتوقعة
بعد هذا التحديث، يمكنك تنفيذ ملف SQL عدة مرات بدون أي أخطاء، وسيتم تجاهل العناصر الموجودة تلقائياً.

