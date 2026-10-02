import { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RobotPerformanceChart from './RobotPerformanceChart';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  const React = require('react');
  return { ...actual, ResponsiveContainer: ({ children }) => React.cloneElement(children, { width: 600, height: 300 }) };
});

const robots = [
  { vin: 'A', name: 'Robot A', tasks: 2, workMinutes: 90, actualArea: 150, plannedArea: 100 },
  { vin: 'B', name: 'Robot B', tasks: 0, workMinutes: 0, actualArea: 0, plannedArea: null },
];

test('checkbox selection immediately adds and removes robots in the same chart', () => {
  function Chart() {
    const [selectedVins, onSelect] = useState([]);
    return <RobotPerformanceChart robots={robots} selectedVins={selectedVins} onSelect={onSelect} period="today" />;
  }
  render(<Chart />);
  fireEvent.click(screen.getByText(/เลือกหุ่นยนต์เพื่อดูกราฟ/));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Robot A A' }));
  expect(within(screen.getByRole('img')).getByText('Robot A')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Robot B B' }));
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(within(screen.getByRole('img')).getByText('Robot A')).toBeInTheDocument();
  expect(within(screen.getByRole('img')).getByText('Robot B')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Robot A A' }));
  expect(within(screen.getByRole('img')).queryByText('Robot A')).not.toBeInTheDocument();
  expect(within(screen.getByRole('img')).getByText('Robot B')).toBeInTheDocument();
});

test('selects individual robots and updates the graph and totals with new data', () => {
  const onSelect = jest.fn();
  const { rerender } = render(<RobotPerformanceChart robots={robots} selectedVins={['A']} onSelect={onSelect} period="2026-09-20" />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/Robot A: พื้นที่จริง 150/);
  expect(screen.getByText('150%')).toBeInTheDocument();
  expect(screen.getByText('1 ชม. 30 นาที')).toBeInTheDocument();
  fireEvent.click(screen.getByText(/เลือกหุ่นยนต์เพื่อดูกราฟ/));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Robot B B' }));
  expect(onSelect).toHaveBeenCalledWith(['A', 'B']);
  rerender(<RobotPerformanceChart robots={robots} selectedVins={['B']} onSelect={onSelect} period="2026-09-21" />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/Robot B: พื้นที่จริง 0 ตร.ม. พื้นที่แผน ไม่มีข้อมูล/);
  expect(screen.getByText('0 งาน')).toBeInTheDocument();
  expect(screen.queryByText('150%')).not.toBeInTheDocument();
  expect(screen.getByText(/ผลงานรวมวันที่ 2026-09-21/)).toBeInTheDocument();
});

test('missing measurements do not become zero and stale data is identified', () => {
  render(<RobotPerformanceChart robots={[{ vin: 'A', name: 'Robot A' }]} selectedVins={['A']} onSelect={() => {}} period="2026-09-20" stale />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText('ไม่มีข้อมูลพื้นที่ทำความสะอาดในช่วงวันที่เลือก')).toBeInTheDocument();
  expect(screen.getByText(/กำลังแสดงข้อมูลเดิม/)).toBeInTheDocument();
});

test('search preserves selection, all selects the fleet and can clear it', () => {
  const onSelect = jest.fn();
  const { rerender } = render(<RobotPerformanceChart robots={robots} selectedVins={['A']} onSelect={onSelect} period="today" />);
  fireEvent.click(screen.getByText(/เลือกหุ่นยนต์เพื่อดูกราฟ/));
  expect(screen.getByRole('checkbox', { name: 'ทั้งหมด' }).indeterminate).toBe(true);
  fireEvent.change(screen.getByLabelText('ค้นหาในรายการ'), { target: { value: 'Robot B' } });
  expect(screen.queryByRole('checkbox', { name: 'Robot A A' })).not.toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAccessibleName(/Robot A/);
  fireEvent.click(screen.getByRole('checkbox', { name: 'ทั้งหมด' }));
  expect(onSelect).toHaveBeenLastCalledWith(['A', 'B']);
  rerender(<RobotPerformanceChart robots={robots} selectedVins={['A', 'B']} onSelect={onSelect} period="today" />);
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(screen.getByRole('img')).toHaveAccessibleName(/Robot A.*Robot B/);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Robot B B' }));
  expect(onSelect).toHaveBeenLastCalledWith(['A']);
  fireEvent.click(screen.getByRole('checkbox', { name: 'ทั้งหมด' }));
  expect(onSelect).toHaveBeenLastCalledWith([]);
});
