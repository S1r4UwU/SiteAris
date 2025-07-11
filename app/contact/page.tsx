import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | SiteAris",
  description: "Contactez l'équipe SiteAris pour discuter de vos besoins en services informatiques et cybersécurité.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Nous sommes à votre disposition pour répondre à toutes vos questions
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nom complet
                      </label>
                      <Input id="name" placeholder="Votre nom" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Téléphone
                      </label>
                      <Input id="phone" type="tel" placeholder="Votre numéro de téléphone" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium">
                        Entreprise
                      </label>
                      <Input id="company" placeholder="Nom de votre entreprise" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Sujet
                    </label>
                    <Input id="subject" placeholder="Objet de votre message" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Décrivez votre besoin ou votre question..." 
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full md:w-auto">
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Nos coordonnées</CardTitle>
                <CardDescription>
                  Plusieurs façons de nous contacter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Téléphone</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="tel:+33123456789" className="hover:text-primary">
                        +33 1 23 45 67 89
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="mailto:contact@sitearis.fr" className="hover:text-primary">
                        contact@sitearis.fr
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Adresse</h3>
                    <p className="text-sm text-muted-foreground">
                      123 Rue de la Cybersécurité<br />
                      75000 Paris<br />
                      France
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Horaires</h3>
                    <p className="text-sm text-muted-foreground">
                      Lundi - Vendredi: 9h00 - 18h00<br />
                      Support technique 24/7 pour les clients
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demande urgente ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Pour toute demande urgente, appelez notre ligne d'assistance prioritaire
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+33123456789">
                      Assistance prioritaire
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 