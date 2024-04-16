const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);

  db.get("SELECT * FROM orders WHERE id = ?", [id], (error, order) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    db.all(
      `SELECT mi.*, mc.name AS category_name, oi.quantity, oi.notes 
      FROM menu_item mi 
      JOIN order_items oi ON mi.id = oi.item_id
      JOIN menu_category mc ON mi.category_id = mc.id
      WHERE oi.order_id = ?`,
      [id],
      (error, items) => {
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        const groupedItems = items.reduce((acc, item) => {
          const { category_name, ...itemWithoutCategoryName } = item;
          if (!acc[category_name]) {
            acc[category_name] = [];
          }
          acc[category_name].push(itemWithoutCategoryName);
          return acc;
        }, {});

        order.items = groupedItems;

        res.json(order);
      }
    );
  });
});

router.get("/", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all("SELECT * FROM orders", (error, orders) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (orders.length === 0) {
      res.json(orders);
      return;
    }

    let ordersProcessed = 0;

    orders.forEach((order) => {
      db.all(
        `SELECT mi.*, mc.name AS category_name, oi.quantity, oi.notes 
        FROM menu_item mi 
        JOIN order_items oi ON mi.id = oi.item_id
        JOIN menu_category mc ON mi.category_id = mc.id
        WHERE oi.order_id = ?`,
        [order.id],
        (error, items) => {
          if (error) {
            res.status(500).json({ error: error.message });
            return;
          }
          const groupedItems = items.reduce((acc, item) => {
            const { category_name, ...itemWithoutCategoryName } = item;
            if (!acc[category_name]) {
              acc[category_name] = [];
            }
            acc[category_name].push(itemWithoutCategoryName);
            return acc;
          }, {});

          order.items = groupedItems;

          ordersProcessed++;
          if (ordersProcessed === orders.length) {
            res.json(orders);
          }
        }
      );
    });
  });
});

router.post("/new", (req, res) => {
  const { timestamp, status, priority, total_amount, table_number, kitchen_area_id, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item" });
  }

  const db = getDatabaseInstance(req.schema_name);
  db.run(
    "INSERT INTO orders (timestamp, status, priority, total_amount, table_number, kitchen_area_id) VALUES (?, ?, ?, ?, ?, ?)",
    [timestamp, status, priority, total_amount, table_number, kitchen_area_id],
    function (error) {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        const orderId = this.lastID;
        items.forEach((item) => {
          db.run("INSERT INTO order_items (order_id, item_id, quantity, notes) VALUES (?, ?, ?, ?)", [
            orderId,
            item.id,
            item.quantity,
            item.notes || "",
          ]);
        });
        res.status(201).json({ message: "Created order successfully", id: orderId });
      }
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { timestamp, status, priority, total_amount, table_number, kitchen_area_id, items } = req.body;
  const db = getDatabaseInstance(req.schema_name);

  // Start a transaction or ensure operations are batched for atomicity
  db.run("BEGIN TRANSACTION;");

  const updateQuery =
    "UPDATE orders SET timestamp = ?, status = ?, priority = ?, total_amount = ?, table_number = ?, kitchen_area_id = ? WHERE id = ?";
  db.run(updateQuery, [timestamp, status, priority, total_amount, table_number, kitchen_area_id, id], (error) => {
    if (error) {
      db.run("ROLLBACK;");
      return res.status(500).json({ error: error.message });
    } else {
      db.run("DELETE FROM order_items WHERE order_id = ?", [id], (error) => {
        if (error) {
          db.run("ROLLBACK;");
          return res.status(500).json({ error: error.message });
        } else {
          const insertQuery = "INSERT INTO order_items (order_id, item_id, quantity, notes) VALUES (?, ?, ?, ?)";
          items.forEach((item, index) => {
            db.run(insertQuery, [id, item.id, item.quantity, item.notes || ""], (error) => {
              if (error) {
                db.run("ROLLBACK;");
                return res.status(500).json({ error: error.message });
              } else if (index === items.length - 1) {
                db.run("COMMIT;");
                res.status(200).json({ message: "Updated order successfully" });
              }
            });
          });
        }
      });
    }
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.run("DELETE FROM order_items WHERE order_id = ?", [id], (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    db.run("DELETE FROM orders WHERE id = ?", [id], (error) => {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(200).json({ message: "Deleted order successfully" });
      }
    });
  });
});

module.exports = router;
