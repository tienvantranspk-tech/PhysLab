import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Screens
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import SimulationScreen from './screens/SimulationScreen';
import LabScreen from './screens/LabScreen';
import MissionsScreen from './screens/MissionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import FreeFallLab from './simulations/FreeFallLab';
import PendulumLab from './simulations/PendulumLab';
import PrismLab from './simulations/PrismLab';
import MirrorLab from './simulations/MirrorLab';
import OhmLab from './simulations/OhmLab';
import InclinedPlaneLab from './simulations/InclinedPlaneLab';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone screens */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />

          {/* Main Layout (with bottom nav + header) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/lab" element={<LabScreen />} />
            <Route path="/missions" element={<MissionsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>

          {/* Immersive Physics Labs */}
          <Route path="/simulation" element={<SimulationScreen />} />
          <Route path="/simulation/:id" element={<SimulationScreen />} />
          <Route path="/lab/freefall" element={<FreeFallLab />} />
          <Route path="/lab/pendulum" element={<PendulumLab />} />
          <Route path="/lab/prism" element={<PrismLab />} />
          <Route path="/lab/mirror" element={<MirrorLab />} />
          <Route path="/lab/ohm" element={<OhmLab />} />
          <Route path="/lab/incline" element={<InclinedPlaneLab />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
