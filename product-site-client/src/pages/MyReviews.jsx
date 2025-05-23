import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Rating,
  Card,
  CardContent,
  Grid,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/Reviews/my');
        setReviews(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Alert severity="info">You haven't written any reviews yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Link
                      component={RouterLink}
                      to={`/product/${review.productId}`}
                      color="primary"
                      underline="hover"
                    >
                      <Typography variant="h6">
                        {review.product?.name || 'Product'}
                      </Typography>
                    </Link>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Rating value={review.rating} readOnly />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {review.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 