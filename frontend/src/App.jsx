import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import Questionnaire from './pages/Questionnaire';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Destinations />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/destination/:id" element={<DestinationDetails />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;