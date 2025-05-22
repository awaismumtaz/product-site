import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

export default function About() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSnackbar({
      open: true,
      message: 'Thank you for your message! We will get back to you soon.',
      severity: 'success'
    });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Company Introduction */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          About Chilli Milli
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Your Premier Destination for Grocery and Food Products
        </Typography>
        <Typography variant="body1" paragraph>
          At Chilli Milli, we're passionate about bringing the world's finest grocery and food products to your home. 
          Our journey began with a simple mission: to provide high-quality, authentic products that elevate your daily life.
        </Typography>
        <Typography variant="body1" paragraph>
          We source our products directly from farmers and producers worldwide, ensuring the highest quality and freshest flavors. 
          Our commitment to sustainability and fair trade practices means you can feel good about every purchase.
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Quality Assured</Typography>
            <Typography variant="body2" color="text.secondary">
              Every product is carefully selected to ensure the highest quality and freshness.
            </Typography>
          </Paper>
        </Grid>
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Global Sourcing</Typography>
            <Typography variant="body2" color="text.secondary">
              We work directly with farmers and producers from around the world.
            </Typography>
          </Paper>
        </Grid>
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Sustainable Practices</Typography>
            <Typography variant="body2" color="text.secondary">
              Committed to eco-friendly packaging and sustainable business practices.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Map and Contact Form */}
      <Grid container spacing={4}>
        {/* Map */}
        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Find Us</Typography>
            <Box sx={{ height: 400, width: '100%', bgcolor: 'grey.200' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d317.74940366874597!2d14.121429417877318!3d57.71170410000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465a73709b47fd57%3A0xa02dc296279cf274!2sInstabox!5e1!3m2!1sen!2sus!4v1747949264579!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Chilli Milli Location"
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>Jonkoping, Sweden</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>+46 700 123 456</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>chillimilli@gmail.com</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Form */}
        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Contact Us</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
              >
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 