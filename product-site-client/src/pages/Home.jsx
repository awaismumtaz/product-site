// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  const fetchProducts = async (query = '') => {
    try {
      const res = await api.get('/products', {
        params: { search: query }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    fetchProducts(search);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
        <TextField
          label="Search products"
          variant="outlined"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map(prod => (
          <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <Link to={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={prod.imageUrl}
                  alt={prod.name}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {prod.name}
                  </Typography>
                  <Typography variant="body1">
                    ${prod.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color={prod.stock > 0 ? 'text.secondary' : 'error'}>
                    {prod.stock > 0 ? `In stock: ${prod.stock}` : 'Out of stock'}
                  </Typography>
                </CardContent>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
