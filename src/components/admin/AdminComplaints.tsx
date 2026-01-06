import { useState, useEffect } from "react";
import { Loader2, Search, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Complaint {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  user_name?: string;
}

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل الشكاوى", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch user names
    const userIds = [...new Set(data?.map(c => c.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    setComplaints((data || []).map(c => ({
      ...c,
      user_name: profileMap.get(c.user_id) || "غير معروف",
    })));
    setLoading(false);
  };

  const handleRespond = async () => {
    if (!selectedComplaint || !response.trim()) return;
    setProcessing(true);

    const { error } = await supabase
      .from("complaints")
      .update({
        admin_response: response,
        status: "resolved",
        responded_at: new Date().toISOString(),
      })
      .eq("id", selectedComplaint.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في إرسال الرد", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إرسال الرد بنجاح" });
      fetchComplaints();
    }
    setSelectedComplaint(null);
    setResponse("");
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">معلق</Badge>;
      case "resolved": return <Badge className="bg-green-500">تم الرد</Badge>;
      case "closed": return <Badge variant="outline">مغلق</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالموضوع أو اسم المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right font-arabic"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right font-arabic">
        إجمالي: {filteredComplaints.length} شكوى
      </p>

      {filteredComplaints.length === 0 ? (
        <Card className="card-luxe">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-arabic">لا توجد شكاوى</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <Card 
              key={complaint.id} 
              className="card-luxe cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setSelectedComplaint(complaint);
                setResponse(complaint.admin_response || "");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    {getStatusBadge(complaint.status)}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(complaint.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div className="text-right flex-1 mr-4">
                    <p className="font-medium font-arabic">{complaint.subject}</p>
                    <p className="text-sm text-muted-foreground font-arabic">{complaint.user_name}</p>
                    <p className="text-sm text-muted-foreground font-arabic line-clamp-2 mt-2">
                      {complaint.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complaint Details Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="font-arabic max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الشكوى</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">من: {selectedComplaint?.user_name}</p>
              <p className="text-sm text-muted-foreground">
                التاريخ: {selectedComplaint && new Date(selectedComplaint.created_at).toLocaleDateString("ar-SA")}
              </p>
            </div>
            <div>
              <p className="font-medium">{selectedComplaint?.subject}</p>
              <p className="text-sm mt-2 bg-muted p-3 rounded-lg">
                {selectedComplaint?.message}
              </p>
            </div>
            
            {selectedComplaint?.status === "pending" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">الرد:</p>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows={4}
                />
              </div>
            ) : selectedComplaint?.admin_response && (
              <div className="space-y-2">
                <p className="text-sm font-medium">الرد:</p>
                <p className="text-sm bg-primary/10 p-3 rounded-lg">
                  {selectedComplaint.admin_response}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedComplaint(null)}>إغلاق</Button>
            {selectedComplaint?.status === "pending" && (
              <Button onClick={handleRespond} disabled={processing || !response.trim()} className="gold-gradient">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الرد
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
