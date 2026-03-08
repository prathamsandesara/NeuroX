import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateAssessment from './pages/CandidateAssessment';
import CandidateResult from './pages/CandidateResult';
import CandidateDetail from './pages/CandidateDetail';
import LandingPage from './pages/LandingPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Route>

                    <Route path="/" element={<Layout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="verify-otp" element={<VerifyOTP />} />

                        <Route element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />}>
                            <Route path="recruiter/dashboard" element={<RecruiterDashboard />} />
                            <Route path="recruiter/candidates/:submissionId" element={<CandidateDetail />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
                            <Route path="candidate/dashboard" element={<CandidateDashboard />} />
                            <Route path="candidate/assessment/:assessmentId" element={<CandidateAssessment />} />
                            <Route path="candidate/result/:submissionId" element={<CandidateResult />} />
                        </Route>
                    </Route>
                </Routes>
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
