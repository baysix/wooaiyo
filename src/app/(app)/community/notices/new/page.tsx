import Header from '@/components/layout/header';
import NoticeForm from '@/components/notice/notice-form';

export default function NewNoticePage() {
  return (
    <>
      <Header title="공지사항 작성" showBack showNotification={false} />
      <NoticeForm mode="create" />
    </>
  );
}
