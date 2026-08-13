'use client';

import { useVersionCheck } from '@/hooks/useVersionCheck';

export default function VersionChecker() {
    useVersionCheck();
    return null; // UI 없음, 백그라운드에서만 작동
}
