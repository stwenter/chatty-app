import { redirect } from 'remix';
import supabase from '~/utils/supabase';
import { getSession } from '~/utils/cookie';


export default async (context) => {
  const session = await getSession(context.request.headers.get('Cookie'));
  const accessToken = session.get('accessToken');
  const { user } = await supabase.auth.api.getUser(accessToken);

  if (!user) {
    throw redirect('/login');
  }

  supabase.auth.setAuth(accessToken);

  return {
    user,
    accessToken,
    supabase,
  };
};