import React from "react";
import { AppBar, Toolbar, IconButton, Tooltip, Typography } from "@mui/material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";

const menuItems = [
  { text: "Profile", icon: <AccountCircleIcon fontSize="large" />, path: "/" },
  { text: "Categories", icon: <CategoryIcon fontSize="large" />, path: "/categories" },
  { text: "Items", icon: <FilterListIcon fontSize="large" />, path: "/items" },
  { text: "Menus", icon: <ListAltIcon fontSize="large" />, path: "/menus" },
  { text: "Kitchen", icon: <SoupKitchenIcon fontSize="large" />, path: "/kitchen" },
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <React.Fragment>
      <AppBar position="static" style={{ flexGrow: 1 }}>
        <Toolbar style={{ justifyContent: "space-evenly" }}>
          {menuItems.map((item, index) => (
            <Tooltip key={index} title={item.text} enterDelay={300} leaveDelay={100} arrow placement="bottom">
              <IconButton
                color="inherit"
                onClick={() => navigate(item.path)}
                style={{
                  padding: "15px",
                  backgroundColor: location.pathname === item.path ? "#f0f0f047" : "transparent",
                }}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Toolbar>
      </AppBar>
      <Typography component="div" style={{ padding: 8 }}>
        <Outlet />
      </Typography>
    </React.Fragment>
  );
};

export default Navigation;
