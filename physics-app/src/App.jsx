import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import SimulationScreen from './screens/SimulationScreen';

import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/simulation" element={<SimulationScreen />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
