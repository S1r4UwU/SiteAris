import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ServiceForm from '@/components/admin/service-form';

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = params;
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer les détails du service
  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*),
      service_options(*),
      service_tags(tags(*))
    `)
    .eq('id', id)
    .single();
  
  // Récupérer toutes les catégories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('name');
  
  // Récupérer tous les tags
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  // Récupérer les médias du service
  const { data: media } = await supabase
    .from('service_media')
    .select('*')
    .eq('service_id', id)
    .order('display_order');
  
  // Rediriger vers 404 si le service n'existe pas
  if (error || !service) {
    notFound();
  }
  
  // Formater les données pour le formulaire
  const initialData = {
    ...service,
    categoryId: service.category_id,
    tags: service.service_tags?.map(tag => tag.tags.id) || [],
    options: service.service_options || [],
    media: media || []
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux services
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le service</h1>
      </div>
      
      <ServiceForm 
        initialData={initialData}
        categories={categories || []}
        allTags={tags || []}
        mode="edit"
      />
    </div>
  );
} 