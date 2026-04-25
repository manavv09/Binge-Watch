import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Ticket } from 'lucide-react';

const PARTNERS = [
  {
    id: 'bookmyshow',
    name: 'BookMyShow',
    tagline: 'India\'s largest ticketing platform',
    color: 'from-red-600 to-red-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    hover: 'hover:bg-red-500/20 hover:border-red-500/60',
    dot: 'bg-red-500',
    getUrl: (title) => `https://in.bookmyshow.com/explore/movies?query=${encodeURIComponent(title)}`,
    logo: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#E3272A"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">B</text>
      </svg>
    ),
  },
  {
    id: 'pvr',
    name: 'PVR Cinemas',
    tagline: 'India\'s largest cinema chain',
    color: 'from-blue-600 to-blue-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    hover: 'hover:bg-blue-500/20 hover:border-blue-500/60',
    dot: 'bg-blue-500',
    getUrl: (title) => `https://www.pvrcinemas.com/movies/upcoming-movies`,
    logo: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#003087"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">PVR</text>
      </svg>
    ),
  },
  {
    id: 'district',
    name: 'District',
    tagline: 'By BookMyShow · Premium experience',
    color: 'from-purple-600 to-violet-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    hover: 'hover:bg-purple-500/20 hover:border-purple-500/60',
    dot: 'bg-purple-500',
    getUrl: () => `https://district.in/`,
    logo: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#7C3AED"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">D</text>
      </svg>
    ),
  },
  {
    id: 'inox',
    name: 'INOX Movies',
    tagline: 'Premium large-format screens',
    color: 'from-cyan-600 to-teal-500',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/60',
    dot: 'bg-cyan-500',
    getUrl: () => `https://www.inoxmovies.com/`,
    logo: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#00B0B9"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">INOX</text>
      </svg>
    ),
  },
  {
    id: 'cinepolis',
    name: 'Cinepolis',
    tagline: 'World-class cinema experience',
    color: 'from-orange-600 to-amber-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    hover: 'hover:bg-orange-500/20 hover:border-orange-500/60',
    dot: 'bg-orange-500',
    getUrl: () => `https://www.cinepoliscinemas.in/`,
    logo: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#E87722"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">CIN</text>
      </svg>
    ),
  },
];

const PartnerCard = ({ partner, movieTitle, index }) => (
  <motion.a
    href={partner.getUrl(movieTitle)}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.3 }}
    className={`flex items-center gap-4 p-4 rounded-2xl border ${partner.bg} ${partner.border} ${partner.hover} transition-all duration-200 group cursor-pointer no-underline`}
  >
    {/* Logo */}
    <div className="shrink-0 rounded-xl overflow-hidden shadow-lg">
      {partner.logo}
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p className="font-bold text-text-primary text-[0.95rem] leading-tight">{partner.name}</p>
      <p className="text-text-muted text-xs mt-0.5 truncate">{partner.tagline}</p>
    </div>

    {/* CTA */}
    <div className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
      Book
      <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
    </div>
  </motion.a>
);

const BookingPartnersModal = ({ item, onClose }) => {
  const title = item?.title || item?.name || 'This Movie';
  const poster = item?.poster_path
    ? `https://image.tmdb.org/t/p/w154${item.poster_path}`
    : item?.mock_image || null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[5000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-bg-surface rounded-3xl border border-glass-border shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-glass-border">
            <div className="flex items-center gap-3">
              {poster && (
                <img
                  src={poster}
                  alt={title}
                  className="w-10 h-14 rounded-lg object-cover border border-glass-border shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Ticket size={14} className="text-accent-primary" />
                  <span className="text-xs text-accent-primary font-semibold uppercase tracking-widest">Book Tickets</span>
                </div>
                <h2 className="font-bold text-base leading-tight line-clamp-1">{title}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Partner list */}
          <div className="p-5 space-y-3">
            <p className="text-text-muted text-xs mb-4 text-center">
              Select a platform to book your tickets
            </p>
            {PARTNERS.map((partner, i) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                movieTitle={title}
                index={i}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-1">
            <p className="text-center text-text-muted text-[11px]">
              You'll be redirected to the partner website. Prices and availability may vary.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingPartnersModal;
