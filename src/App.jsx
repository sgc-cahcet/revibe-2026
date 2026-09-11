import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/navigation/Header";
import Footer from "./components/Footer";
import SoundToggle from "./components/SoundToggle";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import About from "./pages/About";
import Team from "./pages/Team";
import Location from "./pages/Location";
import Login from "./pages/Login";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
// import Register from "./pages/Register";
import OD from "./pages/OD";
import Canteen from "./pages/Canteen";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="app-shell">
        <Header />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/location" element={<Location />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coordinator"
              element={
                <ProtectedRoute allowedRoles={["coordinator"]}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/od" element={<OD />} />
            <Route path="/canteen" element={<Canteen />} />

            <Route
              path="/confirmation/:registrationNumber"
              element={<Confirmation />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <SoundToggle />
      </div>
    </BrowserRouter>
  );
}

export default App;