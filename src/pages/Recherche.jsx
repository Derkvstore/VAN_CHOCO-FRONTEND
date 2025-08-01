import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon, XCircleIcon, CubeIcon } from '@heroicons/react/24/outline';

// Fonction utilitaire pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalide';
    }
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalide';
  }
};

export default function Recherche() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Fonction pour charger les produits depuis le backend
  const fetchProducts = async (term) => {
    if (!term.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Envoie le terme de recherche au backend.
      // Le backend mis à jour filtrera les produits.
      const response = await fetch(`http://localhost:3001/api/products?search=${encodeURIComponent(term)}`);

      if (!response.ok) {
        throw new Error('Échec de la récupération des produits.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur lors de la recherche des produits:", err);
      setError("Erreur lors de la recherche des produits: " + err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Utilisez un effet pour déclencher la recherche après un court délai
  // (debounce) pour éviter d'appeler l'API à chaque frappe de touche.
  useEffect(() => {
    if (!searchTerm) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    const timerId = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-600 mr-2" />
        Recherche de Produits
      </h3>

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par marque, modèle, IMEI, stockage, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              title="Effacer la recherche"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-600">Chargement des produits...</p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && hasSearched && products.length === 0 && (
        <p className="text-center text-gray-600">Aucun produit trouvé pour "{searchTerm}".</p>
      )}

      {!loading && !error && !hasSearched && searchTerm === '' && (
        <p className="text-center text-gray-600">Veuillez entrer un terme de recherche pour afficher les produits.</p>
      )}

      {!loading && !error && hasSearched && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <CubeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {product.marque} {product.modele}
                </h4>
              </div>

              <div className="space-y-2 text-gray-700 text-sm">
                <p><strong>IMEI:</strong> {product.imei || 'N/A'}</p>
                <p>
                  <strong>Fournisseur:</strong> {product.fournisseur || 'N/A'}
                </p>
                <p>
                  <strong>CLASSE:</strong> {product.type || 'N/A'}
                  {product.type === "CARTON" && product.type_carton ? ` (${product.type_carton})` : ""}
                </p>
                <p>
                  <strong>Stockage:</strong> {product.stockage || 'N/A'} (GO)
                </p>
                <p>
                  <strong>Date d'arrivée:</strong> {formatDate(product.date_ajout)}
                </p>
                <div className="flex items-center pt-2">
                  {product.status === 'active' ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" /> Disponible
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <XCircleIcon className="h-4 w-4 mr-1" /> Non disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
