import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { PrivateRoute, DeveloperRoute } from './components/Routes';
import Home from './pages/Home';
import Login from './pages/Login';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import AdminPanel from './pages/AdminPanel';
import Developers from './pages/Developers';
import DeveloperDetail from './pages/DeveloperDetail';
import ProfileSettings from './pages/ProfileSettings';
import Chat from './pages/Chat';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout оборачивает все дочерние роуты */}
        <Route path="/" element={<Layout />}>
          
          {/* Публичные роуты */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="developers" element={<Developers />} />
          <Route path="developers/:id" element={<DeveloperDetail />} />
          <Route path="contact" element={<Contact />} />
          {/* Защищенные роуты (Только для авторизованных) */}
          <Route element={<PrivateRoute />}>
              <Route path="chat" element={<Chat />} />
              <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Специфичные роуты (Только для разработчиков) */}
          <Route element={<DeveloperRoute />}>
            <Route path="admin-panel" element={<AdminPanel />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;