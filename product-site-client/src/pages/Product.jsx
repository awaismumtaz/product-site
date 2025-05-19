import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Grid, Card, CardMedia,
  CardContent, Typography, Box, Button,
  TextField, MenuItem, Alert
} from '@mui/material';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Fetch product + reviews
  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
    api.get(`/reviews/${id}`).then(res => setReviews(res.data));
  }, [id]);

  const handleAdd = () => {
    if (product.stock < qty) {
      setError('Quantity exceeds stock');
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price }, qty);
    setError('');
  };

  const handleReview = async () => {
    setError('');
    try {
      await api.post('/reviews', { productId: product.id, rating, comment });
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
      setComment('');
      setRating(5);
    } catch (e) {
      setError(e.response?.data || 'Failed to post review');
    }
  };

  if (!product) return <Container>Loading…</Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={product.imageUrl}
              alt={product.name}
            />
            <CardContent>
              <Typography variant="h5">{product.name}</Typography>
              <Typography variant="h6">${product.price.toFixed(2)}</Typography>
              <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error'}>
                {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Qty"
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  size="small"
                >
                  {[...Array(product.stock).keys()].map(i => (
                    <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  disabled={product.stock === 0}
                  onClick={handleAdd}
                >
                  Add to Cart
                </Button>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Reviews</Typography>
          {reviews.map(r => (
            <Box key={r.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
              <Typography variant="subtitle2">
                Rating: {r.rating} / 5 — {new Date(r.timestamp).toLocaleDateString()}
              </Typography>
              <Typography>{r.comment}</Typography>
            </Box>
          ))}

          {/* Review Form */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1">Leave a Review</Typography>
            <TextField
              select
              label="Rating"
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              size="small"
              sx={{ mr: 2, width: 100 }}
            >
              {[5,4,3,2,1].map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Comment"
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleReview}
            >
              Submit Review
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
