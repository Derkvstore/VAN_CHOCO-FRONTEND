// frontend/src/pages/Accueil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { CloudOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Accueil() {
  const [dashboardStats, setDashboardStats] = useState({
    totalCartons: 0,
    totalArrivage: 0,
    totalVentes: 0,
    totalReturned: 0,
    totalSentToSupplier: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    "VAN CHOCO 🌟, l'univers des mobiles authentiques. L'innovation à portée de main.",
    "VAN CHOCO 🌐 : Le monde de la mobile authentique, à portée de clic."
  ];

  const navigate = useNavigate();

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    setIsNetworkError(false);
    try {
      const backendUrl = import.meta.env.PROD
        ? 'https://vanchoco-backend-production.up.railway.app'
        : 'http://localhost:3001';

      const response = await fetch(`${backendUrl}/api/reports/dashboard-stats`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération des statistiques du tableau de bord.');
      }
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du tableau de bord:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setIsNetworkError(true);
      } else {
        setStatsError(`Erreur: ${error.message}`);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000);
    return () => {
      clearInterval(timerId);
      clearInterval(quoteInterval);
    };
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 md:px-8 max-w-full sm:max-w-7xl mx-auto">
      {/* Citation animée */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentQuoteIndex}
          className="text-lg sm:text-2xl font-semibold text-blue-800 text-center mb-6 sm:mb-8 dark:text-blue-200 px-2 sm:px-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          {quotes[currentQuoteIndex]}
        </motion.h3>
      </AnimatePresence>

      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-full px-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 flex items-center space-x-3 sm:space-x-4 border border-gray-100 dark:border-gray-700 transform transition-transform duration-300 hover:scale-105 w-full sm:w-auto min-w-[260px]">
            <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Nous sommes le</p>
              <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">{getFormattedDate()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 flex items-center space-x-3 sm:space-x-4 border border-gray-100 dark:border-gray-700 transform transition-transform duration-300 hover:scale-105 w-full sm:w-auto min-w-[260px]">
            <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Heure Actuelle</p>
              <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>

        {isNetworkError ? (
          <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-red-50 dark:bg-red-950 rounded-xl shadow-lg mt-6 sm:mt-8 max-w-lg mx-auto">
            <CloudOff className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4 animate-pulse-once" />
            <p className="text-base sm:text-xl font-semibold text-red-700 dark:text-red-300 text-center">
              Impossible de se connecter au serveur.
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mt-2">
              Vérifiez votre connexion Internet et réessayez.
            </p>
          </div>
        ) : statsLoading ? (
          <div className="flex flex-col items-center justify-center p-6 sm:p-10 mt-6 sm:mt-8">
            <div className="flex justify-center text-blue-500 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-4 border-t-4 border-blue-200 animate-spin dark:border-blue-700 dark:border-t-blue-400"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center">Chargement des statistiques...</p>
          </div>
        ) : statsError ? (
          <p className="text-red-600 dark:text-red-400 text-center">{statsError}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-full px-1">
            {[
              {
                Icon: DevicePhoneMobileIcon,
                value: dashboardStats.totalCartons,
                label: "Cartons",
                textColor: "text-blue-800 dark:text-blue-300",
                iconColor: "text-blue-500",
              },
              {
                Icon: TruckIcon,
                value: dashboardStats.totalArrivage,
                label: "Arrivage",
                textColor: "text-green-800 dark:text-green-300",
                iconColor: "text-green-500",
              },
              {
                Icon: ShoppingCartIcon,
                value: dashboardStats.totalVentes,
                label: "Ventes",
                textColor: "text-purple-800 dark:text-purple-300",
                iconColor: "text-purple-500",
              },
              {
                Icon: ArrowPathIcon,
                value: dashboardStats.totalReturned,
                label: "Retours Client",
                textColor: "text-red-800 dark:text-red-300",
                iconColor: "text-orange-500",
              },
              {
                Icon: ArrowsRightLeftIcon,
                value: dashboardStats.totalSentToSupplier,
                label: "Retours Fournisseurs",
                textColor: "text-pink-800 dark:text-pink-300",
                iconColor: "text-red-500",
              },
            ].map(({ Icon, value, label, textColor, iconColor }, i) => (
              <motion.div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-700 transform transition-transform duration-300 hover:scale-105 min-w-[200px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <Icon className={`h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 ${iconColor}`} />
                <p className={`text-3xl sm:text-4xl font-bold ${textColor} truncate`}>{value}</p>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 truncate">{label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
