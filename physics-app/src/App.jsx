import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Core screens (loaded eagerly — small + always needed)
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LabScreen from './screens/LabScreen';
import MissionsScreen from './screens/MissionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import AchievementScreen from './screens/AchievementScreen';

// Loading skeleton for lazy-loaded labs
import LabLoadingScreen from './components/LabLoadingScreen';

// Legacy simulation screen (eagerly loaded since it's the fallback)
import SimulationScreen from './screens/SimulationScreen';

// ──────────────────────────────────────────────
// All physics labs — lazy loaded (code-split)
// Each lab is ~10-20KB, only fetched when user navigates to it.
// ──────────────────────────────────────────────
const FreeFallLab = React.lazy(() => import('./simulations/FreeFallLab'));
const PendulumLab = React.lazy(() => import('./simulations/PendulumLab'));
const PrismLab = React.lazy(() => import('./simulations/PrismLab'));
const MirrorLab = React.lazy(() => import('./simulations/MirrorLab'));
const OhmLab = React.lazy(() => import('./simulations/OhmLab'));
const InclinedPlaneLab = React.lazy(() => import('./simulations/InclinedPlaneLab'));
const CircuitBuilderLab = React.lazy(() => import('./simulations/CircuitBuilderLab'));
const OpticsBenchLab = React.lazy(() => import('./simulations/OpticsBenchLab'));
const HookeLab = React.lazy(() => import('./simulations/HookeLab'));
const ProjectileLab = React.lazy(() => import('./simulations/ProjectileLab'));
const CollisionLab = React.lazy(() => import('./simulations/CollisionLab'));
const ArchimedesLab = React.lazy(() => import('./simulations/ArchimedesLab'));
const FaradayLab = React.lazy(() => import('./simulations/FaradayLab'));
const RlcLab = React.lazy(() => import('./simulations/RlcLab'));
const ShmLab = React.lazy(() => import('./simulations/ShmLab'));
const YoungInterferenceLab = React.lazy(() => import('./simulations/YoungInterferenceLab'));
const NuclearDecayLab = React.lazy(() => import('./simulations/NuclearDecayLab'));
const ThermoLab = React.lazy(() => import('./simulations/ThermoLab'));
const WaveLab = React.lazy(() => import('./simulations/WaveLab'));

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone screens */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/achievement/:lessonId" element={<AchievementScreen />} />

          {/* Main Layout (with bottom nav + header) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/lab" element={<LabScreen />} />
            <Route path="/missions" element={<MissionsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>

          {/* Legacy simulation fallback */}
          <Route path="/simulation" element={<SimulationScreen />} />
          <Route path="/simulation/:id" element={<SimulationScreen />} />

          {/* ─── Immersive Physics Labs (lazy-loaded with skeleton) ─── */}
          {/* Original 6 labs */}
          <Route path="/lab/freefall" element={<Suspense fallback={<LabLoadingScreen />}><FreeFallLab /></Suspense>} />
          <Route path="/lab/pendulum" element={<Suspense fallback={<LabLoadingScreen />}><PendulumLab /></Suspense>} />
          <Route path="/lab/prism" element={<Suspense fallback={<LabLoadingScreen />}><PrismLab /></Suspense>} />
          <Route path="/lab/mirror" element={<Suspense fallback={<LabLoadingScreen />}><MirrorLab /></Suspense>} />
          <Route path="/lab/ohm" element={<Suspense fallback={<LabLoadingScreen />}><OhmLab /></Suspense>} />
          <Route path="/lab/incline" element={<Suspense fallback={<LabLoadingScreen />}><InclinedPlaneLab /></Suspense>} />

          {/* New 11 labs */}
          <Route path="/lab/circuit" element={<Suspense fallback={<LabLoadingScreen />}><CircuitBuilderLab /></Suspense>} />
          <Route path="/lab/optics" element={<Suspense fallback={<LabLoadingScreen />}><OpticsBenchLab /></Suspense>} />
          <Route path="/lab/hooke" element={<Suspense fallback={<LabLoadingScreen />}><HookeLab /></Suspense>} />
          <Route path="/lab/projectile" element={<Suspense fallback={<LabLoadingScreen />}><ProjectileLab /></Suspense>} />
          <Route path="/lab/collision" element={<Suspense fallback={<LabLoadingScreen />}><CollisionLab /></Suspense>} />
          <Route path="/lab/archimedes" element={<Suspense fallback={<LabLoadingScreen />}><ArchimedesLab /></Suspense>} />
          <Route path="/lab/faraday" element={<Suspense fallback={<LabLoadingScreen />}><FaradayLab /></Suspense>} />
          <Route path="/lab/rlc" element={<Suspense fallback={<LabLoadingScreen />}><RlcLab /></Suspense>} />
          <Route path="/lab/shm" element={<Suspense fallback={<LabLoadingScreen />}><ShmLab /></Suspense>} />
          <Route path="/lab/young" element={<Suspense fallback={<LabLoadingScreen />}><YoungInterferenceLab /></Suspense>} />
          <Route path="/lab/decay" element={<Suspense fallback={<LabLoadingScreen />}><NuclearDecayLab /></Suspense>} />
          <Route path="/lab/thermo" element={<Suspense fallback={<LabLoadingScreen />}><ThermoLab /></Suspense>} />
          <Route path="/lab/wave" element={<Suspense fallback={<LabLoadingScreen />}><WaveLab /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
