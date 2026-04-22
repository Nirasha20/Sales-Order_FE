import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SalesOrder from './pages/SalesOrder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/salesorder" element={<SalesOrder />} />
        <Route path="/salesorder/:id" element={<SalesOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;