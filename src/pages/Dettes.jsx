import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Dettes() {
  const [dettes, setDettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la modale de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const backendUrl = import.meta.env.PROD
    ? 'https://vanchoco-backend-production.up.railway.app'
    : 'http://localhost:3001';

  const formatCFA = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return '0 CFA';
    }
    return Math.round(parseFloat(amount)).toLocaleString('fr-FR') + ' CFA';
  };

  const fetchDettes = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${backendUrl}/api/dettes`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération des dettes.');
      }
      const data = await response.json();
      setDettes(data);
    } catch (error)
    {
      console.error('Erreur lors du chargement des dettes:', error);
      setStatusMessage({ type: 'error', text: `Erreur: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDettes();
  }, []);

  const handleOpenPaymentModal = (client) => {
    setCurrentClient(client);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentClient(null);
    setPaymentAmount('');
    setIsProcessingPayment(false);
  };

  const handleConfirmPayment = async () => {
    if (!currentClient || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      setStatusMessage({ type: 'error', text: 'Veuillez entrer un montant de paiement valide.' });
      return;
    }

    setIsProcessingPayment(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${backendUrl}/api/dettes/paiement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: currentClient.client_id,
          montant_encaisse: parseFloat(paymentAmount)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchDettes(); // Rafraîchir la liste des dettes
        handleClosePaymentModal();
      } else {
        throw new Error(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'encaissement du paiement:', error);
      // Afficher l'erreur dans la modale pour une meilleure UX
      setStatusMessage({ type: 'error', text: `Erreur: ${error.message}` });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const filteredDettes = dettes.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    return (
      d.client_nom.toLowerCase().includes(searchLower) ||
      (d.client_telephone && d.client_telephone.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 sm:p-6 font-sans bg-gray-50 rounded-xl shadow-md border border-gray-200">
       <style>{`
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
      `}</style>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <UserGroupIcon className="h-7 w-7 text-red-600 mr-2" />
        Gestion des Dettes Clients
      </h2>

      {statusMessage.text && (
        <div className={`mb-4 p-3 rounded-md flex items-center justify-between text-sm
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

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un client par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton height={40} count={5} />
        </div>
      ) : filteredDettes.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Aucun client avec une dette active trouvé.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Nom du Client</th>
                <th className="py-3 px-4 font-semibold">Téléphone</th>
                <th className="py-3 px-4 font-semibold text-right">Dette Totale</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDettes.map((d) => (
                <tr key={d.client_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{d.client_nom}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600">{d.client_telephone || 'N/A'}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-right text-lg font-bold text-red-600">{formatCFA(d.dette_totale)}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleOpenPaymentModal(d)}
                      className="flex items-center justify-center mx-auto px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium text-xs shadow"
                    >
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      Encaisser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale d'encaissement de paiement */}
      {showPaymentModal && currentClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Encaisser un Paiement</h3>
            <p className="text-sm text-gray-600 mb-4">Client: <span className="font-semibold">{currentClient.client_nom}</span></p>
            <p className="text-md text-red-600 mb-4">Dette actuelle: <span className="font-bold">{formatCFA(currentClient.dette_totale)}</span></p>

            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Montant Encaissé (CFA) *</label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: 300000"
                min="1"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleClosePaymentModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={isProcessingPayment}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPayment}
                className={`px-4 py-2 rounded-md transition flex items-center justify-center font-medium shadow-md
                  ${isProcessingPayment ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                  </>
                ) : (
                  'Confirmer le Paiement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
