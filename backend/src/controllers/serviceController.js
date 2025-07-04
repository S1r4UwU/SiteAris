const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Récupérer tous les services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    const { category, search, active, sort, page = 1, limit = 10 } = req.query;
    
    // Construction du filtre
    const filter = {};
    
    if (category) {
      filter.categoryId = parseInt(category);
    }
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Gestion de l'ordre
    const orderBy = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      orderBy[field] = direction === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Récupération des services
    const services = await prisma.service.findMany({
      where: filter,
      include: {
        category: true,
        options: true
      },
      orderBy,
      skip,
      take: parseInt(limit)
    });
    
    // Récupération du nombre total pour la pagination
    const total = await prisma.service.count({
      where: filter
    });
    
    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: services
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des services'
    });
  }
};

/**
 * @desc    Récupérer un service par son ID
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        options: true
      }
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du service'
    });
  }
};

/**
 * @desc    Créer un nouveau service
 * @route   POST /api/services
 * @access  Private (Admin)
 */
exports.createService = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      basePrice, 
      categoryId, 
      estimatedDuration,
      options = []
    } = req.body;
    
    // Vérifications des données
    if (!name || !description || !basePrice || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir toutes les informations requises'
      });
    }
    
    // Création du service avec ses options
    const service = await prisma.service.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        categoryId: parseInt(categoryId),
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : 0,
        active: true,
        options: {
          create: options.map(option => ({
            name: option.name,
            description: option.description || null,
            priceModifier: parseFloat(option.priceModifier),
            required: option.required || false
          }))
        }
      },
      include: {
        category: true,
        options: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du service'
    });
  }
};

/**
 * @desc    Mettre à jour un service
 * @route   PUT /api/services/:id
 * @access  Private (Admin)
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      basePrice, 
      categoryId, 
      estimatedDuration,
      active
    } = req.body;
    
    // Vérification de l'existence du service
    const serviceExists = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Mise à jour du service
    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        description: description || undefined,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        active: active !== undefined ? active : undefined
      },
      include: {
        category: true,
        options: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du service'
    });
  }
};

/**
 * @desc    Supprimer un service
 * @route   DELETE /api/services/:id
 * @access  Private (Admin)
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le service existe
    const serviceExists = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Supprimer d'abord les options du service (relation)
    await prisma.serviceOption.deleteMany({
      where: { serviceId: parseInt(id) }
    });
    
    // Supprimer le service
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Service supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du service'
    });
  }
}; 