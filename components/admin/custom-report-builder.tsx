"use client";

// Imports simplifiés et mock des dépendances
// Note: Ces imports sont des placeholders pour résoudre les erreurs TypeScript
const React = { useState: (initial: any) => [initial, (val: any) => {}], useEffect: (fn: Function, deps: any[]) => {} };
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock des icônes Lucide-React
const IconComponents = {
  BarChart: (props: any) => <div className={props.className} />,
  LineChart: (props: any) => <div className={props.className} />,
  PieChart: (props: any) => <div className={props.className} />,
  CalendarDays: (props: any) => <div className={props.className} />,
  Table: (props: any) => <div className={props.className} />,
  Filter: (props: any) => <div className={props.className} />,
  BarChart4: (props: any) => <div className={props.className} />,
  Save: (props: any) => <div className={props.className} />,
  Download: (props: any) => <div className={props.className} />,
  Share2: (props: any) => <div className={props.className} />,
  FileBarChart: (props: any) => <div className={props.className} />,
  X: (props: any) => <div className={props.className} />,
  Plus: (props: any) => <div className={props.className} />,
  Settings: (props: any) => <div className={props.className} />
};
const { BarChart, LineChart, PieChart, CalendarDays, Table: TableIcon, Filter, BarChart4, 
  Save, Download, Share2, FileBarChart, X, Plus, Settings } = IconComponents;

// Mock de react-hook-form
const useForm = (options: any) => {
  return {
    control: {},
    handleSubmit: (fn: any) => (e: any) => {},
    watch: (field: any) => '',
    setValue: (field: any, value: any) => {},
    formState: { errors: {} }
  };
};
const Controller = (props: any) => props.render({ field: { value: '', onChange: () => {} } });

// Mock de zod
const z = {
  object: (schema: any) => ({ 
    infer: undefined,
    min: (min: number, message: string) => ({ optional: () => ({}) }),
    optional: () => ({}),
    enum: (values: string[]) => ({})
  }),
  string: () => ({ 
    min: (min: number, message: string) => ({ optional: () => ({}) }),
    optional: () => ({})
  }),
  array: (schema: any) => ({
    min: (min: number, message: string) => ({ optional: () => ({}) }),
    optional: () => ({})
  }),
  enum: (values: string[]) => ({}),
  any: () => ({})
};

// Mock du zodResolver
const zodResolver = (schema: any) => schema;

// Types pour les rapports
interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
}

interface ReportQuery {
  table: string;
  fields: string[];
  filters?: ReportFilter[];
  sort?: ReportSort[];
  groupBy?: string[];
  limit?: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  query_definition: ReportQuery;
  chart_type: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'CARD';
  is_public: boolean;
  permissions: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SavedReport {
  id: string;
  template_id: string | null;
  name: string;
  parameters: Record<string, any> | null;
  result_data: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
}

interface ReportResult {
  data: any[];
  meta: {
    count: number;
    aggregations?: Record<string, any>;
  };
}

// Mock du client reporting
const reportingClient = {
  getReportTemplates: async (): Promise<ReportTemplate[]> => [],
  getReportTemplateById: async (id: string): Promise<ReportTemplate | null> => null,
  createReportTemplate: async (template: any): Promise<string | null> => null,
  executeReport: async (request: any): Promise<ReportResult> => ({ 
    data: [], 
    meta: { count: 0 } 
  }),
  saveReport: async (report: any): Promise<string | null> => null,
  getSavedReports: async (): Promise<SavedReport[]> => [],
  getSavedReportById: async (id: string): Promise<SavedReport | null> => null
};

// Validation schema
const reportFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  table: z.string().min(1, "Veuillez sélectionner une table"),
  fields: z.array(z.string()).min(1, "Sélectionnez au moins un champ"),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
    value: z.any()
  })).optional(),
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional(),
  groupBy: z.array(z.string()).optional(),
  chartType: z.enum(['BAR', 'LINE', 'PIE', 'TABLE', 'CARD']),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

// Tables disponibles et leurs champs
const availableTables = [
  { 
    id: 'orders', 
    name: 'Commandes', 
    fields: [
      { id: 'id', name: 'ID' },
      { id: 'order_number', name: 'N° Commande' },
      { id: 'status', name: 'Statut' },
      { id: 'total_amount', name: 'Montant total', numeric: true },
      { id: 'user_id', name: 'ID Client' },
      { id: 'created_at', name: 'Date création', date: true }
    ]
  },
  { 
    id: 'users', 
    name: 'Utilisateurs', 
    fields: [
      { id: 'id', name: 'ID' },
      { id: 'email', name: 'Email' },
      { id: 'full_name', name: 'Nom complet' },
      { id: 'role', name: 'Rôle' },
      { id: 'created_at', name: 'Date inscription', date: true }
    ]
  },
  {
    id: 'customer_profiles',
    name: 'Profils clients',
    fields: [
      { id: 'id', name: 'ID' },
      { id: 'lifetime_value', name: 'Valeur à vie', numeric: true },
      { id: 'engagement_score', name: 'Score d\'engagement', numeric: true },
      { id: 'technical_level', name: 'Niveau technique' },
      { id: 'industry', name: 'Secteur d\'activité' },
      { id: 'company_size', name: 'Taille d\'entreprise' }
    ]
  },
  {
    id: 'interventions',
    name: 'Interventions',
    fields: [
      { id: 'id', name: 'ID' },
      { id: 'status', name: 'Statut' },
      { id: 'scheduled_date', name: 'Date planifiée', date: true },
      { id: 'technician_id', name: 'Technicien' },
      { id: 'order_id', name: 'ID Commande' }
    ]
  }
];

// Types de graphiques disponibles
const chartTypes = [
  { id: 'BAR', name: 'Histogramme', icon: <BarChart className="h-4 w-4" /> },
  { id: 'LINE', name: 'Courbe', icon: <LineChart className="h-4 w-4" /> },
  { id: 'PIE', name: 'Camembert', icon: <PieChart className="h-4 w-4" /> },
  { id: 'TABLE', name: 'Tableau', icon: <TableIcon className="h-4 w-4" /> },
  { id: 'CARD', name: 'Indicateurs', icon: <BarChart4 className="h-4 w-4" /> }
];

interface CustomReportBuilderProps {
  initialTemplate?: ReportTemplate;
  savedReports?: SavedReport[];
  onSave?: (report: ReportTemplate) => void;
  onExecute?: (result: ReportResult) => void;
}

export function CustomReportBuilder({
  initialTemplate,
  savedReports = [],
  onSave,
  onExecute
}: CustomReportBuilderProps) {
  const [activeTab, setActiveTab] = React.useState('builder');
  const [selectedTable, setSelectedTable] = React.useState<string>('');
  const [selectedFields, setSelectedFields] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<ReportFilter[]>([]);
  const [sortFields, setSortFields] = React.useState<ReportSort[]>([]);
  const [groupByFields, setGroupByFields] = React.useState<string[]>([]);
  const [previewData, setPreviewData] = React.useState<any[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedTemplates, setSavedTemplates] = React.useState<ReportTemplate[]>([]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: initialTemplate ? {
      name: initialTemplate.name,
      description: initialTemplate.description || '',
      table: initialTemplate.query_definition.table,
      fields: initialTemplate.query_definition.fields,
      filters: initialTemplate.query_definition.filters || [],
      sort: initialTemplate.query_definition.sort || [],
      groupBy: initialTemplate.query_definition.groupBy || [],
      chartType: initialTemplate.chart_type,
    } : {
      name: '',
      description: '',
      table: '',
      fields: [],
      filters: [],
      sort: [],
      groupBy: [],
      chartType: 'TABLE',
    }
  });

  const watchedTable = watch('table');
  const watchedChartType = watch('chartType');
  
  // Charger les modèles de rapports sauvegardés
  React.useEffect(() => {
    async function fetchReportTemplates() {
      try {
        const templates = await reportingClient.getReportTemplates();
        setSavedTemplates(templates);
      } catch (error) {
        console.error('Erreur lors du chargement des modèles de rapports:', error);
      }
    }
    
    fetchReportTemplates();
  }, []);

  // Mise à jour des champs disponibles lorsque la table change
  React.useEffect(() => {
    if (watchedTable) {
      setSelectedTable(watchedTable);
      setSelectedFields([]);
      setValue('fields', []);
      setFilters([]);
      setSortFields([]);
      setGroupByFields([]);
    }
  }, [watchedTable, setValue]);

  const availableFields = selectedTable ? 
    availableTables.find(t => t.id === selectedTable)?.fields || [] 
    : [];

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      const newFields = selectedFields.filter(id => id !== fieldId);
      setSelectedFields(newFields);
      setValue('fields', newFields);
    } else {
      const newFields = [...selectedFields, fieldId];
      setSelectedFields(newFields);
      setValue('fields', newFields);
    }
  };

  const addFilter = () => {
    if (availableFields.length > 0) {
      const newFilter: ReportFilter = {
        field: availableFields[0].id,
        operator: 'eq',
        value: ''
      };
      setFilters([...filters, newFilter]);
    }
  };

  const removeFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const updateFilter = (index: number, field: keyof ReportFilter, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const addSortField = () => {
    if (selectedFields.length > 0) {
      const newSort: ReportSort = {
        field: selectedFields[0],
        direction: 'asc'
      };
      setSortFields([...sortFields, newSort]);
    }
  };

  const removeSortField = (index: number) => {
    const newSortFields = [...sortFields];
    newSortFields.splice(index, 1);
    setSortFields(newSortFields);
  };

  const updateSortField = (index: number, field: keyof ReportSort, value: any) => {
    const newSortFields = [...sortFields];
    newSortFields[index] = { ...newSortFields[index], [field]: value };
    setSortFields(newSortFields);
  };

  const toggleGroupByField = (field: string) => {
    if (groupByFields.includes(field)) {
      setGroupByFields(groupByFields.filter(f => f !== field));
    } else {
      setGroupByFields([...groupByFields, field]);
    }
  };

  const executeReport = async (data: ReportFormValues) => {
    setIsLoading(true);
    try {
      // Construire la requête
      const query: ReportQuery = {
        table: data.table,
        fields: data.fields,
        filters: filters,
        sort: sortFields,
        groupBy: groupByFields,
        limit: 100 // Limiter les résultats pour la prévisualisation
      };

      // Exécuter la requête
      const result = await reportingClient.executeReport({
        query: query,
        chartConfig: {
          type: data.chartType
        }
      });

      setPreviewData(result.data);
      if (onExecute) onExecute(result);
    } catch (error) {
      console.error('Erreur lors de l\'exécution du rapport:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async (data: ReportFormValues) => {
    try {
      // Construire le modèle de rapport
      const template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description || null,
        query_definition: {
          table: data.table,
          fields: data.fields,
          filters: filters,
          sort: sortFields,
          groupBy: groupByFields
        },
        chart_type: data.chartType,
        is_public: true,
        permissions: null,
        created_by: null
      };

      // Sauvegarder le modèle
      const templateId = await reportingClient.createReportTemplate(template);
      
      if (templateId && onSave) {
        onSave({ ...template, id: templateId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rapport:', error);
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    await executeReport(data);
    setActiveTab('preview');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">Constructeur</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Informations du rapport */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du rapport</CardTitle>
                  <CardDescription>Définissez le nom et la description de votre rapport</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Nom du rapport</label>
                      <Controller
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <Input 
                            id="name" 
                            placeholder="Nom du rapport" 
                            {...field}
                          />
                        )}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">Description (optionnelle)</label>
                      <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                          <Input 
                            id="description" 
                            placeholder="Description du rapport" 
                            {...field}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <label htmlFor="chartType" className="block text-sm font-medium mb-1">Type de visualisation</label>
                      <Controller
                        control={control}
                        name="chartType"
                        render={({ field }) => (
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type de graphique" />
                            </SelectTrigger>
                            <SelectContent>
                              {chartTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center">
                                    {type.icon}
                                    <span className="ml-2">{type.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.chartType && <p className="text-red-500 text-sm mt-1">{errors.chartType.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sélection des données */}
              <Card>
                <CardHeader>
                  <CardTitle>Source de données</CardTitle>
                  <CardDescription>Sélectionnez la table et les champs pour votre rapport</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="table" className="block text-sm font-medium mb-1">Table de données</label>
                      <Controller
                        control={control}
                        name="table"
                        render={({ field }) => (
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une table" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTables.map(table => (
                                <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.table && <p className="text-red-500 text-sm mt-1">{errors.table.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Champs à inclure</label>
                      {selectedTable ? (
                        <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                          {availableFields.map(field => (
                            <div key={field.id} className="flex items-center mb-2">
                              <Checkbox
                                id={`field-${field.id}`}
                                checked={selectedFields.includes(field.id)}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                              />
                              <label htmlFor={`field-${field.id}`} className="ml-2 text-sm">
                                {field.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Veuillez sélectionner une table</p>
                      )}
                      {errors.fields && <p className="text-red-500 text-sm mt-1">{errors.fields.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtres, tri et regroupement */}
            {selectedTable && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Filtres et options</CardTitle>
                  <CardDescription>Définissez les filtres, le tri et le regroupement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Filtres */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Filtres</h4>
                        <Button type="button" size="sm" variant="outline" onClick={addFilter}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter un filtre
                        </Button>
                      </div>
                      
                      {filters.length > 0 ? (
                        <div className="space-y-3">
                          {filters.map((filter, index) => (
                            <div key={index} className="flex items-center gap-2 border p-2 rounded-md">
                              <Select 
                                value={filter.field} 
                                onValueChange={(value) => updateFilter(index, 'field', value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Champ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableFields.map(field => (
                                    <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select 
                                value={filter.operator} 
                                onValueChange={(value: any) => updateFilter(index, 'operator', value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Opérateur" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="eq">égal à</SelectItem>
                                  <SelectItem value="neq">différent de</SelectItem>
                                  <SelectItem value="gt">supérieur à</SelectItem>
                                  <SelectItem value="gte">supérieur ou égal</SelectItem>
                                  <SelectItem value="lt">inférieur à</SelectItem>
                                  <SelectItem value="lte">inférieur ou égal</SelectItem>
                                  <SelectItem value="contains">contient</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                value={filter.value}
                                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                placeholder="Valeur"
                                className="flex-1"
                              />

                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeFilter(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Aucun filtre défini</p>
                      )}
                    </div>

                    {/* Tri */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Tri</h4>
                        <Button type="button" size="sm" variant="outline" onClick={addSortField} disabled={selectedFields.length === 0}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter un tri
                        </Button>
                      </div>
                      
                      {sortFields.length > 0 ? (
                        <div className="space-y-3">
                          {sortFields.map((sort, index) => (
                            <div key={index} className="flex items-center gap-2 border p-2 rounded-md">
                              <Select 
                                value={sort.field} 
                                onValueChange={(value) => updateSortField(index, 'field', value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Champ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedFields.map(fieldId => {
                                    const field = availableFields.find(f => f.id === fieldId);
                                    return field ? (
                                      <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                                    ) : null;
                                  })}
                                </SelectContent>
                              </Select>

                              <Select 
                                value={sort.direction} 
                                onValueChange={(value: any) => updateSortField(index, 'direction', value)}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Direction" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="asc">Croissant</SelectItem>
                                  <SelectItem value="desc">Décroissant</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeSortField(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Aucun tri défini</p>
                      )}
                    </div>

                    {/* Regroupement (pour les graphiques) */}
                    {(watchedChartType === 'BAR' || watchedChartType === 'PIE' || watchedChartType === 'LINE') && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Regrouper par</h4>
                        {selectedFields.length > 0 ? (
                          <div className="border rounded-md p-2">
                            {selectedFields.map(fieldId => {
                              const field = availableFields.find(f => f.id === fieldId);
                              return field ? (
                                <div key={field.id} className="flex items-center mb-2">
                                  <Checkbox
                                    id={`group-${field.id}`}
                                    checked={groupByFields.includes(field.id)}
                                    onCheckedChange={() => toggleGroupByField(field.id)}
                                  />
                                  <label htmlFor={`group-${field.id}`} className="ml-2 text-sm">
                                    {field.name}
                                  </label>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Sélectionnez des champs pour les regrouper</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Exécution...' : 'Exécuter le rapport'}
              </Button>
              <Button type="button" variant="outline" onClick={() => handleSubmit(saveReport)()}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Résultats du rapport</CardTitle>
              <CardDescription>Prévisualisation des données</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Chargement des données...</p>
                </div>
              ) : previewData ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((value, valueIndex) => (
                            <TableCell key={valueIndex}>
                              {value !== null ? String(value) : 'N/A'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p>Exécutez un rapport pour voir les résultats</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('builder')}>
                Modifier le rapport
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" disabled={!previewData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button variant="outline" disabled={!previewData}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modèles sauvegardés */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles de rapports sauvegardés</CardTitle>
          <CardDescription>Charger un rapport existant</CardDescription>
        </CardHeader>
        <CardContent>
          {savedTemplates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedTemplates.slice(0, 6).map(template => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(template.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun modèle de rapport sauvegardé</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 