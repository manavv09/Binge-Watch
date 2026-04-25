import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VideoModal = ({ videoKey, onClose }) => {
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!videoKey) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[4000] flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[1100px] relative bg-black rounded-xl overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute -top-10 right-0 md:-top-10 md:-right-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center transition-all duration-150 hover:bg-red-500/80 cursor-pointer border-none"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-xl">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoModal;
