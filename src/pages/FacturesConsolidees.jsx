import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function FacturesConsolidees() {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = import.meta.env.PROD
    ? 'https://vanchoco-backend-production.up.railway.app'
    : 'http://localhost:3001';

  // Fonction utilitaire pour formater les montants en CFA
  const formatCFA = (amount) => {
    // S'assurer que la valeur est un nombre valide avant de la formater
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || amount === null || amount === undefined) {
      return 'N/A';
    }
    // Utilisez un style `currency` pour un formatage plus fiable
    return numericAmount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF', // Code de devise pour le CFA
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace('XOF', 'CFA'); // Remplacer le code par le symbole
  };

  // Fonction pour récupérer les données de ventes depuis le backend
  const fetchVentes = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const ventesRes = await fetch(`${backendUrl}/api/ventes`);
      if (!ventesRes.ok) {
        const errorData = await ventesRes.json();
        throw new Error(errorData.error || 'Échec de la récupération des données de ventes.');
      }
      const ventesData = await ventesRes.json();
      setVentes(ventesData);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors du chargement de l'historique des ventes: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  // Logique pour regrouper les articles actifs par client pour le tableau principal
  const groupedVentesByClient = {};
  ventes.forEach(vente => {
    // IMPORTANT: On filtre pour n'inclure que les ventes "en détail"
    if (!vente.is_facture_speciale) {
      vente.articles.forEach(item => {
        // Nous ne considérons que les articles actifs pour la facture consolidée
        if (item.statut_vente === 'actif') {
          const clientName = vente.client_nom;
          if (!groupedVentesByClient[clientName]) {
            groupedVentesByClient[clientName] = {
              client_nom: clientName,
              client_telephone: vente.client_telephone,
              articles: [],
              montant_total_consolide: 0,
              montant_paye_consolide: 0
            };
          }
          groupedVentesByClient[clientName].articles.push(item);
          // Calculer le montant total pour tous les articles actifs d'un client
          // S'assurer de convertir en nombre pour un calcul précis
          const prixUnitaire = parseFloat(item.prix_unitaire_vente);
          groupedVentesByClient[clientName].montant_total_consolide += prixUnitaire;
          
          // Ceci est une estimation du montant payé par article.
          // S'assurer de convertir en nombre et de vérifier la division par zéro
          const totalVente = parseFloat(vente.montant_total);
          const montantPaye = parseFloat(vente.montant_paye);
          if (totalVente > 0) {
            groupedVentesByClient[clientName].montant_paye_consolide += (montantPaye / totalVente) * prixUnitaire;
          }
        }
      });
    }
  });

  const clientsWithActiveSales = Object.values(groupedVentesByClient);

  const filteredClients = clientsWithActiveSales.filter(clientData => {
    const totalDue = clientData.montant_total_consolide - clientData.montant_paye_consolide;
    const searchLower = searchTerm.toLowerCase();
    const nameMatches = clientData.client_nom.toLowerCase().includes(searchLower);
    const phoneMatches = clientData.client_telephone && clientData.client_telephone.includes(searchTerm);
    // Filtrer pour n'afficher que les clients avec un solde dû > 0 et qui correspondent au terme de recherche
    return totalDue > 0 && (nameMatches || phoneMatches);
  });

  // Fonction pour gérer l'impression de la facture consolidée
  const handlePrintConsolidatedInvoice = async (client) => {
    try {
      setStatusMessage({ type: 'success', text: `Génération de la facture consolidée pour ${client.client_nom}...` });
      
      const response = await fetch(`${backendUrl}/api/ventes/consolidated-invoice/${encodeURIComponent(client.client_nom)}/pdf`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la génération du PDF : ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setStatusMessage({ type: 'success', text: `Facture consolidée pour ${client.client_nom} générée avec succès.` });

    } catch (error) {
      console.error('Erreur lors de la génération de la facture consolidée:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors de la génération du PDF: ${error.message}` });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto font-sans bg-white sm:bg-gray-50 rounded-xl sm:shadow border border-gray-200 sm:border">
      <style>
        {`
        /* Styles pour l'animation de chargement du bouton (style Apple) */
        @keyframes loading-dot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .loading-dot {
          animation: loading-dot 1.4s infinite ease-in-out both;
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
        }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }

        @media print {
          body * { visibility: hidden; }
          #printableContent, #printableContent * { visibility: visible; }
          #printableContent { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: none; box-shadow: none; border: none; }
          .no-print, .print-hidden { display: none !important; }
          #vite-error-overlay, #react-devtools-content { display: none !important; }
          .overflow-x-auto { overflow-x: visible !important; }
          .min-w-\\[1200px\\] { min-width: unset !important; }
          table { width: 100% !important; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 8pt; white-space: normal; }
          body { font-size: 9pt; }
          .print-header { display: block !important; text-align: center; margin-bottom: 20px; font-size: 16pt; font-weight: bold; color: #333; }
        }
        `}
      </style>

      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center flex items-center justify-center">
        <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
        Factures en detail des clients 
      </h2>

      {statusMessage.text && (
        <div className={`mb-4 p-3 rounded-md flex items-center justify-between text-sm sm:text-base
          ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
          <span>
            {statusMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 inline mr-2" /> : <XCircleIcon className="h-5 w-5 inline mr-2" />}
            {statusMessage.text}
          </span>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="ml-4">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom de client ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="loading-animation flex space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <p className="text-gray-500 text-center text-sm">Aucun client avec des ventes en cours ou partielles trouvé.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <div className="min-w-[800px] table-container">
            <table className="w-full text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium w-[20%]">Client</th>
                  <th className="px-3 py-2 font-medium w-[45%]">Articles en cours</th>
                  <th className="px-3 py-2 font-medium text-right w-[15%]">Total dû estimé</th>
                  <th className="px-3 py-2 text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const articleSummary = client.articles.map(item => {
                    const parts = [item.marque, item.modele];
                    if (item.stockage) parts.push(item.stockage);
                    if (item.imei) parts.push(`IMEI: ${item.imei}`);
                    return parts.join(' ');
                  }).join(' ; ');
                  
                  return (
                    <tr key={client.client_nom} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-900 font-medium">
                        <div className="max-w-[150px] truncate" title={client.client_nom}>
                          {client.client_nom}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-md truncate" title={articleSummary}>
                          {articleSummary}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-red-600 whitespace-nowrap">
                        {formatCFA(client.montant_total_consolide - client.montant_paye_consolide)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handlePrintConsolidatedInvoice(client)}
                          className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition"
                          title="Imprimer la facture consolidée"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
