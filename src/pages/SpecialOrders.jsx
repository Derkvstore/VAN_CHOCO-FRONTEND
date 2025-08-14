import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ArchiveBoxIcon,
  PhoneIcon,
  UserIcon,
  BuildingStorefrontIcon,
  TagIcon,
  CubeIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MARQUES = ["iPhone", "Samsung", "iPad", "AirPod"];
const MODELES = {
  iPhone: [
    "X", "XR", "XS", "XS MAX", "11 SIMPLE", "11 PRO", "11 PRO MAX",
    "12 SIMPLE", "12 MINI", "12 PRO", "12 PRO MAX",
    "13 SIMPLE", "13 MINI", "13 PRO", "13 PRO MAX",
    "14 SIMPLE", "14 PLUS", "14 PRO", "14 PRO MAX",
    "15 SIMPLE", "15 PLUS", "15 PRO", "15 PRO MAX",
    "16 SIMPLE", "16 PLUS", "16 PRO", "16 PRO MAX",
  ],
  Samsung: ["Galaxy S21", "Galaxy S22", "Galaxy A14", "Galaxy Note 20"],
  iPad: ["Air 10éme Gen", "Air 11éme Gen", "Pro", "Mini"],
  AirPod: ["1ère Gen", "2ème Gen", "3ème Gen", "4ème Gen", "Pro 1ème Gen,", "2ème Gen",],
};
const STOCKAGES = ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"];

const STATUS_DISPLAY_MAP = {
  'en_attente': 'EN COURS',
  'commandé': 'COMMANDÉ',
  'reçu': 'REÇU',
  'vendu': 'VENDU',
  'paiement_partiel': 'PARTIEL',
  'annulé': 'ANNULÉ',
  'remplacé': 'REMPLACÉ',
};

export default function SpecialOrders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalSoldBenefice, setTotalSoldBenefice] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderToEditPayment, setCurrentOrderToEditPayment] = useState(null);
  const [newMontantPaye, setNewMontantPaye] = useState('');
  const [paymentModalError, setPaymentModalError] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: "", message: null });
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [returnReasonInput, setReturnReasonInput] = useState('');
  const [confirmModalError, setConfirmModalError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});

  const textareaRef = useRef(null);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [fournisseurName, setFournisseurName] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [stockage, setStockage] = useState('');
  const [type, setType] = useState('TELEPHONE');
  const [typeCarton, setTypeCarton] = useState('');
  const [imei, setImei] = useState('');
  const [prixAchatFournisseur, setPrixAchatFournisseur] = useState('');
  const [prixVenteClient, setPrixVenteClient] = useState('');
  const [statut, setStatut] = useState('en_attente');
  const [raisonAnnulation, setRaisonAnnulation] = useState('');
  const [initialMontantPaye, setInitialMontantPaye] = useState('');

  const backendUrl = import.meta.env.PROD
    ? 'https://vanchoco-backend-production.up.railway.app'
    : 'http://localhost:3001';

  const formatNumberWithSpaces = (number) => {
    if (!number) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parseNumberFromFormattedString = (str) => {
    return str.replace(/\s/g, '');
  };

  const formatCFA = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return 'N/A FCFA';
    }
    const formattedAmount = parseFloat(amount).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return formattedAmount.replace(/,/g, ' ') + ' FCFA';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
      console.error("Date formatting error:", e, "Original string:", dateString);
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'commandé': return 'bg-blue-100 text-blue-800';
      case 'reçu': return 'bg-purple-100 text-purple-800';
      case 'vendu': return 'bg-green-100 text-green-800';
      case 'annulé': return 'bg-red-100 text-red-800';
      case 'remplacé': return 'bg-indigo-100 text-indigo-800';
      case 'paiement_partiel': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchSpecialOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      const response = await axios.get(`${backendUrl}/api/special-orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error loading special orders:', err);
      setErrorOrders('Unable to load special orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchClientsAndFournisseurs = async () => {
    try {
      const clientsRes = await axios.get(`${backendUrl}/api/clients`);
      setClients(clientsRes.data);
      const fournisseursRes = await axios.get(`${backendUrl}/api/fournisseurs`);
      setFournisseurs(fournisseursRes.data);
    } catch (err) {
      console.error('Error loading clients or suppliers:', err);
    }
  };

  useEffect(() => {
    fetchSpecialOrders();
    fetchClientsAndFournisseurs();
  }, []);

  useEffect(() => {
    const foundClient = clients.find(c => c.nom && clientName && c.nom.toLowerCase() === clientName.toLowerCase());
    if (foundClient) {
      setClientPhone(foundClient.telephone || '');
    } else {
      setClientPhone('');
    }
  }, [clientName, clients]);

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setFournisseurName('');
    setMarque('');
    setModele('');
    setStockage('');
    setType('TELEPHONE');
    setTypeCarton('');
    setImei('');
    setPrixAchatFournisseur('');
    setPrixVenteClient('');
    setStatut('en_attente');
    setRaisonAnnulation('');
    setInitialMontantPaye('');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setCurrentOrder(order);
    setClientName(order.client_nom);
    setClientPhone(order.client_telephone || '');
    setFournisseurName(order.fournisseur_nom);
    setMarque(order.marque);
    setModele(order.modele);
    setStockage(order.stockage || '');
    setType(order.type);
    setTypeCarton(order.type_carton || '');
    setImei(order.imei || '');
    setPrixAchatFournisseur(order.prix_achat_fournisseur);
    setPrixVenteClient(order.prix_vente_client);
    setStatut(order.statut);
    setRaisonAnnulation(order.raison_annulation || '');
    setInitialMontantPaye(order.montant_paye);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsFormSubmitting(true);

    const orderData = {
      client_nom: clientName,
      fournisseur_nom: fournisseurName,
      marque,
      modele,
      stockage: stockage || null,
      type,
      type_carton: typeCarton || null,
      imei: imei || null,
      prix_achat_fournisseur: parseFloat(parseNumberFromFormattedString(prixAchatFournisseur)),
      prix_vente_client: parseFloat(parseNumberFromFormattedString(prixVenteClient)),
      montant_paye: parseFloat(parseNumberFromFormattedString(initialMontantPaye || 0))
    };

    try {
      if (currentOrder) {
        await axios.put(`${backendUrl}/api/special-orders/${currentOrder.order_id}/update-status`, {
            statut: statut,
            raison_annulation: raisonAnnulation
        });
        setStatusMessage({ type: 'success', text: 'Special order updated successfully!' });
      } else {
        await axios.post(`${backendUrl}/api/special-orders`, orderData);
        setStatusMessage({ type: 'success', text: 'Special order added successfully!' });
      }
      setIsModalOpen(false);
      fetchSpecialOrders();
    } catch (err) {
      console.error('Error submitting special order:', err);
      setStatusMessage({ type: 'error', text: `Error: ${err.response?.data?.error || err.message}` });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, reason = null) => {
    setStatusMessage({ type: '', text: '' });
    setConfirmModalError('');
    setStatusUpdateLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await axios.put(`${backendUrl}/api/special-orders/${orderId}/update-status`, {
        statut: newStatus,
        raison_annulation: reason
      });
      setStatusMessage({ type: 'success', text: `Le statut de la commande a été mis à jour à "${STATUS_DISPLAY_MAP[newStatus]}"!` });
      closeConfirmModal();
      fetchSpecialOrders();
    } catch (err) {
      console.error(`Error updating order status ${orderId}:`, err);
      setConfirmModalError(`Erreur lors de la mise à jour du statut: ${err.response?.data?.error || err.message}`);
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [orderId]: false }));
      setIsConfirming(false);
    }
  };

  const handleUpdatePaymentClick = (order) => {
    setCurrentOrderToEditPayment(order);
    setNewMontantPaye(formatNumberWithSpaces(order.montant_paye));
    setPaymentModalError('');
    setShowPaymentModal(true);
  };

  const handleConfirmUpdatePayment = async (e) => {
    e.preventDefault();
    setPaymentModalError('');
    setStatusMessage({ type: '', text: '' });
    setIsLoadingPayment(true);

    if (!currentOrderToEditPayment) return;

    const orderId = currentOrderToEditPayment.order_id;
    const prixVenteClient = parseFloat(currentOrderToEditPayment.prix_vente_client);
    const parsedNewMontantPaye = parseFloat(parseNumberFromFormattedString(newMontantPaye));

    if (isNaN(parsedNewMontantPaye) || parsedNewMontantPaye < 0) {
      setPaymentModalError('Le montant payé doit être un nombre positif ou nul.');
      setIsLoadingPayment(false);
      return;
    }

    if (parsedNewMontantPaye > prixVenteClient) {
      setPaymentModalError(`Le montant payé (${formatCFA(parsedNewMontantPaye)}) ne peut pas être supérieur au prix de vente de la commande (${formatCFA(prixVenteClient)}).`);
      setIsLoadingPayment(false);
      return;
    }

    try {
      await axios.put(`${backendUrl}/api/special-orders/${orderId}/update-payment`, {
        new_montant_paye: parsedNewMontantPaye
      });
      setStatusMessage({ type: 'success', text: 'Le paiement de la commande spéciale a été mis à jour avec succès !' });
      setShowPaymentModal(false);
      fetchSpecialOrders();
    } catch (err) {
      console.error('Error updating payment:', err);
      setPaymentModalError(err.response?.data?.error || 'Erreur lors de la mise à jour du paiement.');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const openConfirmModal = (title, message, action) => {
    setConfirmModalContent({ title, message });
    setOnConfirmAction(() => (currentReason) => action(currentReason));
    setConfirmModalError('');
    setReturnReasonInput('');
    setIsConfirming(false);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalContent({ title: "", message: null });
    setOnConfirmAction(null);
    setReturnReasonInput('');
    setConfirmModalError('');
    setIsConfirming(false);
  };

  const handleCancelSpecialOrderClick = (order) => {
    openConfirmModal(
      "Confirmer l'annulation de la commande",
      (
        <>
          <p className="text-gray-700 mb-2 text-sm md:text-base">
            Êtes-vous sûr de vouloir annuler la commande spéciale pour "{order.marque} {order.modele}" du client "{order.client_nom}" ?
            {order.statut === 'vendu' && (
              <span className="font-semibold text-red-600 block mt-1 text-xs md:text-sm">
                Attention : Cette commande est déjà vendue. L'annulation peut nécessiter un remboursement manuel.
              </span>
            )}
          </p>
          <label htmlFor="reasonInput" className="block text-xs font-medium text-gray-700 mb-1 md:text-sm">
            Raison de l'annulation:
          </label>
          <textarea
            ref={textareaRef}
            id="reasonInput"
            value={returnReasonInput}
            onChange={(e) => setReturnReasonInput(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
            placeholder="Ex: Le client a changé d'avis..."
            required
            autoFocus
          ></textarea>
          {confirmModalError && (
            <p className="text-red-500 text-xs mt-1">{confirmModalError}</p>
          )}
        </>
      ),
      (reason) => updateOrderStatus(order.order_id, 'annulé', reason)
    );
  };

  const handleReplaceSpecialOrderClick = (order) => {
    openConfirmModal(
      "Confirmer le remplacement de la commande",
      (
        <>
          <p className="text-gray-700 mb-2 text-sm md:text-base">
            Êtes-vous sûr de vouloir marquer la commande spéciale pour "{order.marque} {order.modele}" comme "Remplacée" ?
          </p>
          <label htmlFor="reasonInput" className="block text-xs font-medium text-gray-700 mb-1 md:text-sm">
            Raison du remplacement:
          </label>
          <textarea
            ref={textareaRef}
            id="reasonInput"
            value={returnReasonInput}
            onChange={(e) => setReturnReasonInput(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            placeholder="Ex: Produit défectueux..."
            required
            autoFocus
          ></textarea>
          {confirmModalError && (
            <p className="text-red-500 text-xs mt-1">{confirmModalError}</p>
          )}
        </>
      ),
      (reason) => updateOrderStatus(order.order_id, 'remplacé', reason)
    );
  };

  useEffect(() => {
    if (showConfirmModal && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showConfirmModal, returnReasonInput]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.client_nom && order.client_nom.toLowerCase().includes(searchLower)) ||
      (order.fournisseur_nom && order.fournisseur_nom.toLowerCase().includes(searchLower)) ||
      (order.marque && order.marque.toLowerCase().includes(searchLower)) ||
      (order.modele && order.modele.toLowerCase().includes(searchLower)) ||
      (order.imei && order.imei.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    const calculatedBenefice = filteredOrders.reduce((sum, order) => {
      if (order.statut === 'vendu') {
        const prixVente = parseFloat(order.prix_vente_client) || 0;
        const prixAchat = parseFloat(order.prix_achat_fournisseur) || 0;
        return sum + (prixVente - prixAchat);
      }
      return sum;
    }, 0);
    setTotalSoldBenefice(calculatedBenefice);
  }, [filteredOrders]);


  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">Gestion des Commandes Spéciales</h2>

      <div className="mt-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg shadow-md text-center mb-4">
        <p className="text-sm sm:text-lg md:text-xl font-semibold">Bénéfice Total des Commandes Spéciales Vendues :</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1">{formatCFA(totalSoldBenefice)}</p>
      </div>

      {statusMessage.text && (
        <div className={`mb-3 p-2 rounded-md flex items-center justify-between text-xs sm:text-sm
          ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
          <span>
            {statusMessage.type === 'success' ? <CheckCircleIcon className="h-4 w-4 inline mr-1" /> : <XCircleIcon className="h-4 w-4 inline mr-1" />}
            {statusMessage.text}
          </span>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="ml-2">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:justify-between space-y-3 md:space-y-0 mb-4">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par client, fournisseur, marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une Commande Spéciale
        </button>
      </div>

      {loadingOrders ? (
        <p className="text-center text-gray-600 text-sm">Chargement des commandes spéciales...</p>
      ) : errorOrders ? (
        <p className="text-center text-red-600 text-sm">{errorOrders}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600 text-sm">Aucune commande spéciale trouvée.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Fournisseur</th>
                <th className="px-4 py-3 text-left">Article</th>
                <th className="px-4 py-3 text-left">IMEI</th>
                <th className="px-4 py-3 text-right">Prix Achat</th>
                <th className="px-4 py-3 text-right">Prix Vente</th>
                <th className="px-4 py-3 text-right">Montant Payé</th>
                <th className="px-4 py-3 text-right">Reste à Payer</th>
                <th className="px-4 py-3 text-left">Date Commande</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 flex items-center">
                      <UserIcon className="h-4 w-4 mr-1 text-gray-500" /> {order.client_nom}
                    </div>
                    <div className="text-gray-500 text-xs flex items-center">
                      <PhoneIcon className="h-3 w-3 mr-1" /> {order.client_telephone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-gray-500" /> {order.fournisseur_nom}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-gray-500" /> {order.marque} {order.modele}
                    </div>
                    <div className="text-gray-500 text-xs flex items-center">
                      <CubeIcon className="h-3 w-3 mr-1" /> {order.stockage || 'N/A'} ({order.type}{order.type_carton ? ` ${order.type_carton}` : ''})
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{order.imei || 'N/A'}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">{formatCFA(order.prix_achat_fournisseur)}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-blue-700">{formatCFA(order.prix_vente_client)}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">{formatCFA(order.montant_paye)}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-red-600">{formatCFA(order.montant_restant)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" /> {formatDate(order.date_commande)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                      {STATUS_DISPLAY_MAP[order.statut] || order.statut}
                    </span>
                    {order.raison_annulation && (
                      <p className="text-xs text-gray-500 mt-1">Raison: {order.raison_annulation}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className="flex space-x-1 justify-center">
                      {(order.statut !== 'vendu' && order.statut !== 'annulé' && order.statut !== 'remplacé') && (
                        <button
                          onClick={() => handleUpdatePaymentClick(order)}
                          className="p-1 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                          title="Modifier Paiement"
                          disabled={isLoadingPayment}
                        >
                           {/* ---------------------------------------------------- */}
                          {/* ➡️ MODIFICATIONS: Bouton de paiement avec loading */}
                          {/* ---------------------------------------------------- */}
                          {isLoadingPayment ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <CurrencyDollarIcon className="h-5 w-5" />}
                          {/* ---------------------------------------------------- */}
                        </button>
                      )}
                      {(order.statut !== 'annulé' && order.statut !== 'remplacé') && (
                        <button
                          onClick={() => handleCancelSpecialOrderClick(order)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Annuler la commande"
                          disabled={statusUpdateLoading[order.order_id]}
                        >
                          {statusUpdateLoading[order.order_id] ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      {order.statut === 'en_attente' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'commandé')}
                          className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Marquer comme Commandé"
                          disabled={statusUpdateLoading[order.order_id]}
                        >
                          {statusUpdateLoading[order.order_id] ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <TruckIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      {order.statut === 'commandé' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'reçu')}
                          className="p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                          title="Marquer comme Reçu"
                          disabled={statusUpdateLoading[order.order_id]}
                        >
                          {statusUpdateLoading[order.order_id] ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <ArchiveBoxIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      {(order.statut === 'reçu' || order.statut === 'paiement_partiel') && parseFloat(order.montant_restant) <= 0 && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'vendu')}
                          className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          title="Marquer comme Vendu"
                          disabled={statusUpdateLoading[order.order_id]}
                        >
                          {statusUpdateLoading[order.order_id] ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      {(order.statut === 'vendu' || order.statut === 'reçu' || order.statut === 'paiement_partiel') && (
                        <button
                          onClick={() => handleReplaceSpecialOrderClick(order)}
                          className="p-1 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                          title="Marquer comme Remplacé (Retourner)"
                          disabled={statusUpdateLoading[order.order_id]}
                        >
                          {statusUpdateLoading[order.order_id] ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowPathIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
              {currentOrder ? 'Modifier la Commande Spéciale' : 'Ajouter une Nouvelle Commande Spéciale'}
            </h3>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="clientName" className="block text-xs sm:text-sm font-medium text-gray-700">Nom du Client</label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  list="client-names"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="client-names">
                  {clients.map(client => (
                    <option key={client.id} value={client.nom} />
                  ))}
                </datalist>
                {clientPhone && <p className="text-[10px] text-gray-500 mt-0.5">Téléphone: {clientPhone}</p>}
              </div>

              <div>
                <label htmlFor="fournisseurName" className="block text-xs sm:text-sm font-medium text-gray-700">Nom du Fournisseur</label>
                <input
                  type="text"
                  id="fournisseurName"
                  value={fournisseurName}
                  onChange={(e) => setFournisseurName(e.target.value)}
                  list="fournisseur-names"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="fournisseur-names">
                  {fournisseurs.map(fournisseur => (
                    <option key={fournisseur.id} value={fournisseur.nom} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="marque" className="block text-xs sm:text-sm font-medium text-gray-700">Marque</label>
                <input
                  type="text"
                  id="marque"
                  value={marque}
                  onChange={(e) => {
                    setMarque(e.target.value);
                    setModele('');
                  }}
                  list="marque-list"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="marque-list">
                  {MARQUES.map(item => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="modele" className="block text-xs sm:text-sm font-medium text-gray-700">Modèle</label>
                <input
                  type="text"
                  id="modele"
                  value={modele}
                  onChange={(e) => setModele(e.target.value)}
                  list="modele-list"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={!marque}
                />
                <datalist id="modele-list">
                  {marque && MODELES[marque] && MODELES[marque].map(item => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="stockage" className="block text-xs sm:text-sm font-medium text-gray-700">Stockage (Go)</label>
                <input
                  type="text"
                  id="stockage"
                  value={stockage}
                  onChange={(e) => setStockage(e.target.value)}
                  list="stockage-list"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="stockage-list">
                  {STOCKAGES.map(item => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="TELEPHONE">TÉLÉPHONE</option>
                  <option value="ACCESSOIRE">ACCESSOIRE</option>
                  <option value="CARTON">CARTON</option>
                  <option value="ARRIVAGE">ARRIVAGE</option>
                </select>
              </div>

              {type === 'CARTON' && (
                <div>
                  <label htmlFor="typeCarton" className="block text-xs sm:text-sm font-medium text-gray-700">Type Carton</label>
                  <input
                    type="text"
                    id="typeCarton"
                    value={typeCarton}
                    onChange={(e) => setTypeCarton(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="imei" className="block text-xs sm:text-sm font-medium text-gray-700">IMEI (optional)</label>
                <input
                  type="text"
                  id="imei"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  maxLength="6"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="prixAchatFournisseur" className="block text-xs sm:text-sm font-medium text-gray-700">Prix Achat Fournisseur (CFA)</label>
                <input
                  type="text"
                  id="prixAchatFournisseur"
                  value={prixAchatFournisseur}
                  onChange={(e) => {
                    const value = parseNumberFromFormattedString(e.target.value);
                    if (!isNaN(value)) {
                      setPrixAchatFournisseur(formatNumberWithSpaces(value));
                    }
                  }}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="prixVenteClient" className="block text-xs sm:text-sm font-medium text-gray-700">Prix Vente Client (CFA)</label>
                <input
                  type="text"
                  id="prixVenteClient"
                  value={prixVenteClient}
                  onChange={(e) => {
                    const value = parseNumberFromFormattedString(e.target.value);
                    if (!isNaN(value)) {
                      setPrixVenteClient(formatNumberWithSpaces(value));
                    }
                  }}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {!currentOrder && (
                <div>
                  <label htmlFor="initialMontantPaye" className="block text-xs sm:text-sm font-medium text-gray-700">Montant Payé Initial (CFA)</label>
                  <input
                    type="text"
                    id="initialMontantPaye"
                    value={initialMontantPaye}
                    onChange={(e) => {
                      const value = parseNumberFromFormattedString(e.target.value);
                      if (!isNaN(value)) {
                        setInitialMontantPaye(formatNumberWithSpaces(value));
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isFormSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isFormSubmitting}
                >
                  {isFormSubmitting ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    currentOrder ? 'Mettre à jour' : 'Ajouter la Commande'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && currentOrderToEditPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Modifier Paiement Commande Spéciale</h3>
            <form onSubmit={handleConfirmUpdatePayment}>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Client: <span className="font-semibold">{currentOrderToEditPayment.client_nom}</span>
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Article: <span className="font-semibold">{currentOrderToEditPayment.marque} {currentOrderToEditPayment.modele}</span>
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Prix de Vente Total: <span className="font-semibold">{formatCFA(currentOrderToEditPayment.prix_vente_client)}</span>
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  Montant Actuellement Payé: <span className="font-semibold">{formatCFA(currentOrderToEditPayment.montant_paye)}</span>
                </p>
                <label htmlFor="newMontantPaye" className="block text-sm font-medium text-gray-700">Nouveau Montant Payé Total (FCFA)</label>
                <input
                  type="text"
                  id="newMontantPaye"
                  value={newMontantPaye}
                  onChange={(e) => {
                    const value = parseNumberFromFormattedString(e.target.value);
                    if (!isNaN(value)) {
                      setNewMontantPaye(formatNumberWithSpaces(value));
                    }
                  }}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {paymentModalError && (
                <p className="text-red-600 text-sm mb-4">{paymentModalError}</p>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoadingPayment}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isLoadingPayment}
                >
                  {isLoadingPayment ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Confirmer le Paiement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-xs sm:max-w-sm w-full relative z-[60] pointer-events-auto">
             {/* ---------------------------------------------------- */}
            {/* ➡️ MODIFICATIONS: Titres et messages traduits */}
            {/* ---------------------------------------------------- */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{confirmModalContent.title}</h3>
            {typeof confirmModalContent.message === 'string' ? (
              <p className="text-sm text-gray-700 mb-4">{confirmModalContent.message}</p>
            ) : (
              <div className="text-sm text-gray-700 mb-4">{confirmModalContent.message}</div>
            )}
            {/* ---------------------------------------------------- */}
            {confirmModalError && (
              <p className="text-red-500 text-xs mt-1">{confirmModalError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                disabled={isConfirming}
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirmAction(returnReasonInput)}
                className={`px-4 py-2 text-sm rounded-md transition ${
                  isConfirming || (confirmModalContent.message && typeof confirmModalContent.message !== 'string' && !returnReasonInput.trim())
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={isConfirming || (confirmModalContent.message && typeof confirmModalContent.message !== 'string' && !returnReasonInput.trim())}
              >
                {isConfirming ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}