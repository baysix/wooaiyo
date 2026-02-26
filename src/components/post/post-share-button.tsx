'use client';

import { useState } from 'react';
import ShareBottomSheet from '@/components/ui/share-bottom-sheet';
import type { ShareParams } from '@/lib/kakao';

type PostShareButtonProps = ShareParams;

export default function PostShareButton(props: PostShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center"
        title="공유하기"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </button>
      <ShareBottomSheet open={open} onClose={() => setOpen(false)} shareData={props} />
    </>
  );
}
