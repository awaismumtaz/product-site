import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Grid, Card, CardMedia,
  CardContent, Typography, Box, Button,
  TextField, MenuItem, Alert, Rating,
  LinearProgress
} from '@mui/material';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch product, reviews, and review eligibility
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`)
        ]);

        setProduct(productRes.data);
        setReviews(reviewsRes.data);

        // Calculate average rating and distribution
        const ratings = reviewsRes.data.map(r => r.rating);
        const avg = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        setAverageRating(avg);

        // Calculate rating distribution
        const counts = Array(5).fill(0);
        ratings.forEach(r => counts[r-1]++);
        setRatingCounts(counts);

        // Check if user can review (has purchased but not reviewed)
        if (user) {
          const eligibilityRes = await api.get(`/reviews/canreview/${id}`);
          setCanReview(eligibilityRes.data.canReview);
        }
      } catch (error) {
        setError('Failed to load product information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

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

  if (loading) return (
    <Container sx={{ mt: 4 }}>
      <LinearProgress />
    </Container>
  );

  if (!product) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">Product not found</Alert>
    </Container>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.imageUrl}
              alt={product.name}
              sx={{ objectFit: 'contain' }}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>{product.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography sx={{ ml: 1 }}>
                  ({reviews.length} reviews)
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                ${product.price.toFixed(2)}
              </Typography>
              <Typography 
                variant="body1" 
                color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
                sx={{ mt: 1 }}
              >
                {product.stock > 10 ? `In stock (${product.stock} available)` :
                 product.stock > 0 ? `Low stock (only ${product.stock} left)` :
                 'Out of stock'}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Quantity"
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 100 }}
                  disabled={product.stock === 0}
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map(i => (
                    <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  disabled={product.stock === 0}
                  onClick={handleAdd}
                  size="large"
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
          <Typography variant="h6" gutterBottom>Customer Reviews</Typography>
          
          {/* Rating Distribution */}
          <Box sx={{ mb: 4 }}>
            {ratingCounts.map((count, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ mr: 1, minWidth: 60 }}>
                  {5-idx} stars
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(count / Math.max(...ratingCounts)) * 100} 
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography sx={{ ml: 1, minWidth: 40 }}>
                  ({count})
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Review Form */}
          {canReview && (
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom>Write a Review</Typography>
              <Box sx={{ mb: 2 }}>
                <Rating
                  value={rating}
                  onChange={(e, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                label="Your Review"
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={handleReview}
                disabled={!comment.trim() || comment.length < 10}
              >
                Submit Review
              </Button>
            </Card>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <Alert severity="info">No reviews yet. Be the first to review!</Alert>
          ) : (
            reviews.map(r => (
              <Box key={r.id} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                <Rating value={r.rating} readOnly size="small" />
                <Typography variant="caption" display="block" color="text.secondary">
                  {new Date(r.timestamp).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {r.comment}
                </Typography>
              </Box>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
