import { Router } from "express";

const router = Router(); // 🔥 Esta línea es fundamental

// Ejemplo de ruta:
router.get("/", (req, res) => {
  res.render("home");
});

export default router;