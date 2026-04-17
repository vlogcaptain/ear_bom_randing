'use client';

import { useState } from 'react';

/**
 * 포트원 V2 결제 버튼 컴포넌트
 * @param {number} amount - 결제 금액
 * @param {string} orderName - 주문명
 * @param {string} customerName - 고객 이름
 * @param {string} customerEmail - 고객 이메일
 */
export default function PaymentButton({ 
  amount = 100, 
  orderName = "건강 진단 서비스 이용권", 
  customerName = "",
  customerEmail = ""
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // 1. SDK 로드 확인
    if (!window.PortOne) {
      alert("결제 모듈이 아직 준비되지 않았습니다. 잠시 후 상단 스크립트가 로드되면 다시 시도해 주세요.");
      return;
    }

    // 2. 환경 변수 확인 (Store ID, Channel Key)
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || storeId === "store-xxxxxx") {
      alert("관리자 설어에서 Store ID를 설정해야 합니다.");
      return;
    }

    setLoading(true);

    try {
      // 3. 포트원 결제창 호출
      const paymentId = `payment-${crypto.randomUUID()}`;
      
      const response = await window.PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: orderName,
        totalAmount: amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD", // 기본 결제 수단 (CARD, EASY_PAY 등)
        customer: {
          fullName: customerName || "이름 없음",
          email: customerEmail || "test@example.com",
        },
      });

      // 4. 결제 결과 처리
      // V2 SDK는 실패 시 response.code (에러코드)가 포함된 객체를 반환합니다.
      if (response.code !== undefined) {
        alert(`결제 실패: ${response.message}`);
        setLoading(false);
        return;
      }

      // 5. 서버에 결제 검증 요청
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: response.paymentId }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert("결제가 성공적으로 완료되었습니다!");
        // 여기에 성공 후 로직 (예: 대시보드로 이동 등)을 추가할 수 있습니다.
        // window.location.href = "/dashboard";
      } else {
        alert(`결제 검증에 실패했습니다: ${verifyData.message}`);
      }

    } catch (error) {
      console.error("Payment Process Error:", error);
      alert("결제 진행 중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-blue-600 rounded-xl group hover:bg-blue-700 active:scale-95 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      <span className="relative flex items-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            처리 중...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">payments</span>
            {amount.toLocaleString()}원 결제하기
          </>
        )}
      </span>
    </button>
  );
}
