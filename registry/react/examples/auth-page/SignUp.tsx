'use client'
import { KeyRound } from 'lucide-react'
import { AuthPage } from '@/react/components/pages/AuthPage'
// The sign-up page as the site sets it, with Acme's copy, a neutral mark in the provider button and Acme placeholder marks.

export default function SignUp() {
  return <AuthPage mode="sign-up" providerIcon={<KeyRound size={20} strokeWidth={1.5} aria-hidden="true" />} onProvider={() => {}} onEmail={() => {}} />
}
