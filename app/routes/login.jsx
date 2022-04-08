import { Link } from 'remix';
import supabase from '~/utils/supabase';

export default () => {
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const { data, error } = await supabase.auth.signIn({ email, password });
  };

  return (
    <div className='h-screen flex flex-col items-center justify-center bg-gray-800 text-white'>
      <h1 className='text-4xl mb-4'>Login</h1>
      <form className='flex flex-col' onSubmit={handleLogin}>
        <label htmlFor='email'>Email</label>
        <input
          className='border border-gray-200 bg-transparent mb-4 px-2'
          type='email'
          name='email'
          placeholder='jon@example.com'
        />
        <label htmlFor='password'>Password</label>
        <input
          className='border border-gray-200 bg-transparent mb-8 px-2'
          type='password'
          name='password'
          placeholder='password'
        />

        <button className='bg-gray-700 py-2'>Go!</button>
      </form>
      <p>
        Don't have an account? <Link to='/register'>Register </Link>{' '}
      </p>
    </div>
  );
};
