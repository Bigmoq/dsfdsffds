import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Generate a unique session ID for this browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

export type EventCategory = 
  | "navigation"
  | "engagement"
  | "booking"
  | "search"
  | "auth"
  | "vendor"
  | "chat"
  | "favorite";

interface TrackEventParams {
  eventName: string;
  category: EventCategory;
  data?: Record<string, string | number | boolean | null | undefined>;
}

export function useAnalytics() {
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());
  const deviceType = useRef(getDeviceType());

  // Track page views automatically
  useEffect(() => {
    trackEvent({
      eventName: "page_view",
      category: "navigation",
      data: { path: window.location.pathname },
    });
  }, []);

  const trackEvent = useCallback(async ({ eventName, category, data = {} }: TrackEventParams) => {
    try {
      await supabase.from("analytics_events").insert([{
        user_id: user?.id || null,
        event_name: eventName,
        event_category: category,
        event_data: data,
        page_path: window.location.pathname,
        session_id: sessionId.current,
        device_type: deviceType.current,
      }]);
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.debug("Analytics tracking failed:", error);
    }
  }, [user?.id]);

  // Pre-defined tracking functions for common events
  const trackNavigation = useCallback((page: string) => {
    trackEvent({ eventName: "navigate", category: "navigation", data: { page } });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, type: string, resultsCount: number) => {
    trackEvent({ eventName: "search", category: "search", data: { query, type, resultsCount } });
  }, [trackEvent]);

  const trackBooking = useCallback((type: "hall" | "service", action: string, itemId: string) => {
    trackEvent({ eventName: `booking_${action}`, category: "booking", data: { type, itemId } });
  }, [trackEvent]);

  const trackFavorite = useCallback((type: "hall" | "service" | "dress", action: "add" | "remove", itemId: string) => {
    trackEvent({ eventName: `favorite_${action}`, category: "favorite", data: { type, itemId } });
  }, [trackEvent]);

  const trackVendorAction = useCallback((action: string, vendorType: string) => {
    trackEvent({ eventName: `vendor_${action}`, category: "vendor", data: { vendorType } });
  }, [trackEvent]);

  const trackEngagement = useCallback((action: string, data?: Record<string, string | number | boolean | null | undefined>) => {
    trackEvent({ eventName: action, category: "engagement", data });
  }, [trackEvent]);

  const trackAuth = useCallback((action: "login" | "signup" | "logout") => {
    trackEvent({ eventName: `auth_${action}`, category: "auth" });
  }, [trackEvent]);

  const trackChat = useCallback((action: string, conversationType?: string) => {
    trackEvent({ eventName: `chat_${action}`, category: "chat", data: { conversationType } });
  }, [trackEvent]);

  return {
    trackEvent,
    trackNavigation,
    trackSearch,
    trackBooking,
    trackFavorite,
    trackVendorAction,
    trackEngagement,
    trackAuth,
    trackChat,
  };
}
