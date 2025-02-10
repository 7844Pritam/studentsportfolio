import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPages from "./pages/LandingPages";
import UserLayout from "./pages/UserLayout";
import AdminLayout from "./admin/AdminLayout";
import AdminPanel from "./admin/AdminPanel";
import ProjectsDisplay from "./admin/ProjectsDisplay";
import ExperiencesDisplay from "./admin/ExperiencesDisplay";
import Testimonials from "./admin/Testimonials";
import AddAbout from "./admin/Addabout";
import TechAdmin from "./admin/TechAdmin";
import AdminContacts from "./admin/ContactAdmin";
import SignUpScreen from "./pages/SignUpPage";
import LoginScreen from "./pages/LoginPage";
import Certificates from "./pages/CertificateGen";

const App = () => {
  return (
    <BrowserRouter>
     
        <Routes>
          <Route element={<UserLayout/>}>
            <Route path="/" element={<LandingPages />} />
            <Route path="/register" element={<SignUpScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/hello" element={<Certificates />} />

          </Route>
          <Route element={<AdminLayout/>}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/experi" element={<ExperiencesDisplay />} />
            <Route path="/admin/projects" element={<ProjectsDisplay />} />
            <Route path="/admin/testimonials" element={<Testimonials />} />
            <Route path="/admin/addabout" element={<AddAbout />} />
            <Route path="/admin/techadmin" element={<TechAdmin />} />
            <Route path="/admin/contact" element={<AdminContacts />} />
          </Route>
        </Routes>
    
    </BrowserRouter>
  );
};

export default App;
