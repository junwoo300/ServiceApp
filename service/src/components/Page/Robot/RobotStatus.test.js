import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RobotStatus from './RobotStatus';
import { api } from '../../../apiClient';
jest.mock('../../../apiClient', () => ({ api: { get: jest.fn() } }));

test('shows actual telemetry, filters robots and loads a selected day', async () => {
  api.get.mockResolvedValue({ data: { fetchedAt: '2026-09-12T05:00:00Z', robots: [
    { vin: 'VIN1', name: 'Robot 1', status: 'online', tasks: 0, workMinutes: 326, actualArea: 100, plannedArea: 110 },
    { vin: 'VIN2', name: 'Robot 2', status: 'offline', tasks: null, workMinutes: null, actualArea: null, plannedArea: null },
  ] } });
  render(<MemoryRouter><RobotStatus /></MemoryRouter>);
  const table = within(screen.getByRole('table'));
  expect(await table.findByText('Robot 1')).toBeInTheDocument();
  expect(screen.getByText('5 ชม. 26 นาที')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('สถานะ'), { target: { value: 'offline' } });
  expect(table.queryByText('Robot 1')).not.toBeInTheDocument();
  expect(table.getByText('Robot 2')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('วันที่ดูผลงาน'), { target: { value: '2026-09-11' } });
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/robot-telemetry', expect.objectContaining({ params: { date: '2026-09-11' } })));
  await table.findByText('Robot 2');
});

test('failed connection is an error, not an offline fleet', async () => {
  api.get.mockRejectedValue(new Error('unavailable'));
  render(<MemoryRouter><RobotStatus /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('เชื่อมต่อไม่สำเร็จ');
  expect(screen.getByText('ยังไม่มีข้อมูลที่แสดงได้')).toBeInTheDocument();
});
