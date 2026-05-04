import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import Questionnaire from './pages/Questionnaire';
import TripPlans from './pages/TripPlans';
import CreateTripPlan from './pages/CreateTripPlan';
import TripPlanDetails from './pages/TripPlanDetails';
import ComparePlans from './pages/ComparePlans';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Destinations />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/destination/:id" element={<DestinationDetails />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/trip-plans" element={<TripPlans />} />
        <Route path="/trip-plans/create" element={<CreateTripPlan />} />
        <Route path="/trip-plans/compare" element={<ComparePlans />} />
        <Route path="/trip-plans/:id" element={<TripPlanDetails />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
