import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabase'; // Importiere deinen konfigurierten Supabase Client

const api: AxiosInstance = axios.create({
  // Korrekte Backend-URL und API-Präfix
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1', // Sollte auf Backend zeigen!
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout hinzufügen
});

// Request Interceptor: Fügt Supabase Token hinzu
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Nur im Browser-Kontext ausführen
    if (typeof window !== 'undefined') {
      try {
        // Aktuelle Session von Supabase holen (verwaltet Cookies)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("API Interceptor: Error getting Supabase session:", error.message);
        } else if (session?.access_token) {
          // console.log("API Interceptor: Attaching Supabase token to request header."); // Optional: Weniger gesprächig
          // Setze den Authorization Header
          config.headers.Authorization = `Bearer ${session.access_token}`;
        } else {
          // console.log("API Interceptor: No active Supabase session found."); // Optional: Weniger gesprächig
          // Optional: Entferne einen evtl. alten Header
          delete config.headers.Authorization;
        }
      } catch (e) {
        console.error("API Interceptor: Unexpected error fetching session:", e);
      }
    }
    return config;
  },
  (error) => {
    console.error("API Interceptor Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Behandelt 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
      originalRequest._retry = true; // Verhindert Endlosschleife
      console.error("API Interceptor: Received 401 Unauthorized. Attempting logout and redirect.");
      try {
        // Logout über Supabase
        await supabase.auth.signOut();
        // Redirect zur Login-Seite
        window.location.href = '/login?error=unauthorized'; // Pfad zur Login-Seite
      } catch (signOutError) {
         console.error("API Interceptor: Error during sign out:", signOutError);
         // Fallback: Einfach weiterleiten
         window.location.href = '/login?error=unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
