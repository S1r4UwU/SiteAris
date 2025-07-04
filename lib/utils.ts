import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine plusieurs classes CSS avec clsx et les fusionne avec tailwind-merge
 * @param inputs Les classes CSS à combiner
 * @returns Une chaîne de caractères contenant les classes CSS combinées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un prix en euros
 * @param price Le prix à formater
 * @returns Une chaîne de caractères contenant le prix formaté
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price)
}

/**
 * Génère un ID unique
 * @returns Une chaîne de caractères contenant l'ID généré
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Tronque un texte s'il dépasse une certaine longueur
 * @param text Le texte à tronquer
 * @param maxLength La longueur maximale du texte
 * @returns Le texte tronqué
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Vérifie si une URL est valide
 * @param url L'URL à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Attendre un certain temps
 * @param ms Le temps à attendre en millisecondes
 * @returns Une promesse qui se résout après le temps spécifié
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Générer un numéro de commande unique avec préfixe SA + année + mois + numéro séquentiel
 * @returns Une chaîne de caractères contenant le numéro de commande généré
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 2 derniers chiffres de l'année
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois sur 2 chiffres
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 chiffres aléatoires
  const timestamp = now.getTime().toString().slice(-3); // 3 derniers chiffres du timestamp
  
  return `SA${year}${month}-${randomPart}${timestamp}`;
}

/**
 * Calculer une date future en jours ouvrables
 * @param date La date de départ
 * @param days Le nombre de jours à ajouter
 * @returns La date résultante
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Vérifier si c'est un jour ouvrable (lundi-vendredi)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

/**
 * Formater une date en format français
 * @param date La date à formater
 * @returns Une chaîne de caractères contenant la date formatée
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Vérifier si une chaîne est un email valide
 * @param email L'email à vérifier
 * @returns true si l'email est valide, false sinon
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Convertit une chaîne de caractères en slug URL-friendly
 * @param str La chaîne à convertir en slug
 * @returns Une chaîne de caractères contenant le slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Supprime les caractères spéciaux sauf les tirets et underscores
    .replace(/[\s_-]+/g, '-') // Remplace les espaces, tirets bas et tirets par un seul tiret
    .replace(/^-+|-+$/g, ''); // Supprime les tirets au début et à la fin
} 