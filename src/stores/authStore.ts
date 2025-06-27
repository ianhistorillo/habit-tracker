import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  },

  signIn: async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    set({ user: data.user });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Auth initialized, session:", !!session);
      set({ user: session?.user || null, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        const newUser = session?.user || null;
        const currentUser = get().user;

        console.log("Auth state changed:", {
          event: _event,
          newUserId: newUser?.id,
          currentUserId: currentUser?.id,
        });

        // Only update if user actually changed
        if (newUser?.id !== currentUser?.id) {
          console.log("User changed, updating state");
          set({ user: newUser });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ loading: false });
    }
  },
}));
