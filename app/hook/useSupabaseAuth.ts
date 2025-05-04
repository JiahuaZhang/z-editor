import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '~/util/supabase.client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user || null);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return user;
};