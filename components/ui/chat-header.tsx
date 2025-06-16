'use client'

import Link from 'next/link'
import { Phone, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function ChatHeader() {
  const pathname = usePathname()
  const isCallPage = pathname === '/call'
  const isMessagePage = pathname === '/message'

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h2 className="text-lg font-semibold">Friend AI</h2>
          </Link>
          {isCallPage && (
            <span className="text-sm text-muted-foreground">
              Voice Call Feature
            </span>
          )}
          {isMessagePage && (
            <span className="text-sm text-muted-foreground">
              Chat with AI
            </span>
          )}
        </div>
        {isMessagePage ? (
          <Link
            href="/call"
            className="flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
          >
            <Phone className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            href="/message"
            className="flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  )
} 