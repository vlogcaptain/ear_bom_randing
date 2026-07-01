import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
    title: "earbom wellness - 귀 하나로 읽는 당신의 건강",
    description: "동양의학의 지름길, 전문가 분석 기반 스마트 건강 진단 서비스",
    icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
                <link
                    rel="stylesheet"
                    as="style"
                    crossOrigin=""
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
                />
                <script src="https://cdn.portone.io/v2/browser-sdk.js" defer />
            </head>
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
