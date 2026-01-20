import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChat, Conversation } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatSheet } from "./ChatSheet";

interface ConversationsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationsList({ open, onOpenChange }: ConversationsListProps) {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<{
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string | null;
    context?: { providerId?: string; hallId?: string; dressId?: string };
  } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationsWithLastMessage, setConversationsWithLastMessage] = useState<
    (Conversation & { last_message_preview?: { content: string; created_at: string } | null })[]
  >([]);

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open, fetchConversations]);

  // Fetch last message for each conversation
  useEffect(() => {
    const fetchLastMessages = async () => {
      if (!conversations.length) {
        setConversationsWithLastMessage([]);
        return;
      }

      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from("chat_messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            last_message_preview: lastMessage,
          };
        })
      );

      setConversationsWithLastMessage(conversationsWithMessages);
    };

    fetchLastMessages();
  }, [conversations]);

  const handleConversationClick = (conv: Conversation) => {
    const otherUserId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
    
    setSelectedConversation({
      otherUserId,
      otherUserName: conv.other_participant?.full_name || "مستخدم",
      otherUserAvatar: conv.other_participant?.avatar_url,
      context: {
        providerId: conv.provider_id || undefined,
        hallId: conv.hall_id || undefined,
        dressId: conv.dress_id || undefined,
      },
    });
    setChatOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, "h:mm a", { locale: ar });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "أمس";
    }
    return format(date, "d MMM", { locale: ar });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="font-arabic text-xl flex items-center gap-2 justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
              المحادثات
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(85vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : conversationsWithLastMessage.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-arabic font-semibold text-lg">لا توجد محادثات</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  ابدأ محادثة جديدة من صفحة الخدمة أو المنتج
                </p>
              </div>
            ) : (
              <div className="p-2">
                {conversationsWithLastMessage.map((conv, index) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleConversationClick(conv)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-right"
                  >
                    <Avatar className="w-12 h-12 border-2 border-primary/10">
                      <AvatarImage src={conv.other_participant?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-arabic">
                        {getInitials(conv.other_participant?.full_name || "م")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-arabic font-semibold text-foreground truncate">
                          {conv.other_participant?.full_name || "مستخدم"}
                        </h4>
                        {conv.last_message_preview && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.last_message_preview.created_at)}
                          </span>
                        )}
                      </div>
                      {conv.last_message_preview ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message_preview.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          لا توجد رسائل بعد
                        </p>
                      )}
                    </div>
                    
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedConversation && (
        <ChatSheet
          open={chatOpen}
          onOpenChange={setChatOpen}
          otherUserId={selectedConversation.otherUserId}
          otherUserName={selectedConversation.otherUserName}
          otherUserAvatar={selectedConversation.otherUserAvatar}
          providerId={selectedConversation.context?.providerId}
          hallId={selectedConversation.context?.hallId}
          dressId={selectedConversation.context?.dressId}
        />
      )}
    </>
  );
}
