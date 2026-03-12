import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white',
        secondary:
          'border-transparent bg-fuchsia-100 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-300',
        destructive:
          'border-transparent bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400',
        outline: 'border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-700 dark:text-fuchsia-300',
        success:
          'border-transparent bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400',
        warning:
          'border-transparent bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
