'use client';

import { useFormStatus } from 'react-dom';
import { useLoading } from './global-loading';
import { useEffect } from 'react';

interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
}

export default function SubmitButton({
  children,
  loadingText,
  disabled,
  className = 'w-full rounded-lg bg-[#20C997] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1BAE82] disabled:opacity-50',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const { start, done } = useLoading();

  // Sync form pending state with global loading bar
  useEffect(() => {
    if (pending) start();
    else done();
  }, [pending, start, done]);

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
    >
      {pending && loadingText ? loadingText : children}
    </button>
  );
}
