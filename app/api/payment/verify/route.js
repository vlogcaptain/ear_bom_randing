import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * 포트원 V2 결제 검증 API
 * 클라이언트에서 결제 성공 후 받은 paymentId를 통해 서버에서 실제 결제 내역을 검증합니다.
 */
export async function POST(request) {
    try {
        const { paymentId } = await request.json();

        if (!paymentId) {
            return NextResponse.json({ 
                success: false, 
                message: "paymentId가 필요합니다." 
            }, { status: 400 });
        }

        const apiSecret = process.env.PORTONE_API_SECRET;
        
        // 1. 포트원 V2 API를 조회하여 결제 상태 확인
        const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
            method: "GET",
            headers: {
                "Authorization": `PortOne ${apiSecret}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Portone API Error:", errorText);
            return NextResponse.json({ 
                success: false, 
                message: "포트원 결제 조회에 실패했습니다." 
            }, { status: 500 });
        }

        const payment = await response.json();

        // 2. 결제 상태 검증 (PAID 인지 확인)
        // V2 응답 스키마: { id, status, amount: { total, ... }, ... }
        if (payment.status !== "PAID") {
            return NextResponse.json({ 
                success: false, 
                message: "결제가 완료되지 않은 상태입니다.",
                status: payment.status 
            }, { status: 400 });
        }

        // 3. (Optional) 결제 금액 검증 로직 추가 가능
        // 예: DB의 주문 정보와 payment.amount.total 비교

        // 4. Firestore에 결제 내역 기록
        const paymentDoc = {
            paymentId: payment.id,
            orderName: payment.orderName,
            amount: payment.amount.total,
            currency: payment.amount.currency,
            status: payment.status,
            customer: payment.customer || {},
            method: payment.method || {},
            verifiedAt: serverTimestamp(),
            rawResponse: payment // 전체 응답 저장 (추후 대조용)
        };

        const docRef = await addDoc(collection(db, "payments"), paymentDoc);

        return NextResponse.json({ 
            success: true, 
            message: "결제 검증 및 저장이 완료되었습니다.",
            docId: docRef.id
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "서버 내부 오류가 발생했습니다.",
            error: error.message 
        }, { status: 500 });
    }
}
