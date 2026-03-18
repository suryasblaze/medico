import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  BarChart3,
  ClipboardList,
  FileText,
} from 'lucide-react'

export const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    description: 'Manage patient records',
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    description: 'Schedule appointments',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: Wallet,
    description: 'Track clinic expenses',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Monthly reports',
  },
  {
    title: 'Intake Forms',
    href: '/intake-forms',
    icon: ClipboardList,
    description: 'New patient submissions',
  },
  {
    title: 'Prescriptions',
    href: '/prescriptions',
    icon: FileText,
    description: 'Write and manage prescriptions',
  },
]
