import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  images?: string[] | null;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  provider_id: string | null;
  hall_id: string | null;
  dress_id: string | null;
  created_at: string;
  updated_at: string;
  other_participant?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: ChatMessage | null;
  unread_count?: number;
}

interface UseChatOptions {
  providerId?: string;
  hallId?: string;
  dressId?: string;
  otherUserId?: string;
}

export function useChat(options?: UseChatOptions) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(full_name, avatar_url),
          participant_2_profile:profiles!conversations_participant_2_fkey(full_name, avatar_url)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Map conversations with other participant info
      const mappedConversations = (data || []).map((conv: any) => {
        const isParticipant1 = conv.participant_1 === user.id;
        return {
          ...conv,
          other_participant: isParticipant1 
            ? conv.participant_2_profile 
            : conv.participant_1_profile,
        };
      });

      setConversations(mappedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch or create conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string, context?: { providerId?: string; hallId?: string; dressId?: string }) => {
    if (!user) return null;

    try {
      // Check if conversation exists
      let query = supabase
        .from("conversations")
        .select("*")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`);

      if (context?.providerId) {
        query = query.eq("provider_id", context.providerId);
      } else if (context?.hallId) {
        query = query.eq("hall_id", context.hallId);
      } else if (context?.dressId) {
        query = query.eq("dress_id", context.dressId);
      }

      const { data: existing, error: fetchError } = await query.maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existing) {
        setCurrentConversation(existing);
        return existing;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          provider_id: context?.providerId || null,
          hall_id: context?.hallId || null,
          dress_id: context?.dressId || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      setCurrentConversation(newConv);
      return newConv;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في بدء المحادثة",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          sender_profile:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (content: string, conversationId?: string, images?: string[]) => {
    if (!user || (!content.trim() && (!images || images.length === 0))) return false;

    const targetConversationId = conversationId || currentConversation?.id;
    if (!targetConversationId) return false;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: targetConversationId,
          sender_id: user.id,
          content: content.trim() || '',
          images: images && images.length > 0 ? images : null,
        })
        .select(`
          *,
          sender_profile:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Optimistically add message
      setMessages(prev => [...prev, data]);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "خطأ",
        description: "فشل إرسال الرسالة",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [user, currentConversation, toast]);

  // Upload image to storage
  const uploadChatImage = useCallback(async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل رفع الصورة",
        variant: "destructive",
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(data.path);

    return publicUrl;
  }, [user, toast]);

  // Real-time subscription
  useEffect(() => {
    if (!currentConversation?.id) return;

    const channel = supabase
      .channel(`chat:${currentConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        async (payload) => {
          // Fetch the new message with profile info
          const { data } = await supabase
            .from("chat_messages")
            .select(`
              *,
              sender_profile:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data && data.sender_id !== user?.id) {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, data];
            });

            // Mark as read if user is viewing the conversation
            await supabase
              .from("chat_messages")
              .update({ is_read: true })
              .eq("id", data.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation?.id, user?.id]);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    if (!user) return 0;

    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .eq("is_read", false);

    if (error) return 0;
    return count || 0;
  }, [user]);

  return {
    conversations,
    messages,
    currentConversation,
    loading,
    sending,
    fetchConversations,
    fetchMessages,
    sendMessage,
    uploadChatImage,
    getOrCreateConversation,
    setCurrentConversation,
    getUnreadCount,
  };
}
