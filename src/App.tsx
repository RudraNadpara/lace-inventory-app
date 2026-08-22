import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ClipboardList, FilePlus2, QrCode, BarChart3 } from 'lucide-react';
import LaceInventoryDashboard from './components/LaceInventoryDashboard';
import EntryPage from './components/EntryPage';
import BarcodeGeneratePage from './components/BarcodeGeneratePage';
import StockReportPage from './components/StockReportPage'; // 1. ADDED IMPORT

function Navbar() {
  const navigation = [
    { to: '/', label: 'Scan', icon: ClipboardList, end: true },
    { to: '/entry', label: 'Add design', icon: FilePlus2 },
    { to: '/labels', label: 'Labels', icon: QrCode },
    { to: '/report', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="app-nav">
      <div className="app-nav__inner">
        <div className="brand-mark"><span className="brand-mark__dot" /> LACE <span>ERP</span></div>
        <div className="app-nav__status"><span /> Live inventory</div>
      </div>
      <div className="app-tabs">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `app-tab${isActive ? ' app-tab--active' : ''}`}>
            <Icon size={19} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-background">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LaceInventoryDashboard />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/labels" element={<BarcodeGeneratePage />} />
            {/* 2. ADDED THE ROUTE TO MATCH THE NAVBAR LINK */}
            <Route path="/report" element={<StockReportPage />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}