import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { to, message, title = '이어봄 알림' } = await request.json();

        if (!to || !message) {
            return NextResponse.json({ success: false, error: 'Missing receiver or message content' }, { status: 400 });
        }

        const apiKey = process.env.ALIGO_API_KEY;
        const userId = process.env.ALIGO_USER_ID;
        const sender = process.env.ALIGO_SENDER;

        // 환경 변수가 지정되지 않은 경우 Mock 발송 처리 (안전한 폴백)
        if (!apiKey || !userId || !sender) {
            console.log(`======================================`);
            console.log(`[MOCK SMS SEND] - Credentials missing, logging instead`);
            console.log(`To: ${to}`);
            console.log(`Sender: ${sender || 'MOCK_SENDER'}`);
            console.log(`Title: ${title}`);
            console.log(`Message:\n${message}`);
            console.log(`======================================`);
            return NextResponse.json({ success: true, mock: true, message: 'Mock SMS logged successfully.' });
        }

        // 알리고 SMS 전송 API 호출 (Form Data 인코딩 필요)
        const bodyParams = new URLSearchParams();
        bodyParams.append('key', apiKey);
        bodyParams.append('userid', userId);
        bodyParams.append('sender', sender);
        bodyParams.append('receiver', to.replace(/[^0-9]/g, '')); // 숫자만 추출
        bodyParams.append('msg', message);
        bodyParams.append('title', title);

        const response = await fetch('https://apis.aligo.in/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString()
        });

        const result = await response.json();

        // 알리고 성공 코드는 '1' 또는 1
        if (result.result_code === '1' || result.result_code === 1) {
            return NextResponse.json({ success: true, result });
        } else {
            console.error('[SMS SEND ERROR]', result);
            return NextResponse.json({ success: false, error: result.message || 'SMS API provider returned error status' }, { status: 500 });
        }

    } catch (error) {
        console.error('[API SMS ERROR]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
