import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from './pages/Home';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import HistoryPage from './pages/History';
import Admin from './pages/Admin';
import ClientLogin from './pages/ClientLogin';
import Demo from './pages/Demo';
import RequestAccount from './pages/RequestAccount';
import PrivateContacts from './pages/PrivateContacts';
import MessageTemplatePage from './pages/MessageTemplate';
import VoiceAnnouncements from './pages/VoiceAnnouncements';
import Dialer from './pages/Dialer';
import EchoIntelligence from './pages/EchoIntelligence';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
    {/* Add your page Route elements here */}
    <Route path="/demo" element={<Demo />} />
    <Route path="/signup" element={<RequestAccount />} />
    <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/demo" replace />} />}>
      <Route path="/" element={<Home />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/history" element={<HistoryPage />} />
    <Route path="/private-contacts" element={<PrivateContacts />} />
    <Route path="/message-template" element={<MessageTemplatePage />} />
    <Route path="/voice-announcements" element={<VoiceAnnouncements />} />
    <Route path="/dialer" element={<Dialer />} />
    <Route path="/intelligence" element={<EchoIntelligence />} />
    <Route path="/admin" element={<Admin />} />
    </Route>
    <Route path="/client-login" element={<ClientLogin />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App