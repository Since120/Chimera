'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { redirectToDashboard } from "@/lib/auth";

export default function SignInPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // API-Basis-URL aus Umgebungsvariablen oder als Fallback
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '') || 'http://localhost:3333';
  const discordAuthUrl = `${apiBaseUrl}/auth/discord`;
  
  // Check if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log("SignIn Page - Benutzer bereits authentifiziert, leite zum Dashboard weiter");
      redirectToDashboard();
    }
  }, [isAuthenticated, loading]);
  
  // Handle manual login button click
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Loading state while authentication status is checked
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 text-2xl font-semibold">Authentifizierungsstatus wird geprüft...</div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  } 
}