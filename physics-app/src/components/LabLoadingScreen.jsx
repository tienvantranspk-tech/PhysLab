import React from 'react';
import { motion } from 'framer-motion';

/**
 * LabLoadingScreen — Skeleton loading state shown while a lab chunk is being fetched.
 * Matches the dark immersive layout of all labs.
 */
export default function LabLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0B1120] text-white flex flex-col overflow-hidden">
      {/* Header skeleton */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
        <div className="text-center space-y-1.5">
          <div className="w-32 h-3.5 bg-white/5 rounded-full animate-pulse mx-auto" />
          <div className="w-24 h-2.5 bg-white/5 rounded-full animate-pulse mx-auto" />
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas skeleton */}
        <div className="flex-1 relative min-h-0 flex items-center justify-center">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }}
          />

          {/* Loading spinner */}
          <motion.div
            className="flex flex-col items-center gap-4 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <div className="text-sm font-extrabold text-slate-400 tracking-wide">
              Đang tải phòng thí nghiệm...
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary/40 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Floating formula decoration */}
          <div className="absolute top-8 left-8 space-y-3 opacity-10">
            <div className="w-28 h-3 bg-white/20 rounded-full" />
            <div className="w-20 h-3 bg-white/15 rounded-full" />
            <div className="w-24 h-3 bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:w-[340px] bg-[#0F172A]/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 p-4 gap-4">
          {/* Section title */}
          <div className="w-24 h-2.5 bg-white/5 rounded-full animate-pulse" />

          {/* Graph skeleton */}
          <div className="bg-[#0B1120] rounded-2xl border border-white/5 h-[140px] animate-pulse" />

          {/* Slider skeletons */}
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2.5">
              <div className="flex justify-between">
                <div className="w-28 h-2.5 bg-white/5 rounded-full animate-pulse" />
                <div className="w-12 h-2.5 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}

          {/* Result cards skeleton */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/3 rounded-xl p-3 space-y-2 animate-pulse">
                <div className="w-full h-5 bg-white/5 rounded-full" />
                <div className="w-2/3 h-2 bg-white/5 rounded-full mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
