import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs | SiteAris",
  description: "Découvrez nos tarifs transparents pour nos services informatiques et de cybersécurité.",
};

const pricingPlans = [
  {
    name: "Audit de sécurité",
    description: "Évaluation complète de votre infrastructure",
    price: "À partir de 1 500€",
    features: [
      "Analyse des vulnérabilités",
      "Revue de configuration",
      "Tests d'intrusion",
      "Rapport détaillé",
      "Recommandations personnalisées"
    ],
    popular: false,
    link: "/services/audit-securite"
  },
  {
    name: "Pack Cybersécurité",
    description: "Protection complète pour votre entreprise",
    price: "À partir de 2 500€",
    features: [
      "Audit de sécurité complet",
      "Installation de pare-feu",
      "Configuration d'antivirus",
      "Formation des employés",
      "Support technique 24/7"
    ],
    popular: true,
    link: "/services/pack-cybersecurite"
  },
  {
    name: "Support technique",
    description: "Assistance pour tous vos besoins IT",
    price: "À partir de 500€/mois",
    features: [
      "Support téléphonique illimité",
      "Intervention sur site",
      "Maintenance préventive",
      "Gestion des incidents",
      "Rapport mensuel"
    ],
    popular: false,
    link: "/services/support-technique"
  }
];

export default function TarifsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nos tarifs</h1>
          <p className="text-xl text-muted-foreground">
            Des solutions adaptées à tous les besoins et budgets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.link} className="w-full">
                  <Button 
                    variant={plan.popular ? "default" : "outline"} 
                    className="w-full"
                  >
                    En savoir plus
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-6">Tarification personnalisée</h2>
          <p className="mb-4">
            Nous comprenons que chaque entreprise a des besoins spécifiques. C'est pourquoi nous proposons 
            également des solutions sur mesure adaptées à votre situation particulière.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Pour les petites entreprises</h3>
              <p className="text-muted-foreground mb-4">
                Solutions économiques avec l'essentiel des services de sécurité pour protéger votre activité.
              </p>
              <Link href="/contact">
                <Button variant="outline">Demander un devis</Button>
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Pour les grandes entreprises</h3>
              <p className="text-muted-foreground mb-4">
                Solutions complètes et personnalisées pour répondre aux exigences spécifiques de votre organisation.
              </p>
              <Link href="/contact">
                <Button variant="outline">Contacter un expert</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'informations supplémentaires ?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous aider 
            à choisir la solution la plus adaptée à vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <Button>Nous contacter</Button>
            </Link>
            <Link href="/services">
              <Button variant="outline">Voir tous nos services</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 