import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
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
    title: 'Templates',
    href: '/templates',
    icon: FileText,
    description: 'Dental form templates',
  },
  {
    title: 'Intake Forms',
    href: '/intake-forms',
    icon: ClipboardList,
    description: 'New patient submissions',
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
    description: 'Payment tracking',
    badge: 'Soon',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Monthly reports',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account settings',
  },
]
