import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function Banner() {
  return (
    <Box sx={{
      width: '100%',
      minHeight: 260,
      bgcolor: 'error.main',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: { xs: 2, md: 8 },
      py: 4,
      borderRadius: 2,
      mt: 2,
      mb: 4
    }}>
      {/* Left Image Container */}
      <Box sx={{ 
        display: { xs: 'none', md: 'block' },
        width: '25%',
        minWidth: 200
      }}>
        {/* Left image will be added here */}
      </Box>

      {/* Center Content */}
      <Box sx={{ 
        textAlign: 'center',
        maxWidth: 600,
        flex: 1,
        px: 4
      }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Oh, let's take the weekend!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Weekend food at everyday prices.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ 
            mt: 2,
            bgcolor: 'white',
            color: 'error.main',
            borderRadius: '25px',
            px: 4,
            '&:hover': {
              bgcolor: 'grey.100'
            }
          }}
        >
          To the goods
        </Button>
      </Box>

      {/* Right Image Container */}
      <Box sx={{ 
        display: { xs: 'none', md: 'block' },
        width: '25%',
        minWidth: 200
      }}>
        {/* Right image will be added here */}
      </Box>
    </Box>
  );
} 