/**
 * Firestore에 초기 버전 설정 스크립트
 *
 * 실행 방법:
 * 1. 브라우저에서 https://ear-bom-healthy.web.app 접속
 * 2. 개발자 도구 열기 (F12)
 * 3. Console 탭으로 이동
 * 4. 아래 코드 전체 복사 후 붙여넣기
 * 5. Enter 키 눌러 실행
 */

(async function initAppVersion() {
    console.log('[초기화] 버전 설정 시작...');

    try {
        // Firebase 모듈 import (이미 로드되어 있어야 함)
        const { getFirestore, doc, setDoc, serverTimestamp } = window.firebase || {};

        if (!getFirestore) {
            throw new Error('Firebase가 로드되지 않았습니다. 사이트에 접속한 상태에서 실행해주세요.');
        }

        const db = getFirestore();

        // app_config/version 문서 생성
        await setDoc(doc(db, 'app_config', 'version'), {
            current: '1.0.0',
            updatedAt: serverTimestamp(),
            description: '초기 버전 설정'
        });

        console.log('✅ 버전 설정 완료!');
        console.log('- 컬렉션: app_config');
        console.log('- 문서 ID: version');
        console.log('- 버전: 1.0.0');
        console.log('\nFirestore에서 확인하세요:');
        console.log('https://console.firebase.google.com/project/ear-bom-healthy/firestore/databases/-default-/data/~2Fapp_config~2Fversion');

    } catch (error) {
        console.error('❌ 에러 발생:', error);
        console.log('\n대안: Firebase Console에서 수동 생성');
        console.log('1. https://console.firebase.google.com/project/ear-bom-healthy/firestore');
        console.log('2. "컬렉션 시작" 클릭');
        console.log('3. 컬렉션 ID: app_config');
        console.log('4. 문서 ID: version');
        console.log('5. 필드 추가:');
        console.log('   - current (string): 1.0.0');
        console.log('   - updatedAt (timestamp): 현재 시간');
    }
})();
