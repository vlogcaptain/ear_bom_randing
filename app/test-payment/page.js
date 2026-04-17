'use client';

import PaymentButton from '@/components/PaymentButton';
import { useAuth } from '@/context/AuthContext';

export default function TestPaymentPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">결제 테스트 페이지</h1>
        <p className="text-gray-500 mb-8">
          포트원 V2 연동이 정상적으로 작동하는지 확인합니다.<br />
          아래 버튼을 눌러 결제창이 뜨는지 테스트해 보세요.
        </p>

        <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-bold text-blue-800 mb-2">테스트 정보</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 상품명: 건강 진단 서비스 이용권</li>
            <li>• 결제금액: 1,000원</li>
            <li>• 고객: {user?.email || "시스템 테스트"}</li>
          </ul>
        </div>

        <PaymentButton 
          amount={1000}
          orderName="건강 진단 서비스 테스트"
          customerName={user?.displayName || "홍길동"}
          customerEmail={user?.email || "test@example.com"}
        />

        <p className="mt-6 text-xs text-gray-400">
          * 실제 결제가 발생하지 않도록 테스트 채널 키를 사용해 주세요.
        </p>
      </div>
    </div>
  );
}
