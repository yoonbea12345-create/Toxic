import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppPage from './pages/App';
import AdminPage from './pages/Admin';
import ShareResultPage from './pages/ShareResult';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/share/:id" element={<ShareResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
