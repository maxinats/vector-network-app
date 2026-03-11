"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildProfileTableHint,
  fetchCurrentMemberProfile,
  type MemberProfile,
} from "@/lib/supabase/member-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  userId: string | null;
  profile: MemberProfile | null;
  error: string | null;
  supabase: SupabaseClient | null;
  refreshAuthState: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const refreshAuthState = useCallback(async () => {
    if (!supabase) {
      setStatus("error");
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setUserId(null);
      setProfile(null);
      return;
    }

    setError(null);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      const message = sessionError.message || "Failed to resolve session.";
      const isMissingSession = message.toLowerCase().includes("auth session missing");
      if (isMissingSession) {
        setStatus("unauthenticated");
        setUserId(null);
        setProfile(null);
        setError(null);
        return;
      }

      setStatus("error");
      setError(message);
      setUserId(null);
      setProfile(null);
      return;
    }

    const sessionUser = sessionData.session?.user ?? null;
    if (!sessionUser) {
      setStatus("unauthenticated");
      setUserId(null);
      setProfile(null);
      setError(null);
      return;
    }

    const { profile: nextProfile, error: profileError } = await fetchCurrentMemberProfile(
      supabase,
      sessionUser.id,
    );

    if (profileError) {
      setStatus("error");
      setError(
        buildProfileTableHint(profileError) ??
          "Failed to load member profile from Supabase.",
      );
      setUserId(sessionUser.id);
      setProfile(null);
      return;
    }

    setStatus("authenticated");
    setError(null);
    setUserId(sessionUser.id);
    setProfile(nextProfile);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!supabase) {
      return;
    }

    if (!userId) {
      await refreshAuthState();
      return;
    }

    const { profile: nextProfile, error: profileError } = await fetchCurrentMemberProfile(
      supabase,
      userId,
    );

    if (profileError) {
      setStatus("error");
      setError(
        buildProfileTableHint(profileError) ??
          "Failed to refresh member profile from Supabase.",
      );
      return;
    }

    setStatus("authenticated");
    setError(null);
    setProfile(nextProfile);
  }, [refreshAuthState, supabase, userId]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setStatus("unauthenticated");
      setError(null);
      setUserId(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setStatus("unauthenticated");
    setError(null);
    setUserId(null);
    setProfile(null);
  }, [supabase]);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void refreshAuthState();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshAuthState, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      userId,
      profile,
      error,
      supabase,
      refreshAuthState,
      refreshProfile,
      signOut,
    }),
    [
      error,
      profile,
      refreshAuthState,
      refreshProfile,
      signOut,
      status,
      supabase,
      userId,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
