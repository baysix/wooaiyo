import Header from '@/components/layout/header';

export const metadata = {
  title: '서비스 이용약관 - 우아이요',
};

export default function TermsPage() {
  return (
    <>
      <Header title="서비스 이용약관" showBack showNotification={false} />
      <div className="px-4 py-6 text-sm leading-relaxed text-gray-700">
        <p className="mb-6 text-xs text-gray-400">시행일: 2024년 1월 1일</p>

        <Section title="제1조 (목적)">
          <p>
            이 약관은 우아이요(이하 &quot;서비스&quot;)가 제공하는 아파트 단지 내
            중고거래·나눔·대여 플랫폼 서비스의 이용과 관련하여 서비스와 이용자 간의
            권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (정의)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>&quot;서비스&quot;란 우아이요가 제공하는 아파트 단지 내 주민 간 중고거래, 나눔, 대여 중개 플랫폼을 말합니다.</li>
            <li>&quot;이용자&quot;란 이 약관에 따라 서비스에 접속하여 서비스를 이용하는 회원을 말합니다.</li>
            <li>&quot;회원&quot;이란 서비스에 회원 가입을 한 자로서, 서비스가 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
            <li>&quot;게시물&quot;이란 회원이 서비스를 이용함에 있어 서비스 내에 게시한 부호·문자·사진 등의 정보를 말합니다.</li>
          </ol>
        </Section>

        <Section title="제3조 (약관의 효력 및 변경)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
            <li>서비스는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 적용일자 7일 전부터 공지합니다.</li>
            <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제4조 (회원 가입)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이용자는 서비스가 정한 양식에 따라 회원 정보를 기입한 후 이 약관에 동의한다는 의사 표시를 함으로써 회원 가입을 신청합니다.</li>
            <li>서비스는 다음 각 호에 해당하는 신청에 대하여는 승인을 하지 않거나 사후에 이용 계약을 해지할 수 있습니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>가입 신청자가 이 약관에 의하여 이전에 회원 자격을 상실한 적이 있는 경우</li>
                <li>실명이 아닌 명의 또는 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, 서비스가 요구하는 내용을 기재하지 않은 경우</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="제5조 (회원 탈퇴 및 자격 상실)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>회원은 서비스에 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원 탈퇴를 처리합니다.</li>
            <li>회원이 다음 각 호의 사유에 해당하는 경우, 서비스는 회원 자격을 제한 또는 정지시킬 수 있습니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 질서를 위협하는 경우</li>
                <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="제6조 (서비스의 제공)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 다음과 같은 업무를 수행합니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>아파트 단지 내 중고거래·나눔·대여 게시물 등록 및 조회</li>
                <li>회원 간 채팅 기능</li>
                <li>아파트 커뮤니티 정보 제공</li>
                <li>기타 서비스가 정하는 업무</li>
              </ul>
            </li>
            <li>서비스는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 내용을 공지합니다.</li>
          </ol>
        </Section>

        <Section title="제7조 (서비스의 중단)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
            <li>서비스는 제1항의 사유로 서비스 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여는 배상하지 않습니다. 단, 서비스에 고의 또는 중대한 과실이 있는 경우에는 그러하지 아니합니다.</li>
          </ol>
        </Section>

        <Section title="제8조 (이용자의 의무)">
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>신청 또는 변경 시 허위 내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>서비스에 게시된 정보의 변경</li>
            <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
            <li>서비스와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            <li>외설 또는 폭력적인 메시지, 사진 등 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            <li>허위 매물 또는 사기성 거래 게시</li>
            <li>서비스의 운영을 고의로 방해하는 행위</li>
          </ol>
        </Section>

        <Section title="제9조 (게시물의 관리)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>회원의 게시물이 「정보통신망법」 및 「저작권법」 등 관련 법령에 위반되는 내용을 포함하는 경우, 권리자는 관련 법령이 정한 절차에 따라 해당 게시물의 게시중단 및 삭제 등을 요청할 수 있으며, 서비스는 관련 법령에 따라 조치를 취합니다.</li>
            <li>서비스는 전항에 따른 권리자의 요청이 없는 경우라도 다음 각 호에 해당하는 게시물에 대해 임시 조치 등을 취할 수 있습니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>다른 이용자 또는 제3자의 권리를 침해하는 경우</li>
                <li>서비스의 약관에 위반되는 경우</li>
                <li>기타 서비스 정책에 위반되는 경우</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="제10조 (거래 관련 책임)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 이용자 간의 거래를 중개하는 플랫폼이며, 거래 당사자가 아닙니다.</li>
            <li>이용자 간의 거래에서 발생하는 분쟁에 대하여 서비스는 책임을 지지 않습니다. 단, 서비스는 분쟁 해결을 위해 최선의 노력을 다합니다.</li>
            <li>이용자는 거래 시 상대방과 충분한 소통을 통해 거래 조건을 확인해야 합니다.</li>
          </ol>
        </Section>

        <Section title="제11조 (저작권의 귀속)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에 귀속합니다.</li>
            <li>이용자가 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속합니다.</li>
            <li>이용자는 서비스를 이용함으로써 얻은 정보 중 서비스에게 지적재산권이 귀속된 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
          </ol>
        </Section>

        <Section title="제12조 (면책 조항)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>서비스는 이용자의 귀책 사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
            <li>서비스는 이용자가 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
          </ol>
        </Section>

        <Section title="제13조 (분쟁 해결)" last>
          <ol className="list-decimal space-y-1 pl-5">
            <li>서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용합니다.</li>
            <li>서비스와 이용자 간에 제기된 소송에는 민사소송법상의 관할법원에 제기합니다.</li>
          </ol>
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
