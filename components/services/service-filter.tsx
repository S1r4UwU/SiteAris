"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ServiceCategory, ServiceTag, ServiceFilters } from '@/types/services';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ServiceFilterProps {
  categories: ServiceCategory[];
  tags: ServiceTag[];
  initialFilters?: ServiceFilters;
  onFilterChange?: (filters: ServiceFilters) => void;
}

export function ServiceFilter({
  categories,
  tags,
  initialFilters,
  onFilterChange
}: ServiceFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // État local pour les filtres
  const [filters, setFilters] = useState<ServiceFilters>({
    category: initialFilters?.category || '',
    minPrice: initialFilters?.minPrice || 0,
    maxPrice: initialFilters?.maxPrice || 20000,
    complexity: initialFilters?.complexity || [],
    tags: initialFilters?.tags || [],
    search: initialFilters?.search || '',
    sort: initialFilters?.sort || 'name_asc',
    page: 1, // Toujours réinitialiser à la page 1 lors du changement de filtres
    limit: initialFilters?.limit || 9
  });

  // Effet pour synchroniser les filtres avec l'URL
  useEffect(() => {
    // Construire les paramètres d'URL à partir des filtres
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice !== undefined && filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined && filters.maxPrice < 20000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.complexity && filters.complexity.length > 0) params.set('complexity', filters.complexity.join(','));
    if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 9) params.set('limit', filters.limit.toString());
    
    // Mettre à jour l'URL sans rafraîchir la page
    const url = `/services${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url, { scroll: false });
    
    // Notifier le parent du changement de filtres
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, router, onFilterChange]);

  // Gestionnaires d'événements pour les changements de filtres
  const handleCategoryChange = (categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === categorySlug ? '' : categorySlug,
      page: 1
    }));
  };

  const handleComplexityChange = (value: 'faible' | 'moyen' | 'élevé') => {
    setFilters(prev => {
      const newComplexity = prev.complexity?.includes(value)
        ? prev.complexity.filter(c => c !== value)
        : [...(prev.complexity || []), value];
      
      return {
        ...prev,
        complexity: newComplexity,
        page: 1
      };
    });
  };

  const handleTagChange = (tagName: string) => {
    setFilters(prev => {
      const newTags = prev.tags?.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...(prev.tags || []), tagName];
      
      return {
        ...prev,
        tags: newTags,
        page: 1
      };
    });
  };

  const handlePriceChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
      page: 1
    }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      sort: value as 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc',
      page: 1
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 20000,
      complexity: [],
      tags: [],
      search: '',
      sort: 'name_asc',
      page: 1,
      limit: filters.limit
    });
  };

  return (
    <div className="space-y-6">
      {/* Recherche */}
      <div className="space-y-2">
        <Label htmlFor="search">Recherche</Label>
        <Input
          id="search"
          type="text"
          placeholder="Rechercher un service..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Tri */}
      <div className="space-y-2">
        <Label htmlFor="sort">Trier par</Label>
        <select
          id="sort"
          className="w-full p-2 border rounded-md"
          value={filters.sort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="name_asc">Nom (A-Z)</option>
          <option value="name_desc">Nom (Z-A)</option>
          <option value="price_asc">Prix (croissant)</option>
          <option value="price_desc">Prix (décroissant)</option>
        </select>
      </div>

      <Accordion type="multiple" className="w-full">
        {/* Catégories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">Catégories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={filters.category === category.slug}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Prix */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Prix</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <span>{filters.minPrice}€</span>
                <span>{filters.maxPrice}€</span>
              </div>
              <Slider
                defaultValue={[filters.minPrice || 0, filters.maxPrice || 20000]}
                min={0}
                max={20000}
                step={100}
                onValueChange={handlePriceChange}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Complexité */}
        <AccordionItem value="complexity">
          <AccordionTrigger className="text-base font-medium">Niveau de complexité</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {['faible', 'moyen', 'élevé'].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`complexity-${level}`}
                    checked={filters.complexity?.includes(level as 'faible' | 'moyen' | 'élevé')}
                    onCheckedChange={() => handleComplexityChange(level as 'faible' | 'moyen' | 'élevé')}
                  />
                  <Label
                    htmlFor={`complexity-${level}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {level === 'faible' ? 'Simple' : level === 'moyen' ? 'Intermédiaire' : 'Complexe'}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags */}
        <AccordionItem value="tags">
          <AccordionTrigger className="text-base font-medium">Tags</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.name}`}
                    checked={filters.tags?.includes(tag.name)}
                    onCheckedChange={() => handleTagChange(tag.name)}
                  />
                  <Label
                    htmlFor={`tag-${tag.name}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Bouton de réinitialisation */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleReset}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
} 