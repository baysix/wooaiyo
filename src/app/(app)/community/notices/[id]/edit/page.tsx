import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import NoticeForm from '@/components/notice/notice-form';
import { getNotice } from '@/actions/notices';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: Props) {
  const { id } = await params;
  const { notice, role } = await getNotice(id);

  if (!notice) notFound();
  if (role === 'resident') notFound();

  return (
    <>
      <Header title="공지사항 수정" showBack showNotification={false} />
      <NoticeForm
        mode="edit"
        noticeId={notice.id}
        defaultValues={{
          title: notice.title,
          content: notice.content,
        }}
      />
    </>
  );
}
