const express = require("express");

const SERVICE = process.env.SERVICE || "products";
const PC = process.env.PC || "Isaias";
const GATEWAY_KEY = process.env.GATEWAY_KEY || "lab4-gateway-secret";
const PORT = 3001;

const data = {
  users:      [{ id: 1, name: "Ana" }, { id: 2, name: "Carlos" }],
  products:   [{ id: 1, name: "Laptop", price: 1200 }, { id: 2, name: "Mouse", price: 25 }],
  orders:     [{ id: 1, userId: 1, productId: 2, quantity: 2 }],
  payments:   [{ id: 1, orderId: 1, amount: 50, method: "tarjeta" }, { id: 2, orderId: 2, amount: 1200, method: "efectivo" }],
  categories: [{ id: 1, name: "Electronica" }, { id: 2, name: "Oficina" }],
  suppliers:  [{ id: 1, name: "TechGT", phone: "2222-1111" }, { id: 2, name: "OfiMax", phone: "2333-4444" }]
};

const app = express();

app.use((req, res, next) => {
  console.log(`[${SERVICE}] ${req.method} ${req.url} desde ${req.ip}`);
  next();
});

// Solo acepta peticiones que vienen del API Gateway
app.use((req, res, next) => {
  if (req.headers["x-gateway-key"] !== GATEWAY_KEY) {
    console.log(`[${SERVICE}] RECHAZADO: acceso directo sin pasar por el gateway`);
    return res.status(401).json({
      status: 401,
      error: "Acceso directo no permitido. Use el API Gateway."
    });
  }
  next();
});

app.get(`/${SERVICE}`, (req, res) => {
  res.json({ servicio: SERVICE, pc: PC, data: data[SERVICE] });
});

app.get(`/${SERVICE}/:id`, (req, res) => {
  const item = data[SERVICE].find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "No encontrado" });
  res.json({ servicio: SERVICE, pc: PC, data: item });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servicio ${SERVICE} de ${PC} corriendo en puerto ${PORT}`);
});