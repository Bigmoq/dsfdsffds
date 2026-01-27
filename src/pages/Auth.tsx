import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { z } from "zod";

const emailSchema = z.string().email("الرجاء إدخال بريد إلكتروني صحيح");
const passwordSchema = z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
const nameSchema = z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل");

// Password strength calculator
const getPasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string; percentage: number } => {
  if (password.length === 0) {
    return { level: 'weak', label: '', color: '', percentage: 0 };
  }
  
  let score = 0;
  
  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) {
    return { level: 'weak', label: 'ضعيفة', color: 'bg-red-500', percentage: 33 };
  } else if (score <= 4) {
    return { level: 'medium', label: 'متوسطة', color: 'bg-yellow-500', percentage: 66 };
  } else {
    return { level: 'strong', label: 'قوية', color: 'bg-green-500', percentage: 100 };
  }
};

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"select" | "login" | "signup" | "forgot" | "reset-sent" | "verify-email">("select");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; name?: string }>({});
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/onboarding", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/onboarding", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    // Only validate password for login and signup modes
    if (mode === "login" || mode === "signup") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
      
      // Validate confirm password
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setMode("reset-sent");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الرمز المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: registeredEmail,
        token: otpCode,
        type: 'signup',
      });
      
      if (error) {
        toast({
          title: "رمز غير صحيح",
          description: "الرمز الذي أدخلته غير صحيح أو منتهي الصلاحية",
          variant: "destructive",
        });
        return;
      }
      
      if (data.session) {
        toast({
          title: "تم التفعيل!",
          description: "تم تفعيل حسابك بنجاح",
        });
        // Navigation will be handled by onAuthStateChange
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });
      
      if (error) {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم الإرسال",
          description: "تم إعادة إرسال رمز التفعيل بنجاح",
        });
        setOtpCode("");
        setResendCooldown(60); // Start 60 second countdown
      }
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrors(prev => ({ ...prev, password: "كلمة المرور غير صحيحة" }));
            toast({
              title: "خطأ في تسجيل الدخول",
              description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "البريد الإلكتروني غير مفعل",
              description: "الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب",
              variant: "destructive",
            });
          } else {
            toast({
              title: "خطأ",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) {
          // Check for various "already registered" error messages
          const errorMsg = error.message.toLowerCase();
          if (
            errorMsg.includes("already registered") ||
            errorMsg.includes("user already registered") ||
            errorMsg.includes("email already") ||
            errorMsg.includes("already exists")
          ) {
            toast({
              title: "البريد الإلكتروني مستخدم",
              description: "هذا البريد الإلكتروني مسجل مسبقاً، الرجاء تسجيل الدخول بدلاً من ذلك",
              variant: "destructive",
            });
            // Switch to login mode for convenience
            setMode("login");
          } else {
            toast({
              title: "خطأ في إنشاء الحساب",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        
        // Check if user was actually created or if email already exists
        // Supabase returns user data but with identities array empty if email exists
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          toast({
            title: "البريد الإلكتروني مستخدم",
            description: "هذا البريد الإلكتروني مسجل مسبقاً، الرجاء تسجيل الدخول بدلاً من ذلك",
            variant: "destructive",
          });
          // Switch to login mode for convenience
          setMode("login");
          return;
        }
        
        // Show OTP verification screen
        setRegisteredEmail(email);
        setOtpCode("");
        setMode("verify-email");
        setResendCooldown(60); // Start countdown immediately after signup
        toast({
          title: "تم إنشاء الحساب!",
          description: "تم إرسال رمز التفعيل إلى بريدك الإلكتروني",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) {
        toast({
          title: "خطأ",
          description: "فشل تسجيل الدخول بـ Google",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setErrors({});
    setOtpCode("");
  };

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "تسجيل الدخول" : mode === "signup" ? "إنشاء حساب" : mode === "forgot" ? "استعادة كلمة المرور" : mode === "reset-sent" ? "تم الإرسال" : mode === "verify-email" ? "تأكيد البريد" : "مرحباً"} | زفاف</title>
        <meta name="description" content="سجل دخولك أو أنشئ حساب جديد للاستفادة من جميع مميزات زفاف" />
      </Helmet>
      
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <div className="gold-gradient px-6 pt-12 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <button
            onClick={() => {
              if (mode === "select") {
                navigate("/welcome");
              } else {
                setMode("select");
                resetForm();
              }
            }}
            className="absolute top-6 left-6 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10 pt-4"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              {mode === "select" && "مرحباً بك"}
              {mode === "login" && "تسجيل الدخول"}
              {mode === "signup" && "إنشاء حساب جديد"}
              {mode === "forgot" && "استعادة كلمة المرور"}
              {mode === "reset-sent" && "تم الإرسال"}
              {mode === "verify-email" && "تأكيد البريد الإلكتروني"}
            </h1>
            <p className="text-white/80 font-arabic text-sm">
              {mode === "select" && "اختر طريقة الدخول المناسبة لك"}
              {mode === "login" && "أدخل بياناتك للمتابعة"}
              {mode === "signup" && "أنشئ حسابك للاستفادة من جميع المميزات"}
              {mode === "forgot" && "أدخل بريدك الإلكتروني لإرسال رابط الاستعادة"}
              {mode === "reset-sent" && "تحقق من بريدك الإلكتروني"}
              {mode === "verify-email" && "أدخل رمز التفعيل المرسل إلى بريدك"}
            </p>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="px-6 -mt-8 relative z-20 pb-8">
          <AnimatePresence mode="wait">
            {mode === "select" ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-luxe rounded-2xl p-6 space-y-4"
              >
                {/* Google Button */}
                <Button
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full py-6 text-lg font-arabic border-2 hover:bg-muted/50 relative"
                >
                  {googleLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-6 h-6 ml-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      المتابعة بحساب Google
                    </>
                  )}
                </Button>
                
                {/* Apple Button - Note: Not supported yet */}
                <Button
                  variant="outline"
                  disabled
                  className="w-full py-6 text-lg font-arabic border-2 opacity-50 cursor-not-allowed"
                >
                  <svg className="w-6 h-6 ml-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  المتابعة بحساب Apple
                  <span className="text-xs mr-2">(قريباً)</span>
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-arabic">
                      أو بالبريد الإلكتروني
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode("signup")}
                    className="py-6 text-base font-arabic border-2"
                  >
                    إنشاء حساب
                  </Button>
                  <Button
                    onClick={() => setMode("login")}
                    className="py-6 text-base font-arabic gold-gradient text-white"
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              </motion.div>
            ) : mode === "verify-email" ? (
              <motion.div
                key="verify-email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-luxe rounded-2xl p-6 text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-arabic">أدخل رمز التفعيل</h2>
                  <p className="text-muted-foreground font-arabic text-sm">
                    تم إرسال رمز مكون من 6 أرقام إلى:
                  </p>
                  <p className="font-semibold text-primary" dir="ltr">{registeredEmail}</p>
                </div>
                
                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-arabic text-muted-foreground">
                    أدخل الرمز المرسل إلى بريدك الإلكتروني لتفعيل حسابك
                  </p>
                  <p className="text-xs font-arabic text-muted-foreground">
                    إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otpCode.length !== 6}
                    className="w-full gold-gradient text-white py-5"
                  >
                    {verifyingOtp ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="font-arabic">تأكيد الرمز</span>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={loading || resendCooldown > 0}
                    className="w-full py-5 font-arabic"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : resendCooldown > 0 ? (
                      <span className="flex items-center gap-2">
                        إعادة الإرسال بعد
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {resendCooldown}
                        </span>
                        ثانية
                      </span>
                    ) : (
                      "إعادة إرسال الرمز"
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMode("login");
                      resetForm();
                    }}
                    className="w-full py-5 font-arabic"
                  >
                    العودة لتسجيل الدخول
                  </Button>
                </div>
              </motion.div>
            ) : mode === "login" || mode === "signup" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-luxe rounded-2xl p-6"
              >
                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-arabic text-right block">
                        الاسم الكامل
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="pr-10 text-right font-arabic"
                          dir="rtl"
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                      {errors.name && (
                        <p className="text-destructive text-sm font-arabic">{errors.name}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-arabic text-right block">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="pr-10 text-right"
                        dir="ltr"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm font-arabic">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-arabic text-right block">
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 pl-10"
                        dir="ltr"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="text-destructive text-sm font-arabic">{errors.password}</p>
                    ) : mode === "signup" && (
                      <div className="space-y-2">
                        {password.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-arabic text-muted-foreground">قوة كلمة المرور:</span>
                              <span className={`text-xs font-arabic font-medium ${
                                getPasswordStrength(password).level === 'weak' ? 'text-red-500' :
                                getPasswordStrength(password).level === 'medium' ? 'text-yellow-600' : 'text-green-500'
                              }`}>
                                {getPasswordStrength(password).label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                                style={{ width: `${getPasswordStrength(password).percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="text-muted-foreground text-xs font-arabic space-y-0.5">
                          <p>يجب أن تحتوي كلمة المرور على:</p>
                          <ul className="list-disc list-inside pr-2 space-y-0.5">
                            <li>6 أحرف على الأقل</li>
                            <li>حرف كبير (A-Z)</li>
                            <li>رقم (0-9)</li>
                            <li>رمز خاص (!@#$%...)</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Confirm Password Field - Only for signup */}
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-arabic text-right block">
                        تأكيد كلمة المرور
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="أعد إدخال كلمة المرور"
                          className="pr-10 pl-10"
                          dir="ltr"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-destructive text-sm font-arabic">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-gradient text-white hover:opacity-90 py-6"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <span className="font-arabic text-lg">
                        {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
                      </span>
                    )}
                  </Button>
                  
                  {/* Forgot Password Link - Only show on login */}
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setErrors({});
                      }}
                      className="w-full text-center font-arabic text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </form>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setErrors({});
                    }}
                    className="font-arabic text-muted-foreground hover:text-primary transition-colors"
                  >
                    {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب؟ "}
                    <span className="text-primary font-semibold">
                      {mode === "login" ? "أنشئ حساباً جديداً" : "سجل دخولك"}
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : null}
            
            {/* Forgot Password Form */}
            {mode === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-luxe rounded-2xl p-6"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <form onSubmit={handlePasswordReset} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="font-arabic text-right block">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="pr-10 text-right"
                        dir="ltr"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm font-arabic">{errors.email}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-gradient text-white hover:opacity-90 py-6"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <span className="font-arabic text-lg">إرسال رابط الاستعادة</span>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="font-arabic text-muted-foreground hover:text-primary transition-colors"
                  >
                    العودة إلى{" "}
                    <span className="text-primary font-semibold">تسجيل الدخول</span>
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Reset Email Sent Confirmation */}
            {mode === "reset-sent" && (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-luxe rounded-2xl p-6 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-available/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-available" />
                  </div>
                </div>
                
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  تم إرسال رابط الاستعادة!
                </h3>
                
                <p className="text-muted-foreground font-arabic text-sm mb-2">
                  تم إرسال رابط استعادة كلمة المرور إلى:
                </p>
                
                <p className="text-primary font-semibold mb-6 dir-ltr">
                  {email}
                </p>
                
                <p className="text-muted-foreground font-arabic text-xs mb-6">
                  إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                </p>
                
                <Button
                  onClick={() => {
                    setMode("login");
                    resetForm();
                  }}
                  className="w-full gold-gradient text-white hover:opacity-90 py-6"
                >
                  <span className="font-arabic text-lg">العودة لتسجيل الدخول</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
