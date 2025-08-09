// app/children-dashboard/layout.tsx
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'Children Dashboard - Mintoons',
  description: 'Creative writing dashboard for young storytellers',
};

export default function ChildrenDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
