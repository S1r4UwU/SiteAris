import { z } from 'zod';

// Schéma pour l'adresse
export const addressSchema = z.object({
  street: z.string().min(3, "L'adresse doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  postal_code: z.string().regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres"),
  country: z.string().default("France"),
});

// Schéma pour les informations client - Étape 1
export const customerInfoSchema = z.object({
  client_type: z.enum(["individual", "company"]),
  client_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  client_email: z.string().email("L'email n'est pas valide"),
  client_phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Le numéro de téléphone n'est pas valide")
    .optional(),
  client_company: z.string().optional(),
  siret: z.string()
    .regex(/^\d{14}$/, "Le numéro SIRET doit contenir 14 chiffres")
    .optional(),
  tva_number: z.string()
    .regex(/^FR\d{11}$/, "Le numéro de TVA doit être au format FR suivi de 11 chiffres")
    .optional(),
}).refine((data) => {
  // Si c'est une entreprise, le nom de l'entreprise est obligatoire
  if (data.client_type === "company") {
    return !!data.client_company;
  }
  return true;
}, {
  message: "Le nom de l'entreprise est obligatoire pour les professionnels",
  path: ["client_company"],
});

// Schéma pour les adresses - Étape 2
export const addressesSchema = z.object({
  billing_address: addressSchema,
  use_same_address: z.boolean().default(true),
  intervention_address: addressSchema.optional(),
  intervention_type: z.enum(["on_site", "remote", "mixed"]),
  intervention_notes: z.string().optional(),
}).refine((data) => {
  // Si les adresses sont différentes, l'adresse d'intervention est obligatoire
  if (!data.use_same_address) {
    return !!data.intervention_address;
  }
  return true;
}, {
  message: "L'adresse d'intervention est obligatoire si elle diffère de l'adresse de facturation",
  path: ["intervention_address"],
});

// Schéma pour la planification - Étape 3
export const schedulingSchema = z.object({
  desired_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD"),
  desired_time_slot: z.enum(["morning", "afternoon", "all_day", "flexible"]),
  urgency_level: z.enum(["normal", "high", "critical"]).default("normal"),
  additional_notes: z.string().optional(),
});

// Schéma pour la confirmation - Étape 4
export const confirmationSchema = z.object({
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales de vente",
  }),
  privacy_accepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter la politique de confidentialité",
  }),
  marketing_opt_in: z.boolean().default(false),
});

// Schéma complet du formulaire
export const checkoutFormSchema = z.object({
  customer_info: customerInfoSchema,
  addresses: addressesSchema,
  scheduling: schedulingSchema,
  confirmation: confirmationSchema,
});

// Types dérivés des schémas
export type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;
export type AddressesFormValues = z.infer<typeof addressesSchema>;
export type SchedulingFormValues = z.infer<typeof schedulingSchema>;
export type ConfirmationFormValues = z.infer<typeof confirmationSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>; 