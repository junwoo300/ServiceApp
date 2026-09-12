import { askAI } from './api';
import { apiFetch } from '../../../apiClient';
jest.mock('../../../apiClient', () => ({ apiFetch: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  if (!AbortSignal.timeout) AbortSignal.timeout = () => new AbortController().signal;
});

test('returns a valid AI response', async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ response: 'สวัสดีครับ' }) });
  expect(await askAI('สวัสดี')).toBe('สวัสดีครับ');
});

test.each([
  { ok: false, json: async () => ({ error: 'AI processing failed' }) },
  { ok: true, json: async () => ({}) },
  { ok: false, json: async () => { throw new Error('Not JSON'); } },
])('shows an error instead of undefined for failed or malformed responses', async response => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  apiFetch.mockResolvedValue(response);
  expect(await askAI('สวัสดี')).toBe('เกิดข้อผิดพลาด กรุณาลองใหม่');
  log.mockRestore();
});
