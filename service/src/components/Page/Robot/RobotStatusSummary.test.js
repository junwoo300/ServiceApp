import { render, screen, fireEvent } from '@testing-library/react';
import RobotStatusSummary from './RobotStatusSummary';
import { buildRobotStatusSummary } from './robotReportText';
import { api } from '../../../apiClient';
jest.mock('../../../apiClient', () => ({ api: { get: jest.fn() } }));

test('morning omits areas; afternoon keeps offline work and distinguishes zero from missing', () => {
  const robots = [
    { vin: 'a', location: 'DAD', status: 'offline', actualArea: 1234.5 },
    { vin: 'b', location: 'RAM2', status: 'online', actualArea: 0 },
    { vin: 'c', location: 'VBH_BKK', status: 'online', actualArea: null },
  ];
  expect(buildRobotStatusSummary(robots)).not.toContain('ตารางเมตร');
  const text = buildRobotStatusSummary(robots, { mode: 'afternoon', date: '2026-09-11' });
  expect(text).toContain('สรุปตอนบ่าย วันที่ 2026-09-11');
  expect(text).toContain('🔴ออฟไลน์ · ทำงานได้ 1,234.5 ตารางเมตร');
  expect(text).toContain('🟢ออนไลน์ · ทำงานได้ 0 ตารางเมตร');
  expect(text).toContain('🟢ออนไลน์ · ไม่มีข้อมูลพื้นที่การทำงาน');
});

test('afternoon fetches the selected date and includes its daily area in copied report', async () => {
  api.get.mockResolvedValue({ data: { fetchedAt: '2026-09-12T05:00:00Z', robots: [
    { vin: '1', location: 'DAD', status: 'offline', actualArea: 250 },
  ] } });
  render(<RobotStatusSummary date="2026-09-01" endDate="2026-09-11" />);
  fireEvent.change(screen.getByLabelText('รูปแบบสรุป'), { target: { value: 'afternoon' } });
  fireEvent.click(screen.getByText('สรุปสถานะ'));
  const input = await screen.findByLabelText('ข้อความสรุป');
  expect(api.get).toHaveBeenLastCalledWith('/robot-telemetry', expect.objectContaining({ params: { date: '2026-09-01', endDate: '2026-09-11' } }));
  expect(input.value).toContain('🔴ออฟไลน์ · ทำงานได้ 250 ตารางเมตร');
  expect(input.value).toContain('วันที่ 2026-09-01 ถึง 2026-09-11');
});

test('groups floors and models in report order, preserves unknown and extra sites', () => {
  const text = buildRobotStatusSummary([
    { vin: '1', location: 'THAMC_F2', status: 'online' },
    { vin: '2', location: 'THAMC_F1', status: 'offline' },
    { vin: '3', location: 'ARL_MAS_2', status: 'online' },
    { vin: '4', location: 'EXTRA', name: 'Robot 4', status: 'unknown' },
    { vin: 'IDPWXB613216F90068', location: 'CMA_1', name: 'MT-37', status: 'offline' },
    { vin: 'IDPWXB613216F90080', location: 'CMA_2', name: 'MT-38', status: 'online' },
  ]);
  expect(text).toContain('โรงพยาบาลธรรมศาสตร์รังสิต\n🔴ชั้น 1 ออฟไลน์\n🟢ชั้น 2 ออนไลน์');
  expect(text).toContain('🟢SC80 ออนไลน์');
  expect(text).toContain('SET (North Park1)\n🔴ออฟไลน์');
  expect(text).toContain('SET (North Park2)\n🟢ออนไลน์');
  expect(text).not.toContain('CMA_1 (MT-37)');
  expect(text).not.toContain('CMA_2 (MT-38)');
  expect(text).toContain('EXTRA (Robot 4)\n⚪ไม่ทราบสถานะ');
});

test('fetches a report, allows editing including clearing, and copies the edited text', async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  api.get.mockResolvedValue({ data: { fetchedAt: '2026-09-12T05:00:00Z', robots: [{ vin: '1', location: 'DAD', status: 'offline' }] } });
  render(<RobotStatusSummary />);
  fireEvent.click(screen.getByText('สรุปสถานะ'));
  const input = await screen.findByLabelText('ข้อความสรุป');
  expect(input.value).toContain('ศูนย์ราชการแจ้งวัฒนะ\n🔴ออฟไลน์');
  fireEvent.change(input, { target: { value: '' } });
  expect(screen.getByLabelText('ข้อความสรุป')).toBeInTheDocument();
  expect(screen.getByText('คัดลอกข้อความ')).toBeDisabled();
  fireEvent.change(input, { target: { value: 'ข้อความแก้ไขแล้ว' } });
  fireEvent.click(screen.getByText('คัดลอกข้อความ'));
  await screen.findByText('คัดลอกข้อความแล้ว');
  expect(writeText).toHaveBeenCalledWith('ข้อความแก้ไขแล้ว');
});

test('failed fetch cannot produce a misleading offline report', async () => {
  api.get.mockRejectedValue(new Error('network'));
  render(<RobotStatusSummary />);
  fireEvent.click(screen.getByText('สรุปสถานะ'));
  expect(await screen.findByRole('alert')).toHaveTextContent('ดึงสถานะไม่สำเร็จ');
  expect(screen.queryByText('คัดลอกข้อความ')).not.toBeInTheDocument();
});
