"use client"

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <span className="sr-only">SiteAris</span>
              <Image 
                className="h-10 w-auto invert" 
                src="/logo.svg" 
                alt="SiteAris" 
                width={140} 
                height={40} 
              />
            </Link>
            <p className="text-gray-400 text-sm">
              Solutions informatiques et cybersécurité pour les entreprises de toutes tailles.
              Expertise reconnue, tarifs transparents, satisfaction garantie.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.029 10.029 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.902 4.902 0 01-2.228-.616v.061a4.925 4.925 0 003.946 4.827 4.945 4.945 0 01-2.212.085 4.935 4.935 0 004.604 3.417 9.866 9.866 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.736-.9 10.126-5.864 10.126-11.854z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/audit-securite" className="text-gray-300 hover:text-white">
                  Audit de sécurité
                </Link>
              </li>
              <li>
                <Link href="/services/securisation-reseau" className="text-gray-300 hover:text-white">
                  Sécurisation réseau
                </Link>
              </li>
              <li>
                <Link href="/services/maintenance-informatique" className="text-gray-300 hover:text-white">
                  Maintenance informatique
                </Link>
              </li>
              <li>
                <Link href="/services/conformite-rgpd" className="text-gray-300 hover:text-white">
                  Conformité RGPD
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white">
                  Tous nos services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              À propos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/a-propos" className="text-gray-300 hover:text-white">
                  Notre entreprise
                </Link>
              </li>
              <li>
                <Link href="/a-propos/equipe" className="text-gray-300 hover:text-white">
                  Notre équipe
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/recrutement" className="text-gray-300 hover:text-white">
                  Recrutement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Nous contacter
            </h3>
            <address className="not-italic text-gray-300">
              <p className="mb-3">
                123 Rue de la Cybersécurité
                <br />
                75000 Paris, France
              </p>
              <p className="mb-3">
                <a href="tel:+33123456789" className="text-primary-400 hover:text-primary-300">
                  +33 1 23 45 67 89
                </a>
              </p>
              <p>
                <a href="mailto:contact@sitearis.fr" className="text-primary-400 hover:text-primary-300">
                  contact@sitearis.fr
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row md:justify-between text-gray-400 text-sm">
            <p>&copy; 2023 SiteAris. Tous droits réservés.</p>
            <nav className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link>
              <Link href="/cgv" className="hover:text-white">CGV</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
} 