'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CURRENT_VERSION = '1.0.1'; // 배포 시 수동으로 증가
const VERSION_CHECK_INTERVAL = 30 * 1000; // 30초 (더 빠른 업데이트)

export function useVersionCheck() {
    useEffect(() => {
        // 개발 환경에서는 비활성화
        if (typeof window === 'undefined' || window.location.hostname === 'localhost') {
            return;
        }

        const checkVersion = async () => {
            try {
                // Firestore에서 최신 버전 확인
                const versionDoc = await getDoc(doc(db, 'app_config', 'version'));

                if (!versionDoc.exists()) {
                    console.log('[버전 체크] Firestore에 버전 정보 없음');
                    return;
                }

                const latestVersion = versionDoc.data().current;

                // localStorage에 저장된 버전 확인
                const storedVersion = localStorage.getItem('app_version');

                // 버전이 다르면 강제 새로고침
                if (storedVersion && storedVersion !== latestVersion) {
                    console.log(`[버전 체크] 업데이트 감지: ${storedVersion} → ${latestVersion}`);
                    localStorage.setItem('app_version', latestVersion);

                    // 강제 새로고침 (캐시 무시)
                    window.location.reload(true);
                } else if (!storedVersion) {
                    // 첫 방문 시 버전 저장
                    localStorage.setItem('app_version', latestVersion);
                }
            } catch (error) {
                // 에러 발생 시 무시 (앱 정상 작동 유지)
                console.error('[버전 체크] 에러:', error);
            }
        };

        // 즉시 실행
        checkVersion();

        // 주기적으로 체크 (30초마다)
        const interval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

        // 탭 전환 시에도 체크 (더 빠른 감지)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // 탭이 활성화될 때마다 체크
                checkVersion();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
