"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Plus, Save, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { slugify } from '@/lib/utils';

// Définition du schéma de validation
const serviceSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  slug: z.string().min(3, { message: 'Le slug doit contenir au moins 3 caractères' }),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères' }),
  short_description: z.string().min(10, { message: 'La description courte doit contenir au moins 10 caractères' }),
  base_price: z.coerce.number().min(0, { message: 'Le prix doit être positif' }),
  display_price: z.string().optional(),
  categoryId: z.number().nullable(),
  estimated_duration: z.coerce.number().min(1, { message: 'La durée estimée doit être d\'au moins 1 minute' }),
  complexity_level: z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX', 'EXPERT']),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  features: z.array(z.string()),
  icon: z.string().optional(),
  tags: z.array(z.number()),
  options: z.array(z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: 'Le nom de l\'option est requis' }),
    description: z.string().optional(),
    price_modifier: z.coerce.number(),
    is_required: z.boolean().default(false)
  }))
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData: any;
  categories: any[];
  allTags: any[];
  mode: 'create' | 'edit';
}

export default function ServiceForm({ initialData, categories, allTags, mode }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Initialisation du formulaire avec React Hook Form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      short_description: initialData.short_description || '',
      base_price: initialData.base_price || 0,
      display_price: initialData.display_price || '',
      categoryId: initialData.categoryId || null,
      estimated_duration: initialData.estimated_duration || 60,
      complexity_level: initialData.complexity_level || 'MEDIUM',
      is_featured: initialData.is_featured || false,
      is_published: initialData.is_published || false,
      features: initialData.features || [],
      icon: initialData.icon || '',
      tags: initialData.tags || [],
      options: initialData.options || []
    }
  });
  
  // Configuration du tableau de champs pour les fonctionnalités
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: 'features'
  });
  
  // Configuration du tableau de champs pour les options
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: 'options'
  });
  
  // Fonction pour générer automatiquement le slug à partir du nom
  const generateSlug = () => {
    const name = form.getValues('name');
    if (name) {
      form.setValue('slug', slugify(name));
    }
  };
  
  // Fonction de soumission du formulaire
  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    
    try {
      let serviceId;
      
      // Création ou mise à jour du service
      if (mode === 'edit' && initialData.id) {
        // Mise à jour d'un service existant
        const { data: updatedService, error } = await supabase
          .from('services')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            short_description: data.short_description,
            base_price: data.base_price,
            display_price: data.display_price,
            category_id: data.categoryId,
            estimated_duration: data.estimated_duration,
            complexity_level: data.complexity_level,
            is_featured: data.is_featured,
            is_published: data.is_published,
            features: data.features,
            icon: data.icon
          })
          .eq('id', initialData.id)
          .select()
          .single();
          
        if (error) throw error;
        serviceId = initialData.id;
        
        // Supprimer les anciennes options pour les recréer
        await supabase
          .from('service_options')
          .delete()
          .eq('service_id', serviceId);
          
        // Supprimer les anciennes relations de tags
        await supabase
          .from('service_tags')
          .delete()
          .eq('service_id', serviceId);
          
      } else {
        // Création d'un nouveau service
        const { data: newService, error } = await supabase
          .from('services')
          .insert({
            name: data.name,
            slug: data.slug,
            description: data.description,
            short_description: data.short_description,
            base_price: data.base_price,
            display_price: data.display_price,
            category_id: data.categoryId,
            estimated_duration: data.estimated_duration,
            complexity_level: data.complexity_level,
            is_featured: data.is_featured,
            is_published: data.is_published,
            features: data.features,
            icon: data.icon
          })
          .select()
          .single();
          
        if (error) throw error;
        serviceId = newService.id;
      }
      
      // Ajouter les options du service
      if (data.options.length > 0) {
        const optionsToInsert = data.options.map(option => ({
          service_id: serviceId,
          name: option.name,
          description: option.description || '',
          price_modifier: option.price_modifier,
          is_required: option.is_required
        }));
        
        const { error: optionsError } = await supabase
          .from('service_options')
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      // Ajouter les tags du service
      if (data.tags.length > 0) {
        const tagsToInsert = data.tags.map(tagId => ({
          service_id: serviceId,
          tag_id: tagId
        }));
        
        const { error: tagsError } = await supabase
          .from('service_tags')
          .insert(tagsToInsert);
          
        if (tagsError) throw tagsError;
      }
      
      toast({
        title: mode === 'edit' ? 'Service mis à jour' : 'Service créé',
        description: `Le service "${data.name}" a été ${mode === 'edit' ? 'mis à jour' : 'créé'} avec succès.`,
      });
      
      router.push('/admin/services');
      router.refresh();
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du service:', error);
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="media">Médias</TabsTrigger>
              </TabsList>
              
              {/* Onglet Informations générales */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du service</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-2">
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Identifiant unique pour l'URL
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-8"
                          onClick={generateSlug}
                        >
                          Générer
                        </Button>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="complexity_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau de complexité</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SIMPLE">Simple</SelectItem>
                                <SelectItem value="MEDIUM">Intermédiaire</SelectItem>
                                <SelectItem value="COMPLEX">Complexe</SelectItem>
                                <SelectItem value="EXPERT">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="base_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix de base (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="display_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix affiché (optionnel)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ex: À partir de 99€" />
                            </FormControl>
                            <FormDescription>
                              Format personnalisé pour l'affichage du prix
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="estimated_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée estimée (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icône</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ex: security.svg" />
                            </FormControl>
                            <FormDescription>
                              Nom du fichier SVG dans /public/icons/
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description courte</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Brève description du service (100-150 caractères)"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description complète</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Description détaillée du service"
                              className="resize-none"
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="is_published"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Publié</FormLabel>
                              <FormDescription>
                                Rendre ce service visible sur le site
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="is_featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mis en avant</FormLabel>
                              <FormDescription>
                                Mettre ce service en avant sur la page d'accueil
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet Détails */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Fonctionnalités et Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Fonctionnalités</h3>
                      <div className="space-y-2">
                        {featureFields.map((field, index) => (
                          <div key={field.id} className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name={`features.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Fonctionnalité" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeFeature(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendFeature('')}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une fonctionnalité
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Tags</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="tags"
                          render={() => (
                            <FormItem>
                              {allTags.map((tag) => (
                                <FormField
                                  key={tag.id}
                                  control={form.control}
                                  name="tags"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={tag.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(tag.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, tag.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== tag.id
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {tag.name}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet Options */}
              <TabsContent value="options">
                <Card>
                  <CardHeader>
                    <CardTitle>Options du service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {optionFields.map((field, index) => (
                        <Card key={field.id} className="border-dashed">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Option {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`options.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`options.${index}.price_modifier`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Modificateur de prix (€)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Montant ajouté ou soustrait du prix de base
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name={`options.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`options.${index}.is_required`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Option requise
                                    </FormLabel>
                                    <FormDescription>
                                      Le client doit sélectionner cette option
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => 
                          appendOption({
                            name: '',
                            description: '',
                            price_modifier: 0,
                            is_required: false
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une option
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet Médias */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Images et médias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-4">
                        La gestion des médias sera implémentée dans une prochaine version
                      </p>
                      <Button type="button" variant="outline" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger des images
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-4 sticky bottom-0 bg-background py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/services')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'edit' ? 'Mettre à jour' : 'Créer le service'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 