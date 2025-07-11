import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos de SiteAris | Services informatiques et cybersécurité",
  description: "Découvrez SiteAris, notre expertise en cybersécurité et services informatiques, notre histoire et nos valeurs.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">À propos de SiteAris</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            SiteAris est une entreprise spécialisée dans les services informatiques et la cybersécurité, 
            dédiée à la protection et l'optimisation des infrastructures numériques des entreprises.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Notre mission</h2>
          <p>
            Nous nous engageons à fournir des solutions informatiques et de cybersécurité de haute qualité, 
            adaptées aux besoins spécifiques de chaque entreprise. Notre objectif est de permettre à nos clients 
            de se concentrer sur leur cœur de métier en toute sérénité, sachant que leur infrastructure numérique 
            est sécurisée et optimisée.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Notre expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Cybersécurité</h3>
              <p>
                Audits de sécurité, tests d'intrusion, mise en conformité RGPD, 
                formation et sensibilisation des équipes, gestion des incidents.
              </p>
            </div>
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Infrastructure</h3>
              <p>
                Conception et déploiement de réseaux, migration cloud, 
                virtualisation, sauvegarde et restauration de données.
              </p>
            </div>
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Support</h3>
              <p>
                Assistance technique 24/7, maintenance préventive et corrective, 
                gestion de parc informatique, helpdesk dédié.
              </p>
            </div>
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Conseil</h3>
              <p>
                Stratégie IT, transformation numérique, optimisation des coûts, 
                gestion des risques, continuité d'activité.
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Nos valeurs</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Excellence</strong> - Nous visons l'excellence dans tous nos services</li>
            <li><strong>Intégrité</strong> - Nous agissons avec honnêteté et transparence</li>
            <li><strong>Innovation</strong> - Nous restons à la pointe des technologies</li>
            <li><strong>Proximité</strong> - Nous construisons des relations durables avec nos clients</li>
            <li><strong>Réactivité</strong> - Nous répondons rapidement aux besoins de nos clients</li>
          </ul>
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à sécuriser votre entreprise ?</h2>
          <p className="mb-6">Contactez-nous pour discuter de vos besoins spécifiques</p>
          <Link href="/contact">
            <Button size="lg">Nous contacter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 