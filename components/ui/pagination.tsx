"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}: PaginationProps) {
  // Ne rien afficher s'il n'y a qu'une seule page
  if (totalPages <= 1) return null;

  // Fonction pour générer la plage de pages à afficher
  const generatePagination = () => {
    // Toujours afficher la première page
    const firstPage = 1;
    // Toujours afficher la dernière page
    const lastPage = totalPages;
    
    // Calculer la plage de pages autour de la page courante
    const startPage = Math.max(firstPage, currentPage - siblingCount);
    const endPage = Math.min(lastPage, currentPage + siblingCount);
    
    // Tableau pour stocker les pages à afficher
    const pages: (number | 'ellipsis')[] = [];
    
    // Ajouter la première page
    if (startPage > firstPage) {
      pages.push(firstPage);
      // Ajouter une ellipse si nécessaire
      if (startPage > firstPage + 1) {
        pages.push('ellipsis');
      }
    }
    
    // Ajouter les pages de la plage
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Ajouter la dernière page
    if (endPage < lastPage) {
      // Ajouter une ellipse si nécessaire
      if (endPage < lastPage - 1) {
        pages.push('ellipsis');
      }
      pages.push(lastPage);
    }
    
    return pages;
  };
  
  // Générer la pagination
  const pages = generatePagination();

  return (
    <nav className="flex items-center justify-center space-x-2">
      {/* Bouton précédent */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Pages */}
      {pages.map((page, index) => {
        // Ellipse
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        
        // Page numérotée
        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        );
      })}
      
      {/* Bouton suivant */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
} 