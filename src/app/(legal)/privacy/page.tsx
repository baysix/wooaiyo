import Header from '@/components/layout/header';

export const metadata = {
  title: '개인정보처리방침 - 우아이요',
};

export default function PrivacyPage() {
  return (
    <>
      <Header title="개인정보처리방침" showBack showNotification={false} />
      <div className="px-4 py-6 text-sm leading-relaxed text-gray-700">
        <p className="mb-6 text-xs text-gray-400">시행일: 2024년 1월 1일</p>

        <p className="mb-4">
          우아이요(이하 &quot;서비스&quot;)는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를
          보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이
          개인정보처리방침을 수립·공개합니다.
        </p>

        <Section title="제1조 (개인정보의 처리 목적)">
          <p>서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 가입 의사 확인, 서비스 부정 이용 방지</li>
            <li>서비스 제공: 아파트 단지 내 중고거래·나눔·대여 서비스 제공, 게시물 등록 및 조회, 채팅 기능 제공</li>
            <li>고충 처리: 민원인의 신원 확인, 사실 조사를 위한 연락·통지, 처리 결과 통보</li>
          </ol>
        </Section>

        <Section title="제2조 (개인정보의 처리 및 보유 기간)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 법령에 따른 개인정보 보유·이용 기간 또는 이용자로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</li>
            <li>회원 가입 정보: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
            <li>거래 관련 기록: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 5년간 보관</li>
            <li>접속 기록: 「통신비밀보호법」에 따라 3개월간 보관</li>
          </ol>
        </Section>

        <Section title="제3조 (처리하는 개인정보의 항목)">
          <p>서비스는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>필수 항목: 이메일 주소, 비밀번호(암호화 저장), 닉네임, 소속 아파트 정보</li>
            <li>자동 수집 항목: 접속 IP, 접속 일시, 서비스 이용 기록, 기기 정보</li>
          </ol>
        </Section>

        <Section title="제4조 (개인정보의 제3자 제공)">
          <p>
            서비스는 이용자의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며,
            이용자의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및
            제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </p>
        </Section>

        <Section title="제5조 (개인정보의 파기절차 및 파기방법)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
          </ol>
        </Section>

        <Section title="제6조 (개인정보의 안전성 확보조치)">
          <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>비밀번호의 암호화: 이용자의 비밀번호는 bcrypt 알고리즘으로 암호화되어 저장 및 관리됩니다.</li>
            <li>해킹 등에 대비한 기술적 대책: 보안 프로그램을 설치하고 주기적으로 갱신·점검합니다.</li>
            <li>개인정보에 대한 접근 제한: 개인정보를 처리하는 데이터베이스 시스템에 대한 접근 권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근을 통제합니다.</li>
            <li>접속 기록의 보관 및 위변조 방지: 개인정보 처리 시스템에 접속한 기록을 최소 1년 이상 보관·관리합니다.</li>
          </ol>
        </Section>

        <Section title="제7조 (이용자의 권리·의무 및 행사방법)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이용자는 서비스에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
            <li>권리 행사는 서비스 내 설정 메뉴 또는 이메일을 통하여 하실 수 있으며, 서비스는 이에 대해 지체 없이 조치하겠습니다.</li>
            <li>이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
          </ol>
        </Section>

        <Section title="제8조 (개인정보 보호책임자)">
          <p>서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          <div className="mt-2 rounded-lg bg-gray-50 p-3">
            <p>개인정보 보호책임자</p>
            <p className="text-gray-500">이메일: support@wooaiyo.com</p>
          </div>
        </Section>

        <Section title="제9조 (개인정보처리방침 변경)">
          <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </Section>

        <Section title="제10조 (권익침해 구제방법)" last>
          <p>이용자는 개인정보침해로 인한 구제를 받기 위하여 다음 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-500">
            <li>개인정보분쟁조정위원회: (국번없이) 1833-6972</li>
            <li>개인정보침해신고센터: (국번없이) 118</li>
            <li>대검찰청 사이버수사과: (국번없이) 1301</li>
            <li>경찰청 사이버수사국: (국번없이) 182</li>
          </ul>
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? '' : 'mb-6'}>
      <h2 className="mb-2 text-[15px] font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
