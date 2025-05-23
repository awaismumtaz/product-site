import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProductModal({ product, open, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const { user, openLoginModal } = useAuth();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment('');
      setError('');
      setReviewSubmitted(false);
      setExistingReview(null);
    }
  }, [open]);

  // Check if user can review the product and fetch existing review if any
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!user) {
        setCanReview(false);
        return;
      }

      try {
        const response = await api.get(`/Reviews/canreview/${product.id}`);
        setCanReview(response.data.canReview);
        if (!response.data.canReview) {
          setError(response.data.reason || 'You cannot review this product');
          // If user has already reviewed, fetch their review
          if (response.data.reason === 'You have already reviewed this product') {
            setReviewSubmitted(true);
            // Fetch the user's existing review
            const reviewsResponse = await api.get(`/Reviews/${product.id}`);
            console.log('Reviews response:', reviewsResponse.data);
            // The first review in the array is the user's review since they can only have one
            const userReview = reviewsResponse.data[0];
            console.log('User review:', userReview);
            if (userReview) {
              setExistingReview(userReview);
              setRating(userReview.rating);
              setComment(userReview.comment);
            }
          }
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err);
        setCanReview(false);
        setError('Failed to check review eligibility');
      }
    };

    if (open && user) {
      checkReviewEligibility();
    }
  }, [open, user, product.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }

    if (!canReview) {
      setError('You cannot review this product. You must purchase it first.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // First, get the order ID for this product
      const orderResponse = await api.get('/Orders');
      const order = orderResponse.data.find(o => 
        o.items && o.items.some(item => item.productId === product.id)
      );

      if (!order) {
        setError('Could not find your purchase of this product');
        return;
      }

      // Now submit the review with the order ID
      await api.post('/Reviews', {
        productId: product.id,
        rating,
        comment,
        orderId: order.id
      });
      setReviewSubmitted(true);
      setCanReview(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response?.status === 401) {
        setError('Please log in to submit a review');
        openLoginModal();
      } else if (err.response?.status === 403) {
        setError('You must purchase this product before reviewing it');
      } else {
        // Extract error message from response
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.response?.data || 
                           'Failed to submit review';
        setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: 0, height: '80vh', display: 'flex' }}>
        <Grid container sx={{ height: '100%', flexWrap: 'nowrap' }}>
          {/* Left side - Product Image and Price */}
          <Grid item xs={12} md={6} sx={{ 
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 3,
            height: '100%',
            flex: '0 0 50%'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              height: '100%'
            }}>
              <Box
                component="img"
                src={`http://localhost:5246${product.imageUrl}`}
                alt={product.name}
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1
                }}
              />
              <Typography variant="h5" fontWeight={700}>
                {product.name}
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography 
                variant="body1" 
                color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
              >
                {product.stock > 10 ? `In stock (${product.stock} available)` :
                 product.stock > 0 ? `Low stock (only ${product.stock} left)` :
                 'Out of stock'}
              </Typography>
            </Box>
          </Grid>

          {/* Right side - Review Form or Success Message */}
          <Grid item xs={12} md={6} sx={{ 
            p: 3,
            height: '100%',
            flex: '0 0 50%',
            overflow: 'auto'
          }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {reviewSubmitted ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2,
                  py: 4
                }}>
                  <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Your Review
                  </Typography>
                  {existingReview && (
                    <Box sx={{ 
                      width: '100%', 
                      p: 2, 
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1
                    }}>
                      <Rating value={existingReview.rating} readOnly size="large" />
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {existingReview.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(existingReview.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  <Button 
                    variant="contained" 
                    onClick={onClose}
                    sx={{ mt: 2 }}
                  >
                    Close
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Write a Review
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <form onSubmit={handleSubmitReview}>
                    <Box sx={{ mb: 2 }}>
                      <Typography component="legend">Rating</Typography>
                      <Rating
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        precision={0.5}
                        size="large"
                      />
                    </Box>
                    <TextField
                      label="Your Review"
                      multiline
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      fullWidth
                      margin="normal"
                      placeholder="Share your experience with this product..."
                      error={comment.length > 0 && comment.length < 10}
                      helperText={comment.length > 0 && comment.length < 10 ? "Review must be at least 10 characters long" : ""}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isSubmitting || rating === 0 || comment.length < 10 || !canReview}
                      sx={{ mt: 2 }}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                  </form>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
} 