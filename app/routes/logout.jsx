import { useFetcher } from 'remix';
import { useEffect } from 'react';
import supabase from '~/utils/supabase';

export default () => {
  const fetcher = useFetcher();
  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();

      fetcher.submit(null, {
        method: 'POST',
        action: '/auth/logout',
      });
    };
    logout();
  }, []);
  return <p>Logging out..</p>;
};
