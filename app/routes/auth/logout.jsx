import { redirect } from 'remix';
import { destroySession, getSession } from '../../utils/cookie';

export const action = async ({ request }) => {
  
  const session = await getSession(request.headers.get('Cookie'));

  const cookie = await destroySession(session);

  return redirect('/login', {
    headers: {
      'Set-Cookie': cookie,
    },
  });
};

export default function () {
  return <p>logout</p>;
}
