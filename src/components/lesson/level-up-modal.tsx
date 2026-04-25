"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/ui/mascot";

interface LevelUpModalProps {
  newLevel: number;
  newLabel: string;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, newLabel, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sparkles background */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            {["✨", "⭐", "🌟", "✨", "⭐"].map((star, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${10 + (i % 2) * 60}%`,
                }}
                animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                {star}
              </motion.div>
            ))}
          </div>

          <Mascot size="lg" className="animate-bounce-subtle mb-4" />

          <div className="text-sm font-medium text-muted-foreground mb-1">
            עלית לרמה
          </div>
          <div className="text-5xl font-bold text-primary mb-2">{newLevel}</div>
          <div className="text-2xl font-bold mb-6">{newLabel}</div>

          <div className="rounded-2xl bg-xp-gold/15 border border-xp-gold/30 px-4 py-3 mb-6">
            <p className="text-sm font-medium text-xp-gold-foreground">
              🎉 !כל הכבוד — המשך ללמוד ולהתקדם
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            !תודה
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
