import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'SiteAris - Services informatiques et cybersécurité',
  description: 'Solutions sur mesure en informatique et cybersécurité pour les entreprises, avec tarifs transparents et expertise reconnue.',
}

// Données des services mis en avant
const featuredServices = [
  {
    id: 1,
    title: 'Audit de Sécurité Complet',
    description: 'Évaluation approfondie de votre infrastructure avec rapport détaillé et recommandations.',
    icon: '/icons/security.svg',
    price: 'À partir de 1200€',
    link: '/services/audit-securite'
  },
  {
    id: 2,
    title: 'Sécurisation Réseau Entreprise',
    description: 'Protection complète de votre réseau avec firewall nouvelle génération et monitoring 24/7.',
    icon: '/icons/network.svg',
    price: 'À partir de 850€',
    link: '/services/securisation-reseau'
  },
  {
    id: 3,
    title: 'Maintenance Informatique Préventive',
    description: 'Contrat de maintenance régulière pour prévenir les pannes et optimiser performances.',
    icon: '/icons/computer.svg',
    price: 'À partir de 350€/mois',
    link: '/services/maintenance-informatique'
  }
]

// Données des témoignages clients
const testimonials = [
  {
    id: 1,
    name: 'Marie Dupont',
    company: 'PME Consulting',
    comment: 'SiteAris a transformé notre approche de la sécurité informatique. Service impeccable et résultats visibles dès le premier mois.',
    rating: 5
  },
  {
    id: 2,
    name: 'Jean Martin',
    company: 'Innov Tech',
    comment: 'Équipe réactive et compétente. Le rapport d\'audit nous a permis d\'identifier des vulnérabilités critiques dont nous ignorions l\'existence.',
    rating: 4
  }
]

export default function HomePage() {
  return (
    <main>
      {/* Bannière principale */}
      <section className="bg-primary-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sécurisez votre Entreprise avec nos Services IT
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Solutions sur mesure, tarifs transparents, expertise reconnue
          </p>
          <Link href="/contact">
            <Button size="lg" variant="accent" className="text-base px-8 py-6">
              Demander un devis gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi choisir SiteAris?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 inline-flex p-4 rounded-full mb-4">
                <Image src="/icons/speed.svg" alt="Réactivité" width={32} height={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Réactivité Garantie</h3>
              <p className="text-gray-600">
                Intervention sous 4h pour les urgences, support technique disponible 24/7.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 inline-flex p-4 rounded-full mb-4">
                <Image src="/icons/certification.svg" alt="Expertise" width={32} height={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertise Certifiée</h3>
              <p className="text-gray-600">
                Équipe de consultants certifiés (CISSP, CEH, OSCP) avec +10 ans d'expérience.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 inline-flex p-4 rounded-full mb-4">
                <Image src="/icons/support.svg" alt="Tarifs" width={32} height={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tarifs Transparents</h3>
              <p className="text-gray-600">
                Devis détaillé, pas de coûts cachés, garantie satisfaction ou remboursement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nos Services Phares
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <Card key={service.id} className="h-full flex flex-col">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Image 
                      src={service.icon} 
                      alt={service.title} 
                      width={64} 
                      height={64}
                      className="text-primary-500" 
                    />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-primary-600 font-semibold">{service.price}</p>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Link href={service.link} className="w-full">
                    <Button variant="outline" fullWidth={true}>
                      En savoir plus
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button variant="secondary" size="lg">
                Voir tous nos services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ce que nos clients disent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? "text-accent-500" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="italic text-gray-600 mb-6">"{testimonial.comment}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-accent-500 text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à sécuriser votre infrastructure?
          </h2>
          <p className="text-xl mb-8">
            Notre équipe d'experts est disponible pour répondre à vos besoins spécifiques
          </p>
          <Link href="/contact">
            <Button variant="default" size="lg" className="bg-white text-accent-600 hover:bg-gray-100">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
} 