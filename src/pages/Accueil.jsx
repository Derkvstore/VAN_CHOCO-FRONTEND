import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon, // Icône pour les mobiles
  TruckIcon, // Icône pour arrivage
  CurrencyDollarIcon, // Icône pour les ventes
  CalendarDaysIcon, // Icône pour la date
  ClockIcon, // Icône pour le chronomètre
  ArrowLeftIcon, // Icône pour les retours
  ArrowPathIcon // Icône pour les remplacements (envoyé au fournisseur)
} from '@heroicons/react/24/outline';

export default function Accueil() {
  const [dashboardStats, setDashboardStats] = useState({
    totalCartons: 0,
    totalArrivage: 0,
    totalVentes: 0,
    totalReturned: 0, // Nouvelle stat pour les mobiles retournés
    totalSentToSupplier: 0, // Nouvelle stat pour les mobiles envoyés au fournisseur
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fonction pour obtenir la date du jour formatée
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  // Fonction pour récupérer les statistiques du tableau de bord
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const response = await fetch('http://localhost:3001/api/reports/dashboard-stats');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération des statistiques du tableau de bord.');
      }
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du tableau de bord:', error);
      setStatsError(`Erreur: ${error.message}`);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(); // Appel au chargement du composant

    // Configuration du chronomètre
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Nettoyage du timer lors du démontage du composant
    return () => clearInterval(timerId);
  }, []);

  // Formatage du temps pour le chronomètre
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="py-10 px-4">
      {/* Styles pour l'animation d'entrée */}
      <style>
        {`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        `}
      </style>

      {/* Appliquer l'animation au conteneur principal du contenu */}
      <div className="animate-fadeInUp">
        {/* Section Date et Heure */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4 border border-gray-100 transform transition-transform duration-300 hover:scale-105">
            <CalendarDaysIcon className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Nous sommes le</p>
              <p className="text-xl font-bold text-gray-800">{getFormattedDate()}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4 border border-gray-100 transform transition-transform duration-300 hover:scale-105">
            <ClockIcon className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Heure Actuelle</p>
              <p className="text-xl font-bold text-gray-800">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-blue-800 text-center mb-8">
          GESTIONS DU STOCKS DES MOBILES
        </h3>

        {statsLoading ? (
          <p className="text-gray-600 text-center">Chargement des statistiques...</p>
        ) : statsError ? (
          <p className="text-red-600 text-center">{statsError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto"> {/* Ajusté pour 5 colonnes */}
            {/* Carte Mobiles en Carton */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-blue-500 mb-3" />
              <p className="text-4xl font-bold text-blue-800">{dashboardStats.totalCartons}</p>
              <p className="text-lg text-gray-600 mt-2">Carton</p>
            </div>

            {/* Carte Mobiles en Arrivage */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-4xl font-bold text-green-800">{dashboardStats.totalArrivage}</p>
              <p className="text-lg text-gray-600 mt-2">Arrivage</p>
            </div>

            {/* Carte Mobiles Vendus */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <CurrencyDollarIcon className="h-12 w-12 text-purple-500 mb-3" />
              <p className="text-4xl font-bold text-purple-800">{dashboardStats.totalVentes}</p>
              <p className="text-lg text-gray-600 mt-2">Vente</p>
            </div>

            {/* Nouvelle Carte Mobiles Retournés */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowPathIcon className="h-12 w-12 text-orange-500 mb-3" />
              <p className="text-4xl font-bold text-red-800">{dashboardStats.totalReturned}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Remplacer</p>
            </div>

            {/* Nouvelle Carte Mobiles Envoyés au Fournisseur */}
            {/* Si vous voulez afficher cette carte, décommentez-la et assurez-vous que la stat est bien renvoyée par le backend */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowPathIcon className="h-12 w-12 text-orange-500 mb-3" />
              <p className="text-4xl font-bold text-orange-800">{dashboardStats.totalSentToSupplier}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Fournisseur</p>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
