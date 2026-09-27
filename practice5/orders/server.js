const express = require("express");
const app = express();

// Tanto la ruta raíz como /orders devuelven tu información completa
app.get("/", (req, res) => {
  res.json({
    mensaje: "Solicitud atendida exitosamente",
    servicio: "orders",
    usuario: "Jimmy Anderson Hernández Valladares",
    ordenes: [
      { id: 1, userId: 1, productId: 2, quantity: 2 },
      { id: 2, userId: 2, productId: 1, quantity: 1 }
    ]
  });
});

app.get("/orders", (req, res) => {
  res.json({
    mensaje: "Solicitud atendida exitosamente",
    servicio: "orders",
    usuario: "Jimmy Anderson Hernández Valladares",
    ordenes: [
      { id: 1, userId: 1, productId: 2, quantity: 2 },
      { id: 2, userId: 2, productId: 1, quantity: 1 }
    ]
  });
});

app.get("/orders/:id", (req, res) => {
  res.json({
    id: Number(req.params.id),
    userId: 1,
    productId: 2,
    quantity: 2
  });
});

app.listen(3001, "0.0.0.0", () => {
  console.log("Orders API running on port 3001");
});