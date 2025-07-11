import { Metadata } from "next"
import AuthForm from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Authentification | SiteAris",
  description: "Connectez-vous ou créez un compte pour accéder à votre espace client SiteAris",
}

// Ajout d'un paramètre pour récupérer les searchParams
export default function AuthPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Déterminer si on doit afficher le formulaire d'inscription
  const showRegister = searchParams.register === 'true';

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 px-4 sm:px-0">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {showRegister ? "Créez votre compte" : "Bienvenue sur SiteAris"}
          </h1>
          <p className="mt-2 text-gray-600">
            Sécurisez votre entreprise avec nos services d'informatique et de cybersécurité
          </p>
        </div>
        <AuthForm initialMode={showRegister ? 'register' : 'login'} />
      </div>
    </div>
  )
} 