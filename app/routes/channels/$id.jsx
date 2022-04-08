import { Form, useLoaderData, useFetcher, useTransition } from 'remix';
import supabase from '~/utils/supabase';
import { useEffect, useState, useRef } from 'react';
import requireAuth from '~/utils/withAuthRequired';

export const loader = async (context) => {
  const {
    params: { id },
  } = context;
  const { supabase, user } = await requireAuth(context);

  const { data: channel, error } = await supabase
    .from('channels')
    .select(
      'id, title, description, messages(id, content,likes, profiles(id, email, username))',
    )
    .match({ id })
    .order('created_at', { foreignTable: 'messages' })
    .single();

  if (error) {
    console.log(error.message);
  }

  return {
    channel,
    supabase,
    user,
  };
};

export const action = async (context) => {
  const { request } = context;

  const { user, supabase } = await requireAuth(context);

  const formData = await request.formData();

  const content = formData.get('content');
  const channelId = formData.get('channelId');

  const { error } = await supabase
    .from('messages')
    .insert({ content, channel_id: channelId, user_id: user.id });

  if (error) {
    console.log(error.message);
  }

  return null;
};

export default () => {
  const { channel, user } = useLoaderData();
  const [messages, setMessages] = useState([...channel.messages]);
  const fetcher = useFetcher();
  const transition = useTransition();
  const newMessgeRef = useRef();
  const messagesRef = useRef();
  useEffect(() => {
    if (transition.state !== 'submitting') {
      newMessgeRef.current?.reset();
    }
  }, [transition.state]);

  useEffect(() => {
    const sub = async () => {
      await supabase
        .from(`messages:channel_id=eq.${channel.id}`)
        .on('*', (payload) => {
          fetcher.load(`/channels/${channel.id}`);
        })
        .subscribe();
    };
    sub();
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setMessages([...fetcher.data.channel.messages]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setMessages([...channel.messages]);
  }, [channel]);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  const handleIncrement = (id) => async (e) => {
    const { data, error } = await supabase.rpc('increment_likes', {
      message_id: id,
    });
  };

  return (
    <>
      <h1 className='text-2xl uppercase mb-2'>{channel.title}</h1>
      <p className='text-gray-600 border-b border-gray-300 pb-6'>
        {channel.description}
      </p>
      <div className='  flex-1 flex flex-col p-2 overflow-auto'>
        <div className='mt-auto' ref={messagesRef}>
          {messages.length > 0 ? (
            messages.map((message) => {
              return (
                <p
                  key={message.id}
                  className={`p-2 ${
                    user.id === message.profiles.id ? 'text-right' : ''
                  }`}>
                  {message.content}
                  <span className='block text-xs text-gray-500 px-2'>
                    {message.profiles.username ?? message.profiles.email}
                  </span>
                  <span className='block text-xs text-gray-500 px-2'>
                    {message.likes} likes{' '}
                    <button onClick={handleIncrement(message.id)}>👍 </button>
                  </span>
                </p>
              );
            })
          ) : (
            <p className='font-bold text-center'>
              Be the first to send a message!
            </p>
          )}
        </div>
      </div>
      <Form ref={newMessgeRef} method='POST' className='flex'>
        <input
          type='text'
          name='content'
          className='border border-gray-200 px-2 flex-1'
        />
        <input type='hidden' name='channelId' value={channel.id} />
        <button className='px-4 py2 ml-4 bg-blue-200'>Send!</button>
      </Form>
    </>
  );
};
