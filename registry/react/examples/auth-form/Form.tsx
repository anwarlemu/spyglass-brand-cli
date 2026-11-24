'use client'
import { KeyRound } from 'lucide-react'
import { AuthForm } from '@/react/components/site/AuthForm'
// The form alone, for a page of your own: sign up with a neutral mark in the provider button.

export default function Form() {
  return <AuthForm mode="sign-up" providerIcon={<KeyRound size={20} strokeWidth={1.5} aria-hidden="true" />} onProvider={() => {}} onEmail={() => {}} />
}
