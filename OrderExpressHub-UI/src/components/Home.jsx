import { useEffect, useState } from "react";
import { Button, TextField, Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { api } from "./axios";

function UserProfile() {
  const [editMode, setEditMode] = useState(false);
  const [editableUser, setEditableUser] = useState({});
  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");
  const isManager = role === "manager";
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await api.get(`/profile/${user_id}`);
        setEditableUser(res.data); // Assuming data is the response object
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // Handle errors appropriately
      }
    };
    getProfile();
  }, [user_id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFieldChange = (field) => (event) => {
    setEditableUser((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveChanges = async () => {
    try {
      await api.put(`/profile/${user_id}`, editableUser);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save changes", error);
      // Handle errors appropriately
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: 2,
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: "4px",
        maxWidth: 600,
        mx: "auto", // This centers the Box horizontally
      }}
    >
      <TextField
        label="Email"
        value={editableUser.email || ""}
        margin="normal"
        fullWidth
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Full Name"
        value={editableUser.full_name || ""}
        onChange={handleFieldChange("full_name")}
        margin="normal"
        fullWidth
        InputProps={{
          readOnly: !editMode,
        }}
      />
      <TextField
        label="Phone Number"
        value={editableUser.phone_number || ""}
        onChange={handleFieldChange("phone_number")}
        margin="normal"
        fullWidth
        InputProps={{
          readOnly: !editMode,
        }}
      />
      <TextField
        label="Address"
        value={editableUser.address || ""}
        onChange={handleFieldChange("address")}
        margin="normal"
        fullWidth
        InputProps={{
          readOnly: !editMode,
        }}
      />
      {editableUser.kitchen_area_id && (
        <TextField
          label="Kitchen Area ID"
          value={editableUser.kitchen_area_id}
          onChange={handleFieldChange("kitchen_area_id")}
          margin="normal"
          fullWidth
          InputProps={{
            readOnly: !editMode,
          }}
        />
      )}
      {isManager && !editMode && (
        <Button color="primary" variant="contained" onClick={() => console.log("Add new employee")}>
          Add New Employee
        </Button>
      )}
      <Button color="primary" variant="outlined" onClick={handleLogout}>
        Log Out
      </Button>
      {!editMode ? (
        <IconButton onClick={toggleEditMode} color="primary">
          <EditIcon />
        </IconButton>
      ) : (
        <>
          <IconButton onClick={toggleEditMode} color="secondary">
            <CancelIcon />
          </IconButton>
          <IconButton onClick={saveChanges} color="primary">
            <SaveIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}

export default UserProfile;
