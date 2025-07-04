"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'featured';
}

export function ServiceCard({ service, variant = 'default' }: ServiceCardProps) {
  const {
    slug,
    name,
    short_description,
    display_price,
    icon,
    image_url,
    features,
    category,
    complexity_level,
    estimated_duration,
    tags
  } = service;

  // Icône par défaut si aucune n'est spécifiée
  const iconSrc = icon 
    ? `/icons/${icon}.svg` 
    : '/icons/computer.svg';
  
  // Image par défaut si aucune n'est spécifiée
  const imageSrc = image_url || '/images/service-default.jpg';

  // Couleur de la catégorie
  const categoryColor = category?.color || '#1e88e5';
  
  // Indicateur de complexité
  const complexityMap = {
    'faible': { label: 'Simple', color: 'bg-green-100 text-green-800' },
    'moyen': { label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    'élevé': { label: 'Complexe', color: 'bg-red-100 text-red-800' }
  };
  
  const complexityInfo = complexity_level 
    ? complexityMap[complexity_level] 
    : { label: '', color: '' };

  return (
    <Card className={`h-full flex flex-col transition-all duration-200 hover:shadow-md ${
      variant === 'featured' ? 'border-primary/20' : ''
    }`}>
      <CardHeader className="pb-4">
        {variant === 'featured' && (
          <div className="absolute -top-1 -right-1">
            <Badge className="bg-primary text-white">Recommandé</Badge>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${categoryColor}20` }}>
            <Image 
              src={iconSrc} 
              alt={name} 
              width={24} 
              height={24}
              className="text-primary"
            />
          </div>
          {category && (
            <Badge variant="outline" className="text-xs" style={{ color: categoryColor, borderColor: `${categoryColor}50` }}>
              {category.name}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{short_description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow pb-4">
        {features && features.length > 0 && (
          <div className="mt-2">
            <ul className="text-sm space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary text-lg">•</span>
                  <span>{feature}</span>
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-sm text-muted-foreground">+ {features.length - 3} autres avantages</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {complexity_level && (
            <span className={`text-xs px-2 py-1 rounded-full ${complexityInfo.color}`}>
              {complexityInfo.label}
            </span>
          )}
          
          {estimated_duration && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {estimated_duration}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="font-semibold">
          {display_price}
        </div>
        <Link href={`/services/${slug}`}>
          <Button variant="outline">Voir détails</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 