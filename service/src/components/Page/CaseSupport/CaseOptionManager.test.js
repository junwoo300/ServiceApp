import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import CaseOptionManager from './CaseOptionManager';
import CaseSupport from './CaseSupport';

jest.mock('axios', () => Object.assign(jest.fn(), { get: jest.fn(), put: jest.fn() }));
const options = { subjects: [{ _id: 's1', name: 'หัวข้อใหม่' }], types: [{ _id: 't1', name: 'ประเภทใหม่' }] };
beforeEach(() => jest.clearAllMocks());

test('adds a trimmed option and updates the shared choices from the server', async () => {
  axios.mockResolvedValue({ data: options });
  const onUpdate = jest.fn();
  render(<CaseOptionManager kind="subjects" options={{ subjects: [], types: [] }} onUpdate={onUpdate} onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText('ชื่อตัวเลือก'), { target: { value: ' หัวข้อใหม่ ' } });
  fireEvent.click(screen.getByText('เพิ่มตัวเลือก'));
  await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(options));
  expect(axios).toHaveBeenCalledWith(expect.objectContaining({ method: 'post', data: { name: 'หัวข้อใหม่' } }));
});

test('edits an option and displays duplicate errors without discarding input', async () => {
  axios.mockRejectedValue({ response: { data: { error: 'มีชื่อนี้อยู่แล้ว' } } });
  render(<CaseOptionManager kind="types" options={options} onUpdate={jest.fn()} onClose={() => {}} />);
  fireEvent.click(screen.getByText('แก้ไข'));
  fireEvent.change(screen.getByLabelText('ชื่อตัวเลือก'), { target: { value: 'ซ้ำ' } });
  fireEvent.click(screen.getByText('บันทึกการแก้ไข'));
  expect(await screen.findByRole('alert')).toHaveTextContent('มีชื่อนี้อยู่แล้ว');
  expect(screen.getByLabelText('ชื่อตัวเลือก')).toHaveValue('ซ้ำ');
  expect(axios).toHaveBeenCalledWith(expect.objectContaining({ method: 'put', url: expect.stringContaining('/types/t1') }));
});

test('deletion requires confirmation and refreshes options', async () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const onUpdate = jest.fn();
  axios.mockResolvedValue({ data: { subjects: [], types: [] } });
  render(<CaseOptionManager kind="types" options={options} onUpdate={onUpdate} onClose={() => {}} />);
  fireEvent.click(screen.getByText('ลบ'));
  expect(axios).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByText('ลบ'));
  await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  expect(axios).toHaveBeenCalledWith(expect.objectContaining({ method: 'delete', url: expect.stringContaining('/types/t1') }));
  confirm.mockRestore();
});

test('preserves removed choices when editing an existing case', async () => {
  const record = { _id: 'c1', caseNo: 'CS-1', subject: 'หัวข้อเดิม', type: 'ประเภทเดิม', site: 'Site',
    description: 'รายละเอียด', openedDate: '2026-09-21', status: 'เปิดเคส', category: 'แจ้งซ่อม', priority: 'ปกติ', assignee: '' };
  axios.get.mockImplementation(url => Promise.resolve({ data:
    url.endsWith('/case-support-options') ? options : url.endsWith('/case-support') ? [record] : [] }));
  axios.put.mockResolvedValue({ data: record });
  render(<CaseSupport />);
  fireEvent.click(await screen.findByText('แก้ไข'));
  expect(screen.getByLabelText('หัวข้อเคส')).toHaveValue('หัวข้อเดิม');
  expect(screen.getByLabelText('ประเภท')).toHaveValue('ประเภทเดิม');
  fireEvent.click(screen.getByText('บันทึกการแก้ไข'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/case-support/c1'),
    expect.objectContaining({ subject: 'หัวข้อเดิม', type: 'ประเภทเดิม' })));
});
