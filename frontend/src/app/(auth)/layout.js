import { redirect } from 'next/navigation';

// Auth layout just renders children — no shell needed
export default function AuthLayout({ children }) {
  return <>{children}</>;
}
