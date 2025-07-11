// Mock du client Supabase pour le développement
// Remplace le client réel pour éviter les appels à l'API Supabase

// Types de base pour les mocks
type MockResponse<T> = {
  data: T | null;
  error: Error | null;
  count?: number;
};

// Type pour les éléments stockés dans les tables
type TableRecord = {
  id: string | number;
  [key: string]: any; // Signature d'index pour permettre l'accès aux propriétés avec des clés string
};

// Mock des services
const mockServices = [
  {
    id: 1,
    name: "Audit de sécurité",
    slug: "audit-securite",
    short_description: "Évaluation complète de votre infrastructure informatique pour identifier les vulnérabilités",
    description: "Notre audit de sécurité analyse en profondeur votre infrastructure pour détecter les failles et proposer des solutions adaptées à votre entreprise.",
    base_price: 1500,
    display_price: "À partir de 1500€",
    category_id: 1,
    estimated_duration: 120,
    complexity_level: "élevé",
    is_featured: true,
    is_active: true,
    features: ["Scan de vulnérabilités", "Analyse de configuration", "Rapport détaillé", "Recommandations"],
    icon: "/icons/security.svg",
    category: {
      id: 1,
      name: "Cybersécurité",
      slug: "cybersecurite",
      icon: "shield",
      color: "#e11d48"
    },
    options: [
      {
        id: 1,
        service_id: 1,
        option_name: "Niveau d'analyse",
        option_type: "select",
        price_modifier: 0,
        price_multiplier: true,
        description: "Choisissez le niveau de profondeur de l'audit",
        min_value: null,
        max_value: null,
        default_value: "standard",
        available_values: {
          "standard": "Standard",
          "approfondi": "Approfondi (+50%)",
          "expert": "Expert (+100%)"
        },
        is_required: true,
        sort_order: 1
      },
      {
        id: 2,
        service_id: 1,
        option_name: "Nombre de postes",
        option_type: "number",
        price_modifier: 50,
        price_multiplier: false,
        description: "Nombre de postes à auditer",
        min_value: 1,
        max_value: 100,
        default_value: "5",
        available_values: null,
        is_required: true,
        sort_order: 2
      }
    ],
    tags: [
      { service_tags: { id: 1, name: "Sécurité" } },
      { service_tags: { id: 2, name: "Audit" } }
    ]
  },
  {
    id: 2,
    name: "Installation réseau",
    slug: "installation-reseau",
    short_description: "Mise en place complète de votre infrastructure réseau sécurisée",
    description: "Notre service d'installation réseau comprend la configuration, la sécurisation et l'optimisation de votre infrastructure pour une performance maximale.",
    base_price: 2500,
    display_price: "À partir de 2500€",
    category_id: 2,
    estimated_duration: 240,
    complexity_level: "moyen",
    is_featured: true,
    is_active: true,
    features: ["Câblage", "Configuration routeurs", "Sécurisation", "Documentation"],
    icon: "/icons/network.svg",
    category: {
      id: 2,
      name: "Infrastructure",
      slug: "infrastructure",
      icon: "server",
      color: "#0891b2"
    },
    options: [
      {
        id: 3,
        service_id: 2,
        option_name: "Type de réseau",
        option_type: "select",
        price_modifier: 0,
        price_multiplier: true,
        description: "Type de réseau à installer",
        min_value: null,
        max_value: null,
        default_value: "standard",
        available_values: {
          "standard": "Standard",
          "haute-disponibilite": "Haute disponibilité (+75%)",
          "redondant": "Redondant (+150%)"
        },
        is_required: true,
        sort_order: 1
      }
    ],
    tags: [
      { service_tags: { id: 3, name: "Réseau" } },
      { service_tags: { id: 4, name: "Installation" } }
    ]
  },
  {
    id: 3,
    name: "Support technique",
    slug: "support-technique",
    short_description: "Assistance technique disponible 24/7 pour résoudre tous vos problèmes informatiques",
    description: "Notre équipe de techniciens qualifiés est disponible pour vous aider à résoudre rapidement tout problème informatique, à distance ou sur site.",
    base_price: 500,
    display_price: "À partir de 500€/mois",
    category_id: 3,
    estimated_duration: 0,
    complexity_level: "faible",
    is_featured: true,
    is_active: true,
    features: ["Support 24/7", "Intervention rapide", "Suivi des tickets", "Rapport mensuel"],
    icon: "/icons/support.svg",
    category: {
      id: 3,
      name: "Support",
      slug: "support",
      icon: "headset",
      color: "#4f46e5"
    },
    options: [
      {
        id: 4,
        service_id: 3,
        option_name: "Niveau de SLA",
        option_type: "select",
        price_modifier: 0,
        price_multiplier: true,
        description: "Temps de réponse garanti",
        min_value: null,
        max_value: null,
        default_value: "standard",
        available_values: {
          "standard": "Standard (8h)",
          "business": "Business (4h, +50%)",
          "premium": "Premium (1h, +100%)"
        },
        is_required: true,
        sort_order: 1
      }
    ],
    tags: [
      { service_tags: { id: 5, name: "Support" } },
      { service_tags: { id: 6, name: "Maintenance" } }
    ]
  }
];

// Mock des catégories
const mockCategories = [
  {
    id: 1,
    name: "Cybersécurité",
    slug: "cybersecurite",
    description: "Services de sécurité informatique",
    icon: "shield",
    color: "#e11d48",
    sort_order: 1
  },
  {
    id: 2,
    name: "Infrastructure",
    slug: "infrastructure",
    description: "Services d'infrastructure réseau",
    icon: "server",
    color: "#0891b2",
    sort_order: 2
  },
  {
    id: 3,
    name: "Support",
    slug: "support",
    description: "Services de support technique",
    icon: "headset",
    color: "#4f46e5",
    sort_order: 3
  }
];

// Mock des tags
const mockTags = [
  { id: 1, name: "Sécurité" },
  { id: 2, name: "Audit" },
  { id: 3, name: "Réseau" },
  { id: 4, name: "Installation" },
  { id: 5, name: "Support" },
  { id: 6, name: "Maintenance" }
];

// Mock des commandes
const mockOrders = [
  {
    id: "order-1",
    user_id: "mock-user-id",
    order_number: "ORD-123456",
    status: "COMPLETED",
    total_amount: 1500,
    subtotal_amount: 1250,
    tax_amount: 250,
    deposit_amount: 500,
    remaining_amount: 1000,
    payment_method: "card",
    payment_status: "PAID",
    customer_info: {
      first_name: "Jean",
      last_name: "Dupont",
      email: "jean.dupont@example.com",
      phone: "0123456789"
    },
    shipping_info: {
      street: "123 Rue de Paris",
      postal_code: "75001",
      city: "Paris",
      country: "France"
    },
    created_at: "2023-05-15T10:30:00Z"
  },
  {
    id: "order-2",
    user_id: "mock-user-id",
    order_number: "ORD-789012",
    status: "IN_PROGRESS",
    total_amount: 2500,
    subtotal_amount: 2083,
    tax_amount: 417,
    deposit_amount: 750,
    remaining_amount: 1750,
    payment_method: "card",
    payment_status: "PAID_DEPOSIT",
    customer_info: {
      first_name: "Marie",
      last_name: "Martin",
      email: "marie.martin@example.com",
      phone: "0987654321"
    },
    shipping_info: {
      street: "456 Avenue Victor Hugo",
      postal_code: "69002",
      city: "Lyon",
      country: "France"
    },
    created_at: "2023-06-20T14:45:00Z"
  }
];

// Mock des éléments de commande
const mockOrderItems = [
  {
    id: "item-1",
    order_id: "order-1",
    service_id: 1,
    service_name: "Audit de sécurité",
    quantity: 1,
    unit_price: 1500,
    calculated_price: 1500,
    configuration: {
      "Niveau d'analyse": "standard",
      "Nombre de postes": 5
    }
  },
  {
    id: "item-2",
    order_id: "order-2",
    service_id: 2,
    service_name: "Installation réseau",
    quantity: 1,
    unit_price: 2500,
    calculated_price: 2500,
    configuration: {
      "Type de réseau": "standard"
    }
  }
];

// Mock des événements de commande
const mockOrderEvents = [
  {
    id: "event-1",
    order_id: "order-1",
    event_type: "COMMANDE_CRÉÉE",
    description: "Commande créée",
    created_at: "2023-05-15T10:30:00Z"
  },
  {
    id: "event-2",
    order_id: "order-1",
    event_type: "COMMANDE_PAYÉE",
    description: "Commande payée (1500€)",
    created_at: "2023-05-15T10:35:00Z"
  },
  {
    id: "event-3",
    order_id: "order-1",
    event_type: "COMMANDE_TERMINÉE",
    description: "Service réalisé avec succès",
    created_at: "2023-05-20T15:00:00Z"
  },
  {
    id: "event-4",
    order_id: "order-2",
    event_type: "COMMANDE_CRÉÉE",
    description: "Commande créée",
    created_at: "2023-06-20T14:45:00Z"
  },
  {
    id: "event-5",
    order_id: "order-2",
    event_type: "ACOMPTE_PAYÉ",
    description: "Acompte de 750€ payé",
    created_at: "2023-06-20T14:50:00Z"
  }
];

// Mock des documents
const mockDocuments = [
  {
    id: "doc-1",
    user_id: "mock-user-id",
    name: "Facture-ORD123456.pdf",
    description: "Facture pour la commande ORD-123456",
    type: "INVOICE",
    file_path: "/documents/invoice-123456.pdf",
    file_size: 125000,
    mime_type: "application/pdf",
    order_id: "order-1",
    created_at: "2023-05-15T11:00:00Z"
  },
  {
    id: "doc-2",
    user_id: "mock-user-id",
    name: "Rapport-Audit-123.pdf",
    description: "Rapport d'audit de sécurité",
    type: "REPORT",
    file_path: "/documents/report-123.pdf",
    file_size: 500000,
    mime_type: "application/pdf",
    order_id: "order-1",
    created_at: "2023-05-20T16:00:00Z"
  },
  {
    id: "doc-3",
    user_id: "mock-user-id",
    name: "Facture-Acompte-ORD789012.pdf",
    description: "Facture d'acompte pour la commande ORD-789012",
    type: "INVOICE",
    file_path: "/documents/invoice-deposit-789012.pdf",
    file_size: 115000,
    mime_type: "application/pdf",
    order_id: "order-2",
    created_at: "2023-06-20T15:00:00Z"
  }
];

// Mock des notifications
const mockNotifications = [
  {
    id: "notif-1",
    user_id: "mock-user-id",
    type: "ORDER_UPDATE",
    title: "Commande terminée",
    message: "Votre commande ORD-123456 a été marquée comme terminée.",
    read: false,
    action_url: "/account/orders/order-1",
    created_at: "2023-05-20T15:05:00Z"
  },
  {
    id: "notif-2",
    user_id: "mock-user-id",
    type: "DOCUMENT_AVAILABLE",
    title: "Nouveau document disponible",
    message: "Le rapport d'audit de sécurité est disponible pour votre commande ORD-123456.",
    read: false,
    action_url: "/account/documents",
    created_at: "2023-05-20T16:05:00Z"
  },
  {
    id: "notif-3",
    user_id: "mock-user-id",
    type: "INTERVENTION_SCHEDULED",
    title: "Intervention planifiée",
    message: "Une intervention pour votre commande ORD-789012 a été planifiée pour le 25/06/2023.",
    read: true,
    action_url: "/account/orders/order-2",
    created_at: "2023-06-21T09:00:00Z"
  }
];

// Mock des utilisateurs
const mockUsers = [
  {
    id: "mock-user-id",
    email: "user@example.com",
    full_name: "Jean Dupont",
    first_name: "Jean",
    last_name: "Dupont",
    phone: "0123456789",
    address: "123 Rue de Paris, 75001 Paris",
    role: "ADMIN",
    created_at: "2023-01-15T10:00:00Z"
  }
];

// Mock des préférences utilisateur
const mockUserPreferences = [
  {
    id: "pref-1", // Ajout d'un ID unique
    user_id: "mock-user-id",
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    language: "fr",
    theme: "light"
  }
];

// Mock des historiques de connexion
const mockLoginHistory = [
  {
    id: "login-1",
    user_id: "mock-user-id",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    login_at: "2023-07-01T08:30:00Z",
    success: true
  },
  {
    id: "login-2",
    user_id: "mock-user-id",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    login_at: "2023-06-25T14:15:00Z",
    success: true
  }
];

// Fonction pour générer un ID unique
const generateId = () => Math.random().toString(36).substring(2, 15);

// Fonction pour créer un client mock
export const createClient = () => {
  // Tables de données mockées
  const tables: Record<string, TableRecord[]> = {
    services: mockServices,
    service_categories: mockCategories,
    service_tags: mockTags,
    orders: mockOrders,
    order_items: mockOrderItems,
    order_events: mockOrderEvents,
    documents: mockDocuments,
    notifications: mockNotifications,
    users: mockUsers,
    user_preferences: mockUserPreferences,
    login_history: mockLoginHistory
  };

  // Fonction pour créer un objet de requête avec les méthodes communes
  const createQueryBuilder = (filteredData: any[], tableName: string) => {
    const builder = {
      eq: (field: string, value: any) => createQueryBuilder(
        filteredData.filter(item => item[field] === value),
        tableName
      ),
      in: (field: string, values: any[]) => createQueryBuilder(
        filteredData.filter(item => values.includes(item[field])),
        tableName
      ),
      gte: (field: string, value: any) => createQueryBuilder(
        filteredData.filter(item => item[field] >= value),
        tableName
      ),
      lte: (field: string, value: any) => createQueryBuilder(
        filteredData.filter(item => item[field] <= value),
        tableName
      ),
      ilike: (field: string, pattern: string) => ({
        then: (callback: (value: MockResponse<any[]>) => any) => {
          if (tables[tableName]) {
            const searchTerm = pattern.replace(/%/g, '').toLowerCase();
            const filteredData = tables[tableName].filter(item => {
              const value = item[field];
              return value && value.toString().toLowerCase().includes(searchTerm);
            });
            return Promise.resolve({ 
              data: filteredData, 
              error: null,
              count: filteredData.length
            }).then(callback);
          }
          return Promise.resolve({ data: [], error: null }).then(callback);
        },
        range: (from: number, to: number) => ({
          then: (callback: (value: MockResponse<any[]>) => any) => {
            if (tables[tableName]) {
              const searchTerm = pattern.replace(/%/g, '').toLowerCase();
              const filteredData = tables[tableName].filter(item => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm);
              });
              const slicedData = filteredData.slice(from, to + 1);
              return Promise.resolve({ 
                data: slicedData, 
                error: null,
                count: filteredData.length
              }).then(callback);
            }
            return Promise.resolve({ data: [], error: null }).then(callback);
          }
        })
      }),
      or: (conditions: string) => ({
        then: (callback: (value: MockResponse<any[]>) => any) => {
          // Implémentation simplifiée pour or
          return Promise.resolve({ 
            data: tables[tableName] || [], 
            error: null,
            count: (tables[tableName] || []).length
          }).then(callback);
        },
        range: (from: number, to: number) => ({
          then: (callback: (value: MockResponse<any[]>) => any) => {
            if (tables[tableName]) {
              const slicedData = tables[tableName].slice(from, to + 1);
              return Promise.resolve({ 
                data: slicedData, 
                error: null,
                count: tables[tableName].length
              }).then(callback);
            }
            return Promise.resolve({ data: [], error: null }).then(callback);
          }
        })
      }),
      order: (field: string, { ascending }: { ascending: boolean } = { ascending: true }) => ({
        limit: (limit: number) => ({
          then: (callback: (value: MockResponse<any[]>) => any) => {
            if (tables[tableName]) {
              const sortedData = [...tables[tableName]].sort((a, b) => {
                if (ascending) return a[field] > b[field] ? 1 : -1;
                return a[field] < b[field] ? 1 : -1;
              });
              return Promise.resolve({ 
                data: sortedData.slice(0, limit), 
                error: null,
                count: sortedData.length
              }).then(callback);
            }
            return Promise.resolve({ data: [], error: null }).then(callback);
          }
        }),
        range: (from: number, to: number) => ({
          then: (callback: (value: MockResponse<any[]>) => any) => {
            if (tables[tableName]) {
              const sortedData = [...tables[tableName]].sort((a, b) => {
                if (ascending) return a[field] > b[field] ? 1 : -1;
                return a[field] < b[field] ? 1 : -1;
              });
              return Promise.resolve({ 
                data: sortedData.slice(from, to + 1), 
                error: null,
                count: sortedData.length
              }).then(callback);
            }
            return Promise.resolve({ data: [], error: null }).then(callback);
          }
        }),
        then: (callback: (value: MockResponse<any[]>) => any) => {
          return Promise.resolve({
            data: filteredData,
            error: null,
            count: filteredData.length
          }).then(callback);
        }
      }),
      range: (from: number, to: number) => ({
        then: (callback: (value: MockResponse<any[]>) => any) => {
          if (tables[tableName]) {
            const data = tables[tableName].slice(from, to + 1);
            return Promise.resolve({ 
              data, 
              error: null,
              count: tables[tableName].length
            }).then(callback);
          }
          return Promise.resolve({ data: [], error: null }).then(callback);
        }
      }),
      limit: (limit: number) => ({
        then: (callback: (value: MockResponse<any[]>) => any) => {
          if (tables[tableName]) {
            const limitedData = tables[tableName].slice(0, limit);
            return Promise.resolve({ 
              data: limitedData, 
              error: null,
              count: tables[tableName].length
            }).then(callback);
          }
          return Promise.resolve({ data: [], error: null }).then(callback);
        }
      }),
      single: () => {
        return {
          then: (callback: (value: MockResponse<any>) => any) => {
            const item = filteredData.length > 0 ? filteredData[0] : null;
            return Promise.resolve({
              data: item,
              error: item ? null : new Error(`No item found in ${tableName}`)
            }).then(callback);
          }
        };
      },
      then: (callback: (value: MockResponse<any[]>) => any) => {
        return Promise.resolve({
          data: filteredData,
          error: null,
          count: filteredData.length
        }).then(callback);
      }
    };
    
    return builder;
  };

  return {
    from: (table: string) => ({
      select: (fields?: string) => {
        // Récupérer les données de la table
        const tableData = tables[table] || [];
        return createQueryBuilder(tableData, table);
      },
      insert: (data: any) => ({
        select: (fields?: string) => ({
          single: () => {
            try {
              // Générer un ID si nécessaire
              const newItem = Array.isArray(data) ? data[0] : data;
              if (!newItem.id) {
                newItem.id = `${table.slice(0, -1)}-${generateId()}`;
              }
              
              // Ajouter la date de création si nécessaire
              if (!newItem.created_at) {
                newItem.created_at = new Date().toISOString();
              }
              
              // Ajouter l'élément à la table correspondante
              if (tables[table]) {
                tables[table].push(newItem);
                return Promise.resolve({ data: newItem, error: null });
              }
              
              return Promise.resolve({ 
                data: null, 
                error: new Error(`Table ${table} not found`)
              });
            } catch (error) {
              return Promise.resolve({ 
                data: null, 
                error: error instanceof Error ? error : new Error('Unknown error')
              });
            }
          }
        }),
        then: (callback: (value: MockResponse<any>) => any) => {
          try {
            // Traiter un tableau ou un objet unique
            const items = Array.isArray(data) ? data : [data];
            
            // Générer des IDs et ajouter des timestamps
            const newItems = items.map(item => {
              const newItem = { ...item };
              if (!newItem.id) {
                newItem.id = `${table.slice(0, -1)}-${generateId()}`;
              }
              if (!newItem.created_at) {
                newItem.created_at = new Date().toISOString();
              }
              return newItem;
            });
            
            // Ajouter les éléments à la table correspondante
            if (tables[table]) {
              tables[table].push(...newItems);
              return Promise.resolve({ 
                data: Array.isArray(data) ? newItems : newItems[0], 
                error: null
              }).then(callback);
            }
            
            return Promise.resolve({ 
              data: null, 
              error: new Error(`Table ${table} not found`)
            }).then(callback);
          } catch (error) {
            return Promise.resolve({ 
              data: null, 
              error: error instanceof Error ? error : new Error('Unknown error')
            }).then(callback);
          }
        }
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          eq: (field2: string, value2: any) => ({
            then: (callback: (value: MockResponse<any>) => any) => {
              try {
                // Trouver les éléments à mettre à jour
                if (tables[table]) {
                  const items = tables[table];
                  let updatedItems = 0;
                  
                  for (let i = 0; i < items.length; i++) {
                    if (items[i][field] === value && items[i][field2] === value2) {
                      tables[table][i] = {
                        ...items[i],
                        ...data,
                        updated_at: new Date().toISOString()
                      };
                      updatedItems++;
                    }
                  }
                  
                  return Promise.resolve({
                    data: { count: updatedItems },
                    error: null
                  }).then(callback);
                }
                
                return Promise.resolve({
                  data: { count: 0 },
                  error: new Error(`Table ${table} not found`)
                }).then(callback);
              } catch (error) {
                return Promise.resolve({
                  data: null,
                  error: error instanceof Error ? error : new Error('Unknown error')
                }).then(callback);
              }
            }
          }),
          then: (callback: (value: MockResponse<any>) => any) => {
            try {
              // Trouver les éléments à mettre à jour
              if (tables[table]) {
                const items = tables[table];
                let updatedItems = 0;
                
                for (let i = 0; i < items.length; i++) {
                  if (items[i][field] === value) {
                    tables[table][i] = {
                      ...items[i],
                      ...data,
                      updated_at: new Date().toISOString()
                    };
                    updatedItems++;
                  }
                }
                
                return Promise.resolve({
                  data: { count: updatedItems },
                  error: null
                }).then(callback);
              }
              
              return Promise.resolve({
                data: { count: 0 },
                error: new Error(`Table ${table} not found`)
              }).then(callback);
            } catch (error) {
              return Promise.resolve({
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error')
              }).then(callback);
            }
          }
        })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUsers[0] } }),
      getSession: () => Promise.resolve({ 
        data: { 
          session: {
            user: {
              id: "mock-user-id",
              email: "user@example.com"
            }
          } 
        } 
      }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Mock de l'abonnement aux changements d'état d'authentification
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      },
      signInWithPassword: ({ email, password }: { email: string, password: string }) => 
        Promise.resolve({ data: null, error: null }),
      signUp: ({ email, password, options }: { email: string, password: string, options?: any }) => 
        Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: (email: string, options?: any) => 
        Promise.resolve({ data: null, error: null })
    },
    functions: {
      invoke: (name: string, { body }: { body: any }) => {
        if (name === 'calculate-service-price') {
          return Promise.resolve({
            data: {
              base_price: body.service_id ? 1000 : 0,
              options_price: 200,
              total_price: body.service_id ? 1200 : 0,
              breakdown: [
                { name: "Prix de base", price: body.service_id ? 1000 : 0 },
                { name: "Options", price: 200 }
              ],
              display_price: body.service_id ? "1 200€" : "0€",
              estimated_duration: "2 heures"
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      }
    }
  };
};

// Client préconfiguré pour une utilisation facile dans les composants
export const supabaseClient = createClient(); 