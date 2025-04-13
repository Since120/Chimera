'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback'
      }
    });

    if (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      <button onClick={handleSignIn}>
        Sign in with Discord
      </button>
    </div>
  );
}