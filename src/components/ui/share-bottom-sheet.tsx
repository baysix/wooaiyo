'use client';

import { useState } from 'react';
import { shareKakao, canShareKakao, copyLink, webShare, type ShareParams } from '@/lib/kakao';

interface ShareBottomSheetProps {
  open: boolean;
  onClose: () => void;
  shareData: ShareParams;
}

export default function ShareBottomSheet({ open, onClose, shareData }: ShareBottomSheetProps) {
  const [toast, setToast] = useState('');

  if (!open) return null;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function handleKakao() {
    const ok = shareKakao(shareData);
    if (!ok) showToast('카카오톡 공유를 사용할 수 없습니다');
    onClose();
  }

  async function handleCopyLink() {
    await copyLink(shareData.link);
    showToast('링크가 복사되었습니다');
    onClose();
  }

  async function handleWebShare() {
    const ok = await webShare(shareData);
    if (!ok) {
      await handleCopyLink();
      return;
    }
    onClose();
  }

  const showKakao = canShareKakao();
  const showWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-slide-up rounded-t-2xl bg-white pb-safe">
        <div className="mx-auto max-w-lg">
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>

          <p className="px-4 pb-3 text-sm font-semibold text-gray-900">공유하기</p>

          <div className="grid grid-cols-3 gap-2 px-4 pb-6">
            {/* 카카오톡 (모바일만) */}
            {showKakao && (
              <button
                onClick={handleKakao}
                className="flex flex-col items-center gap-2 rounded-xl p-3 active:bg-gray-50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEE500]">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.63 1.76 4.94 4.4 6.26-.14.52-.9 3.34-.93 3.55 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.62.09 1.26.14 1.92.14 5.52 0 10-3.36 10-7.34C22 6.36 17.52 3 12 3z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700">카카오톡</span>
              </button>
            )}

            {/* 링크 복사 */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 rounded-xl p-3 active:bg-gray-50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-6.364-6.364L4.5 8.06" />
                </svg>
              </div>
              <span className="text-xs text-gray-700">링크 복사</span>
            </button>

            {/* Web Share API */}
            {showWebShare && (
              <button
                onClick={handleWebShare}
                className="flex flex-col items-center gap-2 rounded-xl p-3 active:bg-gray-50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700">더보기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
