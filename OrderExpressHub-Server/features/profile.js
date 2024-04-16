const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");
const bcrypt = require("bcrypt");

async function hash(plain) {
  const salt = 10;
  try {
    const hash = await bcrypt.hash(plain, salt);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

router.post("/new", async (req, res) => {
  const db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");
  const { email, password, role } = req.body;
  const org_id = req.org_id;

  if (req.role !== "manager") {
    return res.status(403).send({ message: "Only managers can create additional users." });
  }

  try {
    const encrypted_password = await hash(password);
    let userExists = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row.id);
        } else {
          resolve(null);
        }
      });
    });

    if (userExists) {
      db.run(`INSERT INTO user_orgs (org_id, user_id, role) VALUES (?, ?, ?)`, [org_id, userExists, role], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Existing user added to organization successfully." });
      });
    } else {
      db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, encrypted_password], function (err) {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: err.message });
        }
        const newUser_id = this.lastID;
        db.run(`INSERT INTO user_orgs (org_id, user_id, role) VALUES (?, ?, ?)`, [org_id, newUser_id, role], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: "New user created and added to organization successfully." });
        });
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const org_id = req.org_id;
  const db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");

  if (req.role !== "manager") {
    return res.status(403).send({ message: "Only managers can remove users from the organization." });
  }

  db.run(`DELETE FROM user_orgs WHERE user_id = ? AND org_id = ?`, [user_id, org_id], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes > 0) {
      res.status(200).json({ message: "User removed from organization successfully." });
    } else {
      res.status(404).json({ message: "User not found in the organization." });
    }
  });
});

module.exports = router;
