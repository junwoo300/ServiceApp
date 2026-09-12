import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { api } from './apiClient';
jest.mock('./apiClient', () => ({ api: { post: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

test('logs in only after the server accepts the password', async () => {
  const onLogin = jest.fn();
  let accept;
  api.post.mockReturnValue(new Promise(resolve => { accept = resolve; }));
  render(<LoginPage onLogin={onLogin} />);
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'example-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
  expect(api.post).toHaveBeenCalledWith('/auth/login', { password: 'example-password' });
  expect(onLogin).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeDisabled();
  accept({ data: { authenticated: true } });
  await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
});

test('displays a rejected password and allows retry without entering the app', async () => {
  api.post.mockRejectedValue({ response: { data: { message: 'รหัสผ่านไม่ถูกต้อง' } } });
  const onLogin = jest.fn();
  render(<LoginPage onLogin={onLogin} />);
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('รหัสผ่านไม่ถูกต้อง');
  expect(onLogin).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeEnabled();
});
