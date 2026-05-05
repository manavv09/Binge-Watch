import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({ src, alt, className, containerClassName }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    // Check if the image is already cached by the browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalHeight > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName || ''}`}>
      {/* Skeleton / Placeholder */}
      {!isLoaded && !hasError && (
        <motion.div 
          className="absolute inset-0 bg-bg-surface-active/80 animate-pulse z-0"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Error State Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-bg-surface-active flex items-center justify-center text-text-muted text-[0.7rem] text-center p-2 z-0 border border-glass-border">
          <span className="opacity-50">Image N/A</span>
        </div>
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} relative z-10 transition-opacity duration-500 ease-out ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true); // remove skeleton on error
        }}
      />
    </div>
  );
};

export default LazyImage;
