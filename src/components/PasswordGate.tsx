import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("site_unlocked") === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "verify-site-access",
        {
          body: { password },
        }
      );

      if (invokeError) {
        console.error("Error verifying password:", invokeError);
        setError("حدث خطأ أثناء التحقق");
        return;
      }

      if (data?.success) {
        localStorage.setItem("site_unlocked", "true");
        setIsUnlocked(true);
        setError("");
        navigate("/welcome", { replace: true });
      } else {
        setError("كلمة المرور غير صحيحة");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("حدث خطأ أثناء التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center shadow-xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold gold-text-gradient mb-2">
            زفـــاف
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            الموقع محمي بكلمة مرور
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 py-6 text-center font-arabic"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-destructive text-sm text-center font-arabic">
              {error}
            </p>
          )}
          
          <Button
            type="submit"
            className="w-full py-6 gold-gradient text-white font-arabic"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              "دخول"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
