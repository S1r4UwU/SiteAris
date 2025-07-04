const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Obtenir la liste des services
 *     description: Récupère tous les services avec possibilité de filtrer et paginer
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: ID de la catégorie pour filtrer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche pour filtrer les services
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtre par statut actif/inactif
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Format "field:direction" (ex. "name:asc")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des services
 *       500:
 *         description: Erreur serveur
 */
router.route('/').get(serviceController.getServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Obtenir un service par ID
 *     description: Récupère les détails d'un service spécifique par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du service à récupérer
 *     responses:
 *       200:
 *         description: Détails du service
 *       404:
 *         description: Service non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.route('/:id').get(serviceController.getServiceById);

/**
 * Routes protégées (nécessitent authentification + rôle admin)
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Créer un nouveau service
 *     description: Ajoute un nouveau service (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *               estimatedDuration:
 *                 type: integer
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.route('/').post(protect, admin, serviceController.createService);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Mettre à jour un service
 *     description: Modifie un service existant par son ID (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du service à modifier
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Service mis à jour avec succès
 *       404:
 *         description: Service non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.route('/:id').put(protect, admin, serviceController.updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Supprimer un service
 *     description: Supprime un service par son ID (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du service à supprimer
 *     responses:
 *       200:
 *         description: Service supprimé avec succès
 *       404:
 *         description: Service non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.route('/:id').delete(protect, admin, serviceController.deleteService);

module.exports = router; 