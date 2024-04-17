import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigation = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigation("/login");
  };
  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  );
}

export default HomePage;
