'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/ui/global-loading';
import { deletePost } from '@/actions/posts';

export default function PostDeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const globalLoading = useLoading();

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    globalLoading.start();
    try {
      const result = await deletePost(postId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.replace('/home');
    } finally {
      setLoading(false);
      globalLoading.done();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 disabled:opacity-50"
    >
      삭제
    </button>
  );
}
