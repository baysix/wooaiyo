'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useLoading } from '@/components/ui/global-loading';
import { getProfile, updateProfile, uploadAvatar } from '@/actions/auth';

export default function EditProfilePage() {
  const router = useRouter();
  const globalLoading = useLoading();

  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      const profile = await getProfile();
      if (profile) {
        setNickname(profile.nickname);
        setAvatarUrl(profile.avatar_url);
        setAvatarPreview(profile.avatar_url);
      }
      setFetching(false);
    }
    fetch();
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError('');
    globalLoading.start();

    try {
      let newAvatarUrl = avatarUrl;

      // Upload new avatar if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        const uploadResult = await uploadAvatar(fd);
        if (uploadResult.error) throw new Error(uploadResult.error);
        newAvatarUrl = uploadResult.url ?? null;
      }

      const formData = new FormData(form);
      const result = await updateProfile(formData, newAvatarUrl ?? undefined);

      if (result.error) throw new Error(result.error);

      router.replace('/my');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
      globalLoading.done();
    }
  }

  if (fetching) {
    return (
      <>
        <Header title="프로필 편집" showBack showNotification={false} />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="프로필 편집" showBack showNotification={false} />

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#20C997] text-white shadow-md">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-xs text-gray-400">프로필 사진 변경</p>
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
          <input
            name="nickname"
            type="text"
            required
            minLength={2}
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#20C997] focus:outline-none focus:ring-1 focus:ring-[#20C997]"
            placeholder="닉네임 (2~20자)"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !nickname.trim()}
          className="w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </>
  );
}
