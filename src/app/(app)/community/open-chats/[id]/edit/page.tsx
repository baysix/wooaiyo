import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import OpenChatForm from '@/components/open-chat/open-chat-form';
import { getOpenChat } from '@/actions/open-chats';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOpenChatPage({ params }: Props) {
  const { id } = await params;
  const { openChat, isCreator } = await getOpenChat(id);

  if (!openChat || !isCreator) notFound();

  return (
    <>
      <Header title="오픈채팅 수정" showBack showNotification={false} />
      <OpenChatForm
        mode="edit"
        chatId={openChat.id}
        defaultValues={{
          title: openChat.title,
          description: openChat.description ?? '',
          chat_type: openChat.chat_type,
          external_link: openChat.external_link ?? '',
          access_code: openChat.access_code ?? '',
          category: openChat.category,
          eligibility: openChat.eligibility ?? '',
          images: openChat.images ?? [],
        }}
      />
    </>
  );
}
