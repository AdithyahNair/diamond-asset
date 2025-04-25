import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://zuapdvlqlqyyqqhhqdnw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YXBkdmxxbHF5eXFxaGhxZG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTEyNTksImV4cCI6MjA2MTEyNzI1OX0.tqN_KEGE_8NDDe3PT0Zwf4Hyp35n1XdioiIn4pjc1Z8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
