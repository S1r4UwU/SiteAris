"use client";

import { useState, useEffect } from 'react';
import { ServiceCard } from '@/components/services/service-card';
import { ServiceFilter } from '@/components/services/service-filter';
import { Pagination } from '@/components/ui/pagination';
import { Service, ServiceCategory, ServiceTag, ServiceFilters, PaginatedResponse } from '@/types/services';
import { serviceClient } from '@/lib/supabase/services';

interface ServiceCatalogProps {
  initialServices: PaginatedResponse<Service>;
  categories: ServiceCategory[];
  tags: ServiceTag[];
  initialFilters: ServiceFilters;
}

export function ServiceCatalog({
  initialServices,
  categories,
  tags,
  initialFilters
}: ServiceCatalogProps) {
  // État local pour les services et filtres
  const [services, setServices] = useState<PaginatedResponse<Service>>(initialServices);
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters);
  const [loading, setLoading] = useState(false);

  // Effet pour charger les services lorsque les filtres changent
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await serviceClient.getServices(filters);
        setServices(data);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setLoading(false);
      }
    };

    // Ne pas recharger si c'est le chargement initial
    if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      fetchServices();
    }
  }, [filters, initialFilters]);

  // Gestionnaire pour le changement de page
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    
    // Scroll vers le haut de la liste
    window.scrollTo({
      top: document.getElementById('services-list')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Gestionnaire pour le changement de filtres
  const handleFilterChange = (newFilters: ServiceFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar avec filtres */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <ServiceFilter
            categories={categories}
            tags={tags}
            initialFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Liste des services */}
      <div className="lg:col-span-3" id="services-list">
        {/* En-tête avec nombre de résultats */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {services.meta.total} service{services.meta.total > 1 ? 's' : ''} trouvé{services.meta.total > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Grille de services */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : services.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.data.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                variant={service.is_featured ? 'featured' : 'default'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Aucun service trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
            </p>
          </div>
        )}

        {/* Pagination */}
        {services.meta.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={services.meta.page}
              totalPages={services.meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 