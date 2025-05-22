// src/pages/Home.jsx
import React, { useState } from 'react';
import Banner from '../components/Banner';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);

  const handleBannerClick = () => {
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && <Banner onButtonClick={handleBannerClick} />}
      <ProductGrid />
    </>
  );
}
