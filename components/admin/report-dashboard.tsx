"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  LineChart, 
  BarChart, 
  FileBarChart,
  Clock,
  Star,
  LayoutDashboard,
  Download,
  Share2,
  FileEdit,
  Trash
} from 'lucide-react';
import { CustomReportBuilder } from './custom-report-builder';

// Types importés
import type { 
  ReportTemplate, 
  SavedReport, 
  ReportResult, 
  Dashboard,
  DashboardWidgetConfig
} from '@/types/reports';

// Import du service reporting
import { reportingClient } from '@/lib/supabase/reporting';

interface ReportDashboardProps {
  initialData?: {
    templates?: ReportTemplate[];
    savedReports?: SavedReport[];
    dashboards?: Dashboard[];
    recentResults?: ReportResult[];
  };
}

export function ReportDashboard({ initialData }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(initialData?.templates || []);
  const [savedReports, setSavedReports] = useState<SavedReport[]>(initialData?.savedReports || []);
  const [dashboards, setDashboards] = useState<Dashboard[]>(initialData?.dashboards || []);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [currentReportResult, setCurrentReportResult] = useState<ReportResult | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      try {
        // Charger les modèles de rapports
        const templates = await reportingClient.getReportTemplates();
        setReportTemplates(templates);

        // Charger les rapports enregistrés
        const reports = await reportingClient.getSavedReports();
        setSavedReports(reports);

        // En production, ajoutez ici le chargement des tableaux de bord
      } catch (error) {
        console.error('Erreur lors du chargement des données de rapports:', error);
      }
    }

    // Si les données initiales ne sont pas fournies, charger les données
    if (!initialData) {
      fetchReportData();
    }
  }, [initialData]);

  const handleSaveTemplate = (template: ReportTemplate) => {
    setReportTemplates([...reportTemplates, template]);
    setIsCreatingReport(false);
  };

  const handleExecuteReport = (result: ReportResult) => {
    setCurrentReportResult(result);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsCreatingReport(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle de rapport ?')) {
      try {
        // En production, implémentez la suppression via l'API
        // await reportingClient.deleteReportTemplate(templateId);
        
        // Mettre à jour la liste locale
        setReportTemplates(reportTemplates.filter(t => t.id !== templateId));
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtenir le type d'icône en fonction du type de graphique
  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'BAR':
        return <BarChart className="h-5 w-5" />;
      case 'LINE':
        return <LineChart className="h-5 w-5" />;
      default:
        return <FileBarChart className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centre de rapports</h2>
          <p className="text-muted-foreground">
            Créez et consultez des rapports personnalisés
          </p>
        </div>
        {!isCreatingReport && (
          <Button onClick={() => setIsCreatingReport(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        )}
      </div>

      {isCreatingReport ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileBarChart className="mr-2 h-5 w-5" />
              {selectedTemplate ? 'Modifier le rapport' : 'Créer un nouveau rapport'}
            </CardTitle>
            <CardDescription>
              {selectedTemplate 
                ? `Modification du rapport "${selectedTemplate.name}"`
                : 'Définissez les paramètres de votre rapport personnalisé'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomReportBuilder 
              initialTemplate={selectedTemplate || undefined}
              onSave={handleSaveTemplate}
              onExecute={handleExecuteReport}
            />
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => {
              setIsCreatingReport(false);
              setSelectedTemplate(null);
            }}>
              Annuler
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Mes rapports</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="dashboards">Tableaux de bord</TabsTrigger>
          </TabsList>

          {/* Rapports enregistrés */}
          <TabsContent value="reports" className="space-y-6">
            {/* Rapports récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Rapports récents
                </CardTitle>
                <CardDescription>Vos derniers rapports générés</CardDescription>
              </CardHeader>
              <CardContent>
                {savedReports.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedReports.slice(0, 6).map((report) => (
                      <Card key={report.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{report.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(report.created_at)}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button variant="ghost" size="sm">
                            <FileEdit className="h-4 w-4 mr-2" />
                            Afficher
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-1">Aucun rapport récent</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez votre premier rapport en cliquant sur "Nouveau rapport"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rapports favoris */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Rapports favoris
                </CardTitle>
                <CardDescription>Vos rapports préférés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas encore de rapports favoris
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modèles de rapports */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Modèles de rapports disponibles</CardTitle>
                <CardDescription>Rapports prédéfinis que vous pouvez utiliser</CardDescription>
              </CardHeader>
              <CardContent>
                {reportTemplates.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reportTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            {getChartIcon(template.chart_type)}
                            <span className="text-xs px-2 py-1 bg-muted rounded-md">
                              {template.chart_type}
                            </span>
                          </div>
                          <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                          {template.description && (
                            <CardDescription className="text-xs line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground">
                            Créé le {formatDate(template.created_at)}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-1">Aucun modèle disponible</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez votre premier modèle en cliquant sur "Nouveau rapport"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tableaux de bord */}
          <TabsContent value="dashboards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Tableaux de bord
                </CardTitle>
                <CardDescription>Vos tableaux de bord personnalisés</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboards.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {dashboards.map((dashboard) => (
                      <Card key={dashboard.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{dashboard.name}</CardTitle>
                          {dashboard.description && (
                            <CardDescription className="text-xs">
                              {dashboard.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground">{dashboard.widgets.length} widgets</span>
                            {dashboard.is_default && (
                              <span className="ml-auto px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Par défaut
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="outline" size="sm" className="w-full">
                            Ouvrir le tableau de bord
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-1">Aucun tableau de bord</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez un tableau de bord pour visualiser vos rapports importants
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau tableau de bord
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 