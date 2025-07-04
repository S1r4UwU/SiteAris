import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ServiceForm from '@/components/admin/service-form';

export default async function CreateServicePage() {
  const supabase = createServerComponentClient({ cookies });
  
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
  
  // Données initiales pour un nouveau service
  const initialData = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: 0,
    display_price: '',
    category_id: null,
    estimated_duration: 60,
    complexity_level: 'MEDIUM',
    is_featured: false,
    is_published: false,
    features: [],
    icon: '',
    categoryId: null,
    tags: [],
    options: [],
    media: []
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
        <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau service</h1>
      </div>
      
      <ServiceForm 
        initialData={initialData}
        categories={categories || []}
        allTags={tags || []}
        mode="create"
      />
    </div>
  );
} 