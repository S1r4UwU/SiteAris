"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@/lib/supabase/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

// Définir le schéma de validation avec Zod
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  passwordConfirm: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm'],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register' | 'forgotPassword'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClientComponentClient<Database>()
  
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = 
    useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: '',
        password: ''
      }
    })
    
  const { register: registerSignup, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = 
    useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        name: '',
        email: '',
        password: '',
        passwordConfirm: ''
      }
    })
    
  const { register: registerForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors } } = 
    useForm<ForgotPasswordValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
        email: ''
      }
    })
  
  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) throw error
      
      setMessage('Connexion réussie. Redirection...')
      
      // Synchroniser le panier
      try {
        // Importer dynamiquement pour éviter les problèmes de dépendance circulaire
        const { useCartStore } = await import('@/lib/store/cart-store')
        const { syncWithUser } = useCartStore.getState()
        // Synchroniser le panier avec l'utilisateur
        await syncWithUser()
      } catch (err) {
        console.error("Erreur lors de la synchronisation du panier:", err)
      }
      
      // Rediriger après un court délai
      setTimeout(() => {
        // Rediriger vers la page d'origine ou la page d'accueil
        router.push('/client/compte')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRegister = async (data: RegisterFormValues) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      })
      
      if (error) throw error
      
      setMessage('Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.')
      
      // Passer en mode connexion après un délai
      setTimeout(() => {
        setMode('login')
        setMessage(null)
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }
  
  const handleForgotPassword = async (data: ForgotPasswordValues) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setMessage('Un lien de réinitialisation a été envoyé à votre adresse email.')
      
      // Passer en mode connexion après un délai
      setTimeout(() => {
        setMode('login')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du lien de réinitialisation')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'login' 
            ? 'Connexion' 
            : mode === 'register' 
              ? 'Inscription' 
              : 'Réinitialisation du mot de passe'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Connectez-vous à votre compte pour accéder à vos services' 
            : mode === 'register'
              ? 'Créez un compte pour commencer à utiliser nos services'
              : 'Entrez votre email pour recevoir un lien de réinitialisation'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md mb-4">
            {message}
          </div>
        )}
        
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit(handleLogin)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...registerLogin('email')}
                  error={loginErrors.email?.message}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs" 
                    type="button"
                    onClick={() => {
                      setMode('forgotPassword')
                      setError(null)
                      setMessage(null)
                    }}
                  >
                    Mot de passe oublié?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...registerLogin('password')}
                  error={loginErrors.password?.message}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>
        ) : mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit(handleRegister)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Prénom Nom"
                  {...registerSignup('name')}
                  error={registerErrors.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="votre@email.com"
                  {...registerSignup('email')}
                  error={registerErrors.email?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  {...registerSignup('password')}
                  error={registerErrors.password?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmer le mot de passe</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  {...registerSignup('passwordConfirm')}
                  error={registerErrors.passwordConfirm?.message}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'S\'inscrire'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit(handleForgotPassword)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="votre@email.com"
                  {...registerForgot('email')}
                  error={forgotErrors.email?.message}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi du lien...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {mode === 'login' ? (
          <p className="text-sm text-muted-foreground">
            Pas encore de compte?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              type="button" 
              onClick={() => {
                setMode('register')
                setError(null)
                setMessage(null)
              }}
            >
              S'inscrire
            </Button>
          </p>
        ) : mode === 'register' ? (
          <p className="text-sm text-muted-foreground">
            Déjà un compte?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              type="button" 
              onClick={() => {
                setMode('login')
                setError(null)
                setMessage(null)
              }}
            >
              Se connecter
            </Button>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Retour à la{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              type="button" 
              onClick={() => {
                setMode('login')
                setError(null)
                setMessage(null)
              }}
            >
              connexion
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

// Composant Label pour la cohérence de l'interface
function Label({ htmlFor, children, className = "" }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
      {children}
    </label>
  );
} 