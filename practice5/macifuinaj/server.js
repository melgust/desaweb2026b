const express = require("express");

const app = express();
const PORT = 3001;

app.get("/", (req, res) => {
  res.json({
    mensaje: "Servicio funcionando correctamente",
    servicio: "Servicio de Maryori",
    pc: "macifuinaj",
    usuario: "Maryori"
  });
});

app.get("/users", (req, res) => {
  res.json({
    servicio: "Servicio de Maryori",
    pc: "macifuinaj",
    usuario: "Maryori",
    data: [
      { id: 1, name: "Ana" },
      { id: 2, name: "Carlos" }
    ]
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servicio de Maryori corriendo en el puerto ${PORT}`);
});