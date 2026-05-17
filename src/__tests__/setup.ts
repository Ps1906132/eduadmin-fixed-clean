/**
 * Vitest Global Setup — EduAdmin Fase 5: Testing
 *
 * Referensi: RINGKASAN_CHECKLIST.md § "FASE 5: CHECKLIST TESTING"
 * Menyediakan global mocks untuk localStorage agar test RBAC berjalan di environment jsdom.
 */

import '@testing-library/jest-dom';

// Mock localStorage (tersedia via jsdom, pastikan bersih setiap test)
beforeEach(() => {
  localStorage.clear();
});
