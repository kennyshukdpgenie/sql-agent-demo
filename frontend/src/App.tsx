import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import OrderInput from './pages/order';
import OrderView from './pages/order-view';
import Analytics from './pages/analytics/Analytics';
import SuitVisualizer from './pages/suit-visualizer/SuitVisualizer';
import Demo from './pages/demo';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
        <Routes>
          {/* Redirect root to /order for order input page */}
          <Route path="/" element={<Navigate to="/order" replace />} />
          
          {/* Main routes */}
          <Route path="/order" element={<OrderInput />} />
          <Route path="/order-view" element={<OrderView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/suit-visualizer" element={<SuitVisualizer />} />
          <Route path="/demo" element={<Demo />} />
          
          {/* Legacy path redirects */}
          <Route path="/orders" element={<Navigate to="/order-view" replace />} />
        </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
