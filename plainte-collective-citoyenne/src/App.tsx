/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  ShieldCheck, 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  PhoneCall as WhatsApp,
  Users,
  Youtube,
  Instagram,
  Mail,
  X,
  AlertCircle
} from 'lucide-react';
import { getCounter, recordSupportWithEmail, isFirebaseEnabled, checkEmailExists } from './firebase';

// Base counter value reset to zero as requested
const BASE_COUNT = 0;

export default function App() {
  const [totalSupports, setTotalSupports] = useState(BASE_COUNT);
  const [hasSupported, setHasSupported] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  
  // New Form State
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supported = localStorage.getItem('soutien_citoyen_v1');
    if (supported) {
      setHasSupported(true);
    }

    const unsubscribe = getCounter((count) => {
      setTotalSupports(count);
      setIsRealTime(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [honeypot, setHoneypot] = useState('');

  const handleSupportClick = () => {
    if (hasSupported) return;
    setShowForm(true);
    setFormError('');
    setHoneypot('');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot !== '') {
      console.warn("Bot detected via honeypot");
      return; 
    }

    if (isSubmitting || !email.includes('@')) {
      setFormError('Veuillez entrer un email valide.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // 1. Check if email exists
      const exists = await checkEmailExists(email);
      if (exists) {
        setFormError('Cet email a déjà servi à soutenir la plainte.');
        setIsSubmitting(false);
        return;
      }

      // 2. Record support
      const result = await recordSupportWithEmail(email);
      if (result.success) {
        localStorage.setItem('soutien_citoyen_v1', 'true');
        setHasSupported(true);
        setShowForm(false);
        
        // Trigger small animation feel
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      } else {
        setFormError(result.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setFormError('Erreur de connexion au serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Je soutiens la plainte collective citoyenne pour la justice foncière. Joignez-vous à l'initiative : ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareTwitter = () => {
    const text = `Soutien citoyen pour une enquête et de la justice foncière. #Justice #SoutienCitoyen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareGmail = () => {
    const subject = "Plainte Collective Citoyenne - Soutien";
    const body = `Je soutiens la plainte collective citoyenne pour la justice foncière. Joignez-vous à l'initiative ici : ${window.location.href}`;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050000] text-white font-sans selection:bg-red-900/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-red-950/20 blur-[140px] rounded-full" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-red-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[50%] bg-red-950/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header/Nav */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-900/20 border border-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-red-900/30 transition-colors">
              <Scale className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-semibold tracking-tight text-white/90">Justice Citoyenne</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-xs uppercase tracking-widest text-white/40 font-medium">Libre • Indépendant</span>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Plainte Collective Citoyenne
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
              Soutien citoyen à une demande d’enquête et de justice concernant des accusations d’escroqueries foncières.
            </p>
          </motion.div>
        </section>

        {/* Counter Section */}
        <section className="text-center mb-16">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-5 h-5 text-white/60" />
            </div>
             <div className="overflow-hidden">
               <div className="flex items-center gap-2">
                 <motion.span 
                   key={totalSupports}
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="text-4xl md:text-6xl font-bold block slashed-zero"
                 >
                   {totalSupports.toLocaleString()}
                 </motion.span>
                 <span className="text-xl md:text-3xl text-white/20 font-medium self-end mb-1 md:mb-2 tracking-tighter">
                   / 100 000 objectif
                 </span>
                 {isRealTime && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-500 font-bold uppercase tracking-tighter self-start mt-2"
                   >
                     Live
                   </motion.div>
                 )}
               </div>
               <span className="text-sm uppercase tracking-[0.2em] text-white/40 block mt-2 font-semibold text-center md:text-left">
                 Soutiens Citoyens
               </span>
            </div>
          </motion.div>

          {/* Main Action Button */}
          <div className="flex flex-col items-center gap-8">
            <motion.button
              id="cta-support"
              onClick={handleSupportClick}
              disabled={hasSupported || isAnimating}
              whileHover={!hasSupported ? { scale: 1.02 } : {}}
              whileTap={!hasSupported ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative group px-10 py-6 rounded-2xl font-bold text-lg md:text-2xl tracking-tight transition-all duration-300 border overflow-hidden text-center flex items-center justify-center gap-3
                bg-[#800000] text-white border-red-500/30 shadow-[0_0_40px_rgba(128,0,0,0.3)] hover:shadow-[0_0_60px_rgba(128,0,0,0.5)]
                ${hasSupported ? 'opacity-80 cursor-default' : 'active:scale-95'}
              `}
            >
              {!hasSupported && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
              <span className="relative flex items-center justify-center gap-3">
                {isAnimating && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {hasSupported && <Check className="w-6 h-6 text-green-400" />}
                JE SOUTIENS LA PLAINTE COLLECTIVE CONTRE KHADY DIAGNE
              </span>
            </motion.button>

            {/* Email Form Dialog Overlay */}
            <AnimatePresence>
              {showForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 relative shadow-2xl"
                  >
                    <button 
                      onClick={() => setShowForm(false)}
                      className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-bold mb-2">Votre Soutien</h2>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                      Veuillez entrer votre adresse email pour confirmer votre soutien. Votre email reste privé et sert uniquement à garantir l'unicité des soutiens.
                    </p>

                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                      {/* Honeypot field (hidden from users) */}
                      <div className="opacity-0 absolute -z-10 h-0 overflow-hidden" aria-hidden="true">
                        <input 
                          type="text" 
                          name="full_name_verification" 
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 block ml-1">
                          Adresse Email
                        </label>
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="exemple@mail.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-900/50 transition-colors"
                        />
                      </div>

                      {formError && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-red-900/10 border border-red-900/20 text-red-400 text-sm"
                        >
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p>{formError}</p>
                        </motion.div>
                      )}

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl bg-red-900 text-white font-bold tracking-tight hover:bg-red-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-wait"
                      >
                        {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        CONFIRMER MON SOUTIEN
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {hasSupported && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 py-8 px-12 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                >
                  <p className="text-xl md:text-2xl font-bold text-green-500 flex items-center gap-3">
                    <Check className="w-8 h-8" />
                    Merci. Votre soutien citoyen a été enregistré.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Information Section */}
        <section className="mb-24 px-8 py-10 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <p className="text-center text-white/50 text-sm md:text-base leading-relaxed max-w-2xl mx-auto relative z-10">
            “Cette plateforme est une initiative citoyenne indépendante destinée à exprimer un soutien à une demande d’enquête et de procédure judiciaire dans le respect des lois et de la présomption d’innocence.”
          </p>
        </section>

        {/* Sharing Section */}
        <section className="text-center mb-16 px-4">
          <h3 className="text-sm uppercase tracking-[0.3em] text-white/40 mb-8 font-bold">
            Partagez cette initiative citoyenne
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: <WhatsApp className="w-5 h-5" />, label: 'WhatsApp', action: shareWhatsApp, color: 'hover:bg-[#25D366]' },
              { icon: <Facebook className="w-5 h-5" />, label: 'Facebook', action: shareFacebook, color: 'hover:bg-[#1877F2]' },
              { icon: <Twitter className="w-5 h-5" />, label: 'X', action: shareTwitter, color: 'hover:bg-[#1DA1F2]' },
              { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', action: () => window.open('https://instagram.com', '_blank'), color: 'hover:bg-[#E4405F]' },
              { icon: <Youtube className="w-5 h-5" />, label: 'YouTube', action: () => window.open('https://youtube.com', '_blank'), color: 'hover:bg-[#FF0000]' },
              { icon: <Mail className="w-5 h-5" />, label: 'Google', action: shareGmail, color: 'hover:bg-[#EA4335]' },
              { icon: showCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />, label: showCopied ? 'Copié !' : 'Copier', action: copyLink, color: 'hover:bg-white/10' },
            ].map((item, i) => (
              <motion.button
                key={i}
                onClick={item.action}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 ${item.color} group`}
              >
                <span className="text-white/60 group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs uppercase tracking-widest font-semibold">
            <div className="w-1 h-1 rounded-full bg-white/30" />
            Initiative citoyenne indépendante
            <div className="w-1 h-1 rounded-full bg-white/30" />
          </div>
        </footer>
      </div>
    </div>
  );
}
