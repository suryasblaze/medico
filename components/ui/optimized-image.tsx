'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  onClick?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onClick,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        className={cn(
          'bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-xs">No image</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', fill ? 'h-full w-full' : '')} onClick={onClick}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse',
            className
          )}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
        unoptimized={src.includes('blob:') || src.startsWith('data:')}
      />
    </div>
  )
}

// Avatar variant with circular styling
interface AvatarImageProps {
  src: string | null | undefined
  alt: string
  size?: number
  fallback?: string
  className?: string
  onClick?: () => void
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  fallback,
  className,
  onClick,
}: AvatarImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const initials = fallback || alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (error || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-fuchsia-600 flex items-center justify-center text-white font-medium',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        onClick={onClick}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={cn('relative rounded-full overflow-hidden', className)}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
        unoptimized={src.includes('blob:') || src.startsWith('data:')}
      />
    </div>
  )
}
