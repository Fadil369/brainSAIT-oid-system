import { BrowserRouter as Router, Routes, Route } from './lib/router';
import Layout from './components/Layout';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const RegisterBadge = lazy(() => import('./pages/RegisterBadge'));
const EditBadge = lazy(() => import('./pages/EditBadge'));
const OidTree = lazy(() => import('./pages/OidTree'));
const ChatAssistant = lazy(() => import('./pages/ChatAssistant'));

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterBadge />} />
            <Route path="/edit/:oid" element={<EditBadge />} />
            <Route path="/oid-tree" element={<OidTree />} />
            <Route path="/chat" element={<ChatAssistant />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
