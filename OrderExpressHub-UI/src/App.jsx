import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import UserProfile from "./components/Home";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import Navigation from "./components/Navigation";
import CategoriesComponent from "./components/Categories";
import ItemsComponent from "./components/Items";
import UnifiedMenuManager from "./components/Menu";
import KitchenAreaManager from "./components/Kitchen";

function App() {
  return (
    <Router>
      <CssBaseline />
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<Navigation />}>
            <Route index element={<UserProfile />} />
            <Route path="/categories" element={<CategoriesComponent />} />
            <Route path="/items" element={<ItemsComponent />} />
            <Route path="/menus" element={<UnifiedMenuManager />} />
            <Route path="/kitchen" element={<KitchenAreaManager />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
