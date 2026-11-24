'use client'
import { KeyRound } from 'lucide-react'
import { AuthPage } from '@/react/components/pages/AuthPage'
// The sign-in page: the same page in its other mode.

export default function SignIn() {
  return <AuthPage mode="sign-in" providerIcon={<KeyRound size={20} strokeWidth={1.5} aria-hidden="true" />} onProvider={() => {}} onEmail={() => {}} />
}
