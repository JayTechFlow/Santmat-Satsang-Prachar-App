import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Banners } from './pages/Banners';
import { Quotes } from './pages/Quotes';
import { Audio } from './pages/Audio';
import { Satsang } from './pages/Satsang';
import { Books } from './pages/Books';
import { Notifications } from './pages/Notifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="banners" element={<Banners />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="audio" element={<Audio />} />
          <Route path="satsang" element={<Satsang />} />
          <Route path="books" element={<Books />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
