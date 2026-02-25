import Header from '@/components/layout/header';
import OpenChatForm from '@/components/open-chat/open-chat-form';

export default function NewOpenChatPage() {
  return (
    <>
      <Header title="오픈채팅 등록" showBack showNotification={false} />
      <OpenChatForm mode="create" />
    </>
  );
}
