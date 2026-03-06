'use client';

import { useState } from 'react';

export type LegalType = 'terms' | 'privacy';

export function useLegalModal() {
  const [legalModal, setLegalModal] = useState<LegalType | null>(null);
  return { legalModal, setLegalModal };
}

export function LegalLinks({
  onOpen,
}: {
  onOpen: (type: LegalType) => void;
}) {
  return (
    <span className="text-xs text-gray-400">
      <button type="button" onClick={() => onOpen('terms')} className="text-[#20C997] underline">서비스 이용약관</button>
      {' | '}
      <button type="button" onClick={() => onOpen('privacy')} className="text-[#20C997] underline">개인정보처리방침</button>
    </span>
  );
}

export function LegalModal({
  type,
  onClose,
}: {
  type: LegalType | null;
  onClose: () => void;
}) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="flex w-full max-w-lg flex-col rounded-2xl bg-white"
        style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold">
            {type === 'terms' ? '서비스 이용약관' : '개인정보처리방침'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 text-xs leading-relaxed text-gray-600">
          {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-gray-400">시행일: 2024년 1월 1일</p>
      <S title="제1조 (목적)">
        이 약관은 우아이요(이하 &quot;서비스&quot;)가 제공하는 아파트 단지 내 중고거래·나눔·대여 플랫폼 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
      </S>
      <S title="제2조 (정의)">
        <ol className="list-decimal space-y-0.5 pl-4">
          <li>&quot;서비스&quot;란 우아이요가 제공하는 아파트 단지 내 주민 간 중고거래, 나눔, 대여 중개 플랫폼을 말합니다.</li>
          <li>&quot;이용자&quot;란 이 약관에 따라 서비스에 접속하여 서비스를 이용하는 회원을 말합니다.</li>
          <li>&quot;게시물&quot;이란 회원이 서비스 내에 게시한 부호·문자·사진 등의 정보를 말합니다.</li>
        </ol>
      </S>
      <S title="제3조 (약관의 효력 및 변경)">
        서비스는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 적용일자 7일 전부터 공지합니다.
      </S>
      <S title="제4조 (회원 가입)">
        이용자는 서비스가 정한 양식에 따라 회원 정보를 기입한 후 이 약관에 동의한다는 의사 표시를 함으로써 회원 가입을 신청합니다. 허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.
      </S>
      <S title="제5조 (회원 탈퇴 및 자격 상실)">
        회원은 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 처리합니다. 타인의 정보 도용, 서비스 운영 방해 등의 경우 자격이 제한될 수 있습니다.
      </S>
      <S title="제6조 (서비스의 제공)">
        아파트 단지 내 중고거래·나눔·대여 게시물 등록 및 조회, 회원 간 채팅, 아파트 커뮤니티 정보 제공 등의 서비스를 제공합니다.
      </S>
      <S title="제7조 (이용자의 의무)">
        허위 정보 등록, 타인 정보 도용, 저작권 침해, 사기성 거래 게시, 서비스 운영 방해 등의 행위를 하여서는 안 됩니다.
      </S>
      <S title="제8조 (거래 관련 책임)">
        서비스는 이용자 간 거래를 중개하는 플랫폼이며 거래 당사자가 아닙니다. 이용자 간 거래 분쟁에 대하여 서비스는 책임을 지지 않습니다.
      </S>
      <S title="제9조 (면책 조항)">
        천재지변 등 불가항력, 이용자의 귀책 사유로 인한 장애, 이용자가 게재한 정보의 신뢰도에 대하여는 책임을 지지 않습니다.
      </S>
      <S title="제10조 (분쟁 해결)">
        서비스와 이용자 간 분쟁에 대한 소송은 대한민국 법을 적용하며, 민사소송법상의 관할법원에 제기합니다.
      </S>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-gray-400">시행일: 2024년 1월 1일</p>
      <S title="제1조 (개인정보의 처리 목적)">
        <ol className="list-decimal space-y-0.5 pl-4">
          <li>회원 가입 및 관리: 본인 확인, 개인 식별, 부정 이용 방지</li>
          <li>서비스 제공: 중고거래·나눔·대여 서비스, 게시물 등록/조회, 채팅</li>
          <li>고충 처리: 민원 신원 확인, 연락·통지, 처리 결과 통보</li>
        </ol>
      </S>
      <S title="제2조 (처리 및 보유 기간)">
        회원 탈퇴 시 즉시 파기합니다. 단, 거래 관련 기록은 전자상거래법에 따라 5년, 접속 기록은 통신비밀보호법에 따라 3개월간 보관합니다.
      </S>
      <S title="제3조 (수집하는 개인정보 항목)">
        <ol className="list-decimal space-y-0.5 pl-4">
          <li>필수: 이메일, 비밀번호(암호화), 닉네임, 소속 아파트</li>
          <li>자동 수집: 접속 IP, 접속 일시, 서비스 이용 기록, 기기 정보</li>
        </ol>
      </S>
      <S title="제4조 (개인정보의 제3자 제공)">
        이용자의 동의 또는 법률의 특별한 규정이 있는 경우에만 제3자에게 제공합니다.
      </S>
      <S title="제5조 (파기절차 및 방법)">
        보유 기간 경과 시 지체 없이 파기하며, 전자적 파일은 복구 불가능한 방법으로 삭제합니다.
      </S>
      <S title="제6조 (안전성 확보조치)">
        비밀번호 bcrypt 암호화, 보안 프로그램 운영, DB 접근 권한 통제, 접속 기록 1년 이상 보관 등의 조치를 취하고 있습니다.
      </S>
      <S title="제7조 (이용자의 권리)">
        언제든지 개인정보 열람·정정·삭제·처리정지를 요구할 수 있으며, 서비스 내 설정 또는 이메일을 통해 행사할 수 있습니다.
      </S>
      <S title="제8조 (개인정보 보호책임자)">
        이메일: support@wooaiyo.com
      </S>
      <S title="제9조 (권익침해 구제방법)">
        개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)
      </S>
    </div>
  );
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold text-gray-800">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
