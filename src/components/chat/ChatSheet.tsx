import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Loader2, Image as ImageIcon, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserId?: string;
  otherUserName?: string;
  otherUserAvatar?: string | null;
  providerId?: string;
  hallId?: string;
  dressId?: string;
}

export function ChatSheet({
  open,
  onOpenChange,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  providerId,
  hallId,
  dressId,
}: ChatSheetProps) {
  const { user } = useAuth();
  const {
    messages,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    uploadChatImage,
    getOrCreateConversation,
    currentConversation,
  } = useChat();
  
  const [messageText, setMessageText] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resolvedOtherUser, setResolvedOtherUser] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve other user from hall/dress/provider if not provided directly
  useEffect(() => {
    const resolveOtherUser = async () => {
      if (otherUserId && otherUserName) {
        setResolvedOtherUser({
          id: otherUserId,
          name: otherUserName,
          avatar: otherUserAvatar || null,
        });
        return;
      }

      let ownerId: string | null = null;
      
      if (hallId) {
        const { data } = await supabase
          .from('halls')
          .select('owner_id, name_ar')
          .eq('id', hallId)
          .single();
        ownerId = data?.owner_id || null;
      } else if (dressId) {
        const { data } = await supabase
          .from('dresses')
          .select('seller_id, title')
          .eq('id', dressId)
          .single();
        ownerId = data?.seller_id || null;
      } else if (providerId) {
        const { data } = await supabase
          .from('service_providers')
          .select('owner_id, name_ar')
          .eq('id', providerId)
          .single();
        ownerId = data?.owner_id || null;
      }

      if (ownerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', ownerId)
          .single();
          
        setResolvedOtherUser({
          id: ownerId,
          name: profile?.full_name || 'مستخدم',
          avatar: profile?.avatar_url || null,
        });
      }
    };

    if (open) {
      resolveOtherUser();
    }
  }, [open, otherUserId, otherUserName, otherUserAvatar, hallId, dressId, providerId]);

  // Initialize conversation when sheet opens
  useEffect(() => {
    if (open && resolvedOtherUser?.id && user) {
      setInitializing(true);
      const context = { providerId, hallId, dressId };
      getOrCreateConversation(resolvedOtherUser.id, context).then((conv) => {
        if (conv) {
          fetchMessages(conv.id);
        }
        setInitializing(false);
      });
    }
  }, [open, resolvedOtherUser?.id, user, providerId, hallId, dressId, getOrCreateConversation, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sheet opens
  useEffect(() => {
    if (open && !loading && !initializing) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, loading, initializing]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 images
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string].slice(0, 4));
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!messageText.trim() && selectedImages.length === 0) || sending || uploading) return;
    
    setUploading(true);
    
    try {
      // Upload images first
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          const url = await uploadChatImage(file);
          if (url) uploadedUrls.push(url);
        }
      }
      
      const text = messageText;
      setMessageText("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
      
      await sendMessage(text, undefined, uploadedUrls.length > 0 ? uploadedUrls : undefined);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, "h:mm a", { locale: ar });
    }
    return format(date, "d MMM h:mm a", { locale: ar });
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl p-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-3xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 justify-center">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={resolvedOtherUser?.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-arabic">
                {getInitials(resolvedOtherUser?.name || 'مستخدم')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-arabic font-semibold text-foreground">
                {resolvedOtherUser?.name || 'مستخدم'}
              </h3>
              <p className="text-xs text-muted-foreground">متصل الآن</p>
            </div>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {(loading || initializing) ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h4 className="font-arabic font-semibold text-lg">ابدأ المحادثة</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  أرسل رسالة للتواصل مع {resolvedOtherUser?.name || 'البائع'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = 
                    !isOwn && 
                    (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isOwn && showAvatar ? (
                        <Avatar className="w-7 h-7 mb-5">
                          <AvatarImage src={resolvedOtherUser?.avatar || undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(resolvedOtherUser?.name || 'م')}
                          </AvatarFallback>
                        </Avatar>
                      ) : !isOwn ? (
                        <div className="w-7" />
                      ) : null}
                      
                      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                        {/* Images */}
                        {message.images && message.images.length > 0 && (
                          <div className={`mb-2 grid gap-1 ${message.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {message.images.map((imageUrl, imgIndex) => (
                              <a
                                key={imgIndex}
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`صورة ${imgIndex + 1}`}
                                  className="rounded-xl max-w-full h-auto max-h-48 object-cover border border-border/50"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        
                        {/* Text content */}
                        {message.content && (
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm font-arabic leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        )}
                        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {isOwn && (
                            <span className="text-[10px] text-muted-foreground">
                              {message.is_read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Image Previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-card/95">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/95 backdrop-blur-sm">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading || loading || initializing || selectedImages.length >= 4}
              className="w-10 h-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك..."
                className="pr-4 pl-4 py-6 rounded-full bg-muted/50 border-0 font-arabic text-right focus-visible:ring-primary/50"
                disabled={sending || uploading || loading || initializing}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={(!messageText.trim() && selectedImages.length === 0) || sending || uploading || loading || initializing}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {(sending || uploading) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 rotate-180" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
