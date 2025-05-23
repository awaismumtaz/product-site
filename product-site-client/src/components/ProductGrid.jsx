import React, { useState, useEffect } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Box, Container, CircularProgress, Alert } from '@mui/material';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  // Show products in multiples of 6 to maintain complete rows
  const productsPerRow = 6;
  const initialRows = 1;
  const displayedProducts = showAll 
    ? products 
    : products.slice(0, productsPerRow * initialRows);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/products');
        setProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        width: '100%', 
        mt: 6,
        mb: 6,
        px: { xs: 2, md: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            Showing {displayedProducts.length} of {products.length}
          </Typography>
          <Box sx={{ width: 20, height: 2, bgcolor: 'error.main' }} />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Grid 
              container 
              spacing={3}
              justifyContent="flex-start"
            >
              {displayedProducts.map(prod => (
                <Grid key={prod.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%', lg: '16.66%' } }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                    onClick={() => handleProductClick(prod)}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={`http://localhost:5246${prod.imageUrl}`}
                      alt={prod.name}
                      sx={{ 
                        objectFit: 'contain', 
                        bgcolor: 'grey.50',
                        p: 2
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="body1" gutterBottom noWrap fontWeight={500}>
                        {prod.name}
                      </Typography>
                      <Typography variant="h6" color="error.main" fontWeight={700}>
                        ${prod.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from opening
                          addToCart(prod, 1);
                        }}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'error.dark'
                          }
                        }}
                      >
                        Add to cart
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Show more button */}
            {!showAll && products.length > productsPerRow * initialRows && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4,
                borderTop: '1px solid',
                borderColor: 'grey.200',
                pt: 4
              }}>
                <Button
                  variant="contained"
                  onClick={() => setShowAll(true)}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: '25px',
                    px: 6,
                    py: 1,
                    minWidth: 200,
                    '&:hover': {
                      bgcolor: 'error.dark'
                    }
                  }}
                >
                  Show more
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
} 