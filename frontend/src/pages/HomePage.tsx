import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActionArea,
  Divider
} from '@mui/material';
import { 
  Security, 
  NetworkCheck, 
  Computer, 
  School, 
  Speed, 
  VerifiedUser, 
  Support 
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  // Exemple de services mis en avant
  const featuredServices = [
    {
      id: 1,
      title: 'Audit de Sécurité Complet',
      description: 'Évaluation approfondie de votre infrastructure avec rapport détaillé et recommandations.',
      icon: <Security fontSize="large" color="primary" />,
      price: 'À partir de 1200€',
      link: '/services/audit-securite'
    },
    {
      id: 2,
      title: 'Sécurisation Réseau Entreprise',
      description: 'Protection complète de votre réseau avec firewall nouvelle génération et monitoring 24/7.',
      icon: <NetworkCheck fontSize="large" color="primary" />,
      price: 'À partir de 850€',
      link: '/services/securisation-reseau'
    },
    {
      id: 3,
      title: 'Maintenance Informatique Préventive',
      description: 'Contrat de maintenance régulière pour prévenir les pannes et optimiser performances.',
      icon: <Computer fontSize="large" color="primary" />,
      price: 'À partir de 350€/mois',
      link: '/services/maintenance-informatique'
    }
  ];

  // Exemple de témoignages clients
  const testimonials = [
    {
      id: 1,
      name: 'Marie Dupont',
      company: 'PME Consulting',
      comment: 'SiteAris a transformé notre approche de la sécurité informatique. Service impeccable et résultats visibles dès le premier mois.',
      rating: 5
    },
    {
      id: 2,
      name: 'Jean Martin',
      company: 'Innov Tech',
      comment: 'Équipe réactive et compétente. Le rapport d\'audit nous a permis d\'identifier des vulnérabilités critiques dont nous ignorions l\'existence.',
      rating: 4
    }
  ];

  return (
    <Box>
      {/* Bannière principale */}
      <Box 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Sécurisez votre Entreprise avec nos Services IT
          </Typography>
          <Typography variant="h5" gutterBottom>
            Solutions sur mesure, tarifs transparents, expertise reconnue
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            sx={{ mt: 4 }}
          >
            Demander un devis gratuit
          </Button>
        </Container>
      </Box>

      {/* Section Avantages */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Pourquoi choisir SiteAris?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Speed fontSize="large" color="primary" />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Réactivité Garantie
              </Typography>
              <Typography variant="body1">
                Intervention sous 4h pour les urgences, support technique disponible 24/7.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <VerifiedUser fontSize="large" color="primary" />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Expertise Certifiée
              </Typography>
              <Typography variant="body1">
                Équipe de consultants certifiés (CISSP, CEH, OSCP) avec +10 ans d'expérience.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Support fontSize="large" color="primary" />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tarifs Transparents
              </Typography>
              <Typography variant="body1">
                Devis détaillé, pas de coûts cachés, garantie satisfaction ou remboursement.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Section Services */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Nos Services Phares
          </Typography>
          <Grid container spacing={4}>
            {featuredServices.map((service) => (
              <Grid item key={service.id} xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea href={service.link}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      {service.icon}
                    </Box>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h3">
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {service.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {service.price}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button variant="outlined" color="primary" size="large" href="/services">
              Voir tous nos services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Section Témoignages */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Ce que nos clients disent
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial) => (
            <Grid item key={testimonial.id} xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                    "{testimonial.comment}"
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.company}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Prêt à sécuriser votre infrastructure?
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
            Notre équipe d'experts est disponible pour répondre à vos besoins spécifiques
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            href="/contact"
          >
            Nous contacter
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 