import './styles/style.scss';

import 'rsuite/dist/rsuite.min.css';

import { Route, Navigate, Routes, BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from './providers/AuthProvider';

import Login from './components/login/Login';
import Accounts from './components/accounts/Accounts';
import Stock from './components/stock/Stock';
import PrivateRoute from './components/login/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" exact element={<Login/>} />
          <Route
            path="/accounts"
            element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts/:accountId/stock"
            element={
              <PrivateRoute>
                <Stock/>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/accounts" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
