import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegisterBadge from './pages/RegisterBadge';
import EditBadge from './pages/EditBadge';
import OidTree from './pages/OidTree';
import ChatAssistant from './pages/ChatAssistant';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterBadge />} />
          <Route path="/edit/:oid" element={<EditBadge />} />
          <Route path="/oid-tree" element={<OidTree />} />
          <Route path="/chat" element={<ChatAssistant />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
