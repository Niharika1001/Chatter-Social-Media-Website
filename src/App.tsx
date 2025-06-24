import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import QualificationForm from './pages/QualificationForm';
import Result from './pages/Result';
import Suggestions from './pages/Suggestions';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Layout />}>
              <Route index element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="qualification/:level" element={
                <ProtectedRoute>
                  <QualificationForm />
                </ProtectedRoute>
              } />
              <Route path="result" element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              } />
              <Route path="suggestions" element={
                <ProtectedRoute>
                  <Suggestions />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;