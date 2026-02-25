import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#20C997]/10">
        <svg className="h-10 w-10 text-[#20C997]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.192-.14 1.743" />
        </svg>
      </div>
      <h2 className="mt-5 text-lg font-bold text-gray-900">준비중입니다</h2>
      <p className="mt-2 text-center text-sm text-gray-500">
        해당 기능은 열심히 개발중이에요.<br />
        조금만 기다려주세요!
      </p>
      <Link
        href="/home"
        className="mt-6 rounded-lg bg-[#20C997] px-6 py-2.5 text-sm font-semibold text-white"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
