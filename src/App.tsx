import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LogWorkout } from './pages/LogWorkout';
import { EditWorkout } from './pages/EditWorkout';
import { ViewWorkout } from './pages/ViewWorkout';
import { History } from './pages/History';
import { Calendar } from './pages/Calendar';

// Get base path from Vite config (matches vite.config.ts)
const basePath = import.meta.env.BASE_URL || '/';

function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter basename={basePath}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<LogWorkout />} />
            <Route path="workout/:id" element={<ViewWorkout />} />
            <Route path="edit/:id" element={<EditWorkout />} />
            <Route path="history" element={<History />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  );
}

export default App;
