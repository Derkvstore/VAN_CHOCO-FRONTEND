import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function RapportJournalier() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = import.meta.env.PROD
    ? 'https://vanchoco-backend-production.up.railway.app'
    : 'http://localhost:3001';

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${backendUrl}/api/reports/daily-stock-comparison`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erreur réseau');
        }
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du rapport journalier:", err);
        setError(`Impossible de charger le rapport : ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const filteredData = reportData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const productIdentifier = `${item.marque} ${item.modele} ${item.stockage || ''} ${item.type} ${item.type_carton || ''}`.toLowerCase();
    return productIdentifier.includes(searchLower);
  });

  const handlePrint = () => {
    window.print();
  };

  // Fonction pour afficher le statut du stock avec des couleurs
  const renderStockStatus = (stock) => {
    if (stock <= 0) {
      return <span className="px-2 py-1 text-xs font-semibold leading-5 rounded-full bg-red-100 text-red-800">En rupture</span>;
    }
    if (stock > 0 && stock <= 5) {
      return <span className="px-2 py-1 text-xs font-semibold leading-5 rounded-full bg-yellow-100 text-yellow-800">Stock faible</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">Disponible</span>;
  };

  return (
    <div id="printableContent" className="p-4 sm:p-6 font-sans bg-gray-50 rounded-xl shadow-md border border-gray-200">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printableContent, #printableContent * { visibility: visible; }
          #printableContent { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; box-shadow: none; border: none; }
          .no-print { display: none !important; }
          table { width: 100% !important; border-collapse: collapse; font-size: 9pt; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f8f8f8; }
          .print-header { display: block !important; text-align: center; margin-bottom: 20px; font-size: 16pt; font-weight: bold; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center print-header">
          <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2 no-print" />
          Rapport Journalier des Stocks - {getFormattedDate()}
        </h2>
        <button onClick={handlePrint} className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium no-print">
          <PrinterIcon className="h-5 w-5 mr-2" />
          Imprimer
        </button>
      </div>

      <div className="mb-6 flex justify-center no-print">
        <div className="relative w-full max-w-lg">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Skeleton height={40} />
          <Skeleton height={30} count={5} />
        </div>
      )}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow-md border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Produit</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Hier</th>
                <th className="py-3 px-4 font-semibold text-center">Mouvements du Jour</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Aujourd'hui</th>
                <th className="py-3 px-4 font-semibold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.marque} {item.modele}</div>
                    <div className="text-xs text-gray-500">
                      {item.stockage || ''} {item.type} {item.type_carton || ''}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center text-lg font-medium text-gray-700">{item.stock_hier}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center space-x-3 text-xs">
                      {item.ajouts_jour > 0 && <span title="Ajouts" className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full"><ArrowUpIcon className="h-3 w-3 mr-1"/> +{item.ajouts_jour}</span>}
                      {item.ventes_jour > 0 && <span title="Ventes" className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full"><ArrowDownIcon className="h-3 w-3 mr-1"/> -{item.ventes_jour}</span>}
                      {item.retours_jour > 0 && <span title="Retours Défectueux" className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"><ArrowPathIcon className="h-3 w-3 mr-1"/> +{item.retours_jour}</span>}
                      {item.rendus_jour > 0 && <span title="Rendus (Stock)" className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full"><ArrowUturnLeftIcon className="h-3 w-3 mr-1"/> +{item.rendus_jour}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center text-lg font-bold text-blue-700">{item.stock_aujourdhui}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">{renderStockStatus(item.stock_aujourdhui)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">Aucun produit trouvé ou aucun mouvement de stock aujourd'hui.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
