import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RobotChartTelegram from './RobotChartTelegram';
import { api } from '../../../apiClient';
import { buildSiteChartImages } from './robotSiteChartImage';
jest.mock('../../../apiClient', () => ({ api: { get: jest.fn(), post: jest.fn() } }));
jest.mock('./robotSiteChartImage', () => ({ buildSiteChartImages: jest.fn() }));
beforeEach(() => jest.clearAllMocks());

test('manual click fetches all sites for the chosen period and uploads chart images', async () => {
  const data = { robots: [{ location: 'A' }, { location: 'B' }] };
  api.get.mockResolvedValue({ data });
  buildSiteChartImages.mockResolvedValue([new Blob(['png'], { type: 'image/png' })]);
  api.post.mockResolvedValue({ data: { message: 'ส่งกราฟแล้ว' } });
  render(<RobotChartTelegram date="2026-09-20" endDate="2026-09-24" />);
  expect(api.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toBeDisabled();
  expect(await screen.findByRole('status')).toHaveTextContent('ส่งกราฟแล้ว');
  expect(buildSiteChartImages).toHaveBeenCalledWith(data, '2026-09-20', '2026-09-24');
  const form = api.post.mock.calls[0][1];
  expect(form.get('date')).toBe('2026-09-20');
  expect(form.getAll('photos')).toHaveLength(1);
});

test('failed telemetry never sends and an ambiguous send is not retried', async () => {
  api.get.mockRejectedValueOnce(new Error('offline'));
  render(<RobotChartTelegram date="2026-09-24" endDate="2026-09-24" />);
  fireEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('alert')).toHaveTextContent('ยังไม่ได้ส่ง');
  expect(api.post).not.toHaveBeenCalled();
  api.get.mockResolvedValue({ data: { robots: [] } });
  buildSiteChartImages.mockResolvedValue([new Blob(['png'])]);
  api.post.mockRejectedValue(new Error('timeout'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('ตรวจสอบในกลุ่ม Telegram'));
  expect(api.post).toHaveBeenCalledTimes(1);
});
