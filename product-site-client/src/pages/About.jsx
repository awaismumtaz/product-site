import React from 'react';
import { Container, Typography } from '@mui/material';

export default function About() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>About Us</Typography>
      <Typography variant="body1">This is a placeholder About Us page for your grocery shop project.</Typography>
    </Container>
  );
} 