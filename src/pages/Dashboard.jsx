// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  ClipboardDocumentListIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

// Importez vos composants de section ici avec les chemins corrects
import Clients from './Clients.jsx';
import Products from './Products.jsx';
import NouvelleVente from './NouvelleVentes.jsx';
import Sorties from './Sorties.jsx';
import Liste from './Listes.jsx';
import Rapport from './Rapport.jsx';
import Accueil from './Accueil.jsx';
import RetoursMobiles from './RetoursMobiles.jsx';
import RemplacementsFournisseur from './RemplacementsFournisseur.jsx';
import Recherche from './Recherche.jsx';
import Fournisseurs from './Fournisseurs.jsx';
import Factures from './Factures.jsx';
import Benefices from '../pages/Benefices.jsx';
import RapportJournalier from './RapportJournalier.jsx';
import SpecialOrders from '../pages/SpecialOrders.jsx';
import FacturesConsolidees from './FacturesConsolidees.jsx';

// J'ai mis à jour ce tableau pour inclure "Accueil"
const sections = [
  { name: 'Accueil', icon: HomeIcon },
  { name: 'Produits', icon: CubeIcon },
  { name: 'Vente', icon: PlusCircleIcon },
  { name: 'Sorties', icon: ClockIcon },
  { name: 'Factures Clts', icon: DocumentTextIcon },
  { name: 'Factures Gros', icon: ListBulletIcon },
  { name: 'Recherche', icon: MagnifyingGlassIcon },
  { name: 'Clients', icon: UserGroupIcon },
  { name: 'Fournisseurs', icon: TruckIcon },
  { name: 'Bénéfices', icon: CurrencyDollarIcon },
  { name: 'Dettes', icon: Bars3Icon },
  { name: 'Rapport', icon: ChartBarIcon },
  { name: 'Mouvement', icon: CalendarDaysIcon },
  { name: 'Retour', icon: ArrowLeftIcon },
  { name: 'Rtrs Frns', icon: ArrowsRightLeftIcon },
  { name: 'Achat', icon: ClipboardDocumentListIcon }
];

export default function Dashboard() {
  const [active, setActive] = useState(() => {
    const savedSection = localStorage.getItem('activeSection');
    return savedSection || 'Accueil';
  });
  const [displayedName, setDisplayedName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedFullName = localStorage.getItem('fullName');
    const storedUsername = localStorage.getItem('username');

    if (storedFullName) {
      setDisplayedName(storedFullName);
    } else if (storedUsername) {
      setDisplayedName(storedUsername);
    } else {
      navigate('/');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [navigate, isDarkMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const handleSectionClick = (name) => {
    setActive(name);
    localStorage.setItem('activeSection', name);
    setIsMenuOpen(false);
  };

  const renderSection = () => {
    try {
      switch (active) {
        case 'Clients':
          return <Clients />;
        case 'Produits':
          return <Products />;
        case 'Vente':
          return <NouvelleVente />;
        case 'Sorties':
          return <Sorties />;
        case 'Recherche':
          return <Recherche />;
        case 'Factures Clts':
          return <FacturesConsolidees />;
            case 'Factures Gros':
          return <Factures />;
        case 'Bénéfices':
          return <Benefices />;
        case 'Achat':
          return <SpecialOrders />;
        case 'Retour':
          return <RetoursMobiles />;
        case 'Fournisseurs':
          return <Fournisseurs />;
        case 'Rtrs Frns':
          return <RemplacementsFournisseur />;
        case 'Dettes':
          return <Liste />;
        case 'Rapport':
          return <Rapport />;
        case 'Mouvement':
          return <RapportJournalier />;
        case 'Accueil':
          return <Accueil />;
        default:
          return <Accueil />;
      }
    } catch (error) {
      console.error(`Erreur de rendu du composant "${active}":`, error);
      return (
        <div className="p-4 sm:p-8 text-center text-red-500">
          <h3 className="text-xl font-bold mb-4">Erreur de chargement</h3>
          <p>Le composant "{active}" n'a pas pu être affiché correctement. Veuillez vérifier les logs de la console pour plus de détails.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-blue-50 text-blue-900 font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Menu de navigation (latéral sur desktop, glissant sur mobile) */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 dark:bg-gray-800 dark:text-gray-100
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:static sm:translate-x-0 sm:flex sm:flex-col sm:p-6`}
      >
        <div className="flex justify-end p-4 sm:hidden">
          <button onClick={() => setIsMenuOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        <ul className="flex flex-col space-y-4 p-6 sm:p-0">
          {sections.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button
                onClick={() => handleSectionClick(name)}
                className={`flex items-center w-full p-3 rounded-lg transition-colors
                  ${active === name
                    ? 'bg-blue-200 text-blue-900 font-semibold shadow dark:bg-blue-800 dark:text-white'
                    : 'text-blue-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="h-6 w-6 mr-3" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* En-tête du tableau de bord */}
        <header className="flex justify-between items-center bg-white shadow-md p-4 sticky top-0 z-10 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="mr-4 text-blue-700 dark:text-white sm:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-blue-700 mr-4 dark:text-white transition-colors duration-300 truncate">I STORE VAN CHOCO</h1>
          </div>

          {displayedName && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <p className="text-sm sm:text-lg text-blue-800 dark:text-gray-200 hidden sm:block truncate">
                Bienvenue, <span className="font-bold">{displayedName}</span>!
              </p>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-blue-700 hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-white dark:hover:bg-red-800"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Se déconnecter</span>
              </button>
            </div>
          )}
        </header>

        {/* Contenu principal */}
        <main className="flex-grow p-4 sm:p-10 overflow-y-auto max-h-screen">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200 truncate">
            {active}
          </h2>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 min-h-[400px] dark:bg-gray-700 dark:text-gray-100">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}