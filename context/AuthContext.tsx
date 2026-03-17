import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  usage: number;
  tier: 'free' | 'pro';
  proUntil: string | null;
  daysLeft: number | null;
  daysUsed: number | null;
  loading: boolean;
  incrementUsage: () => Promise<boolean>;
  decrementUsage: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(0);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [proUntil, setProUntil] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [daysUsed, setDaysUsed] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsage(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Session fetch error:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[Auth] Event:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsage(session.user.id);
      } else if (_event === 'SIGNED_OUT') {
        setLoading(false);
        setUsage(0);
        setTier('free');
        setProUntil(null);
        setDaysLeft(null);
        setDaysUsed(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsage = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If there's an error (like 401 Unauthorized), try to refresh the session and retry
      if (error) {
        console.warn("Supabase fetch error, attempting to refresh session:", error);
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && refreshData.session) {
          const retry = await supabase
            .from('user_usage')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          data = retry.data;
          error = retry.error;
        }
      }

      if (error) {
        console.error("Supabase fetch error after retry:", error);
        // If we still have an error, we can't trust local data, so we don't set usage.
        // This prevents local storage manipulation.
        return;
      }

      if (!data) {
        // --- NEW USER CREATION + REFERRAL ---
        const referralCode = localStorage.getItem('focusmind_referral_code')?.trim();

        // Initial insert
        const { data: newData, error: insertError } = await supabase
          .from('user_usage')
          .upsert({ id: userId, count: 0, tier: 'free' }, { onConflict: 'id' })
          .select()
          .single();

        if (insertError) {
          console.error("[AuthContext] Initial user record creation error:", insertError);
          return;
        }

        if (referralCode && referralCode !== userId) {
          console.log("[AuthContext] New user with pending referral. Calling API...");
          try {
            const res = await fetch('/api/referral', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, referrerId: referralCode })
            });
            if (res.ok) {
              localStorage.removeItem('focusmind_referral_code');
              return fetchUsage(userId); // Re-fetch to apply rewards
            }
          } catch (err) { console.error("[AuthContext] New user referral API error:", err); }
        }

        if (newData) {
          setUsage(newData.count);
          setTier(newData.tier as 'free' | 'pro');
          setProUntil(newData.pro_until || null);
        }
      } else {
        const todayStr = new Date().toDateString();
        const lastReset = localStorage.getItem(`focusmind_reset_${userId}`);
        let currentCount = data.count;

        let updatedProUntil = data.pro_until;

        // --- ROBUST TIER CALCULATION ---
        let currentTier: 'free' | 'pro' = (data.tier || 'free').toLowerCase() as 'free' | 'pro';
        if (data.is_pro || (updatedProUntil && new Date(updatedProUntil) > new Date())) {
          currentTier = 'pro';
        }

        // --- DAILY USAGE RESET LOGIC ---
        if (lastReset && lastReset !== todayStr) {
          console.log(`[AuthContext] Daily reset triggered: ${lastReset} -> ${todayStr}`);
          if (currentCount > 0) {
            const { error: updateError } = await supabase.from('user_usage').update({ count: 0 }).eq('id', userId);
            if (!updateError) currentCount = 0;
          }
        }

        localStorage.setItem(`focusmind_reset_${userId}`, todayStr);

        setUsage(currentCount);
        setTier(currentTier);
        setProUntil(updatedProUntil || null);

        let finalDaysLeft = 0;
        let finalDaysUsed = 0;

        if (data.pro_activated_at) {
          const start = new Date(data.pro_activated_at);
          finalDaysUsed = Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysUsed(finalDaysUsed);
        } else {
          setDaysUsed(null);
        }

        if (updatedProUntil) {
          const end = new Date(updatedProUntil);
          // Subtract 30 seconds (30000ms) to ensure clock skew between client/server doesn't cause a +1 day jump on the first day
          finalDaysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now() - 30000) / (1000 * 60 * 60 * 24)));
          setDaysLeft(finalDaysLeft);
        } else {
          setDaysLeft(null);
        }

      }
    } catch (e) {
      console.error("AuthContext: General exception in fetchUsage:", e);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (!user) return false;
    const LIMIT = tier === 'pro' ? 100 : 10;
    if (usage >= LIMIT) return false;

    const newCount = usage + 1;

    const { error } = await supabase
      .from('user_usage')
      .update({ count: newCount })
      .eq('id', user.id);

    if (error) {
      console.error("Failed to sync usage to Supabase:", error);
      return false;
    }

    setUsage(newCount);
    localStorage.setItem(`focusmind_reset_${user.id}`, new Date().toDateString());
    return true;
  };

  const decrementUsage = async (): Promise<void> => {
    if (!user || usage <= 0) return;

    const newCount = usage - 1;

    const { error } = await supabase
      .from('user_usage')
      .update({ count: newCount })
      .eq('id', user.id);

    if (error) {
      console.error("Failed to sync decrement to Supabase:", error);
      return;
    }

    setUsage(newCount);
  };

  const refreshUsage = async () => {
    if (user) await fetchUsage(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsage(0);
    setTier('free');
    setProUntil(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, usage, tier, proUntil, loading, incrementUsage, decrementUsage, signOut, refreshUsage, daysLeft, daysUsed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};