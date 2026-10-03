// src/mocks/cronStatus.mock.js
// Simula temporalmente el futuro endpoint GET /sistema/cron-status (todavía no existe en el backend).
// Se sustituirá por la llamada real en cuanto el backend lo publique, siguiendo el mismo
// patrón que orderHistory.mock.js.

const MOCK_CRON_STATUS = {
  status: 'ONLINE',
  lastSyncAt: '2026-10-02T03:00:00',
  lastError: null,
}

// Misma forma que tendrá la respuesta real: { status, lastSyncAt, lastError }.
export function getCronStatus() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_CRON_STATUS })
    }, 300)
  })
}
