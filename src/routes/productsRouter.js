import { Router } from "express";
import ProductService from "../services/ProductService.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizationMiddleware } from "../middleware/authorizationMiddleware.js";
import { passportCall } from "../utils/passport.utils.js";

const productsRouter = Router();
const productService = new ProductService();

// 📌 Obtener todos los productos con manejo de errores
productsRouter.get("/", async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.send(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send({ status: "ERROR", mensaje: "Error interno al obtener los productos.", detalle: error.message });
    }
});

// 📌 Ruta protegida con Passport y validación de roles
productsRouter.get("/secure-data", passportCall("jwt"), authorizationMiddleware("admin"), async (req, res) => {
    console.log("🚀 Ruta protegida - req.user recibido:", req.user);
    res.send({ estado: "OK", mensaje: "Acceso concedido!" });
});

// 📌 Obtener un producto por ID con validación
productsRouter.get("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productService.getProduct(pid);

        if (!product) {
            return res.status(404).send({ estado: "ERROR", mensaje: "Producto no encontrado!" });
        }

        res.send(product);
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al obtener el producto.", detalle: error.message });
    }
});

// 📌 Agregar un producto con validaciones estrictas
productsRouter.post("/", passportCall("jwt"), authorizationMiddleware("admin"), async (req, res) => {
    try {
        const { title, description, code, price, status, category, thumbnails } = req.body;

        if (!title || typeof title !== "string" || !price || typeof price !== "number") {
            return res.status(400).send({ estado: "ERROR", mensaje: "Datos inválidos. Se requiere `title` (string) y `price` (number)." });
        }

        if (!code || typeof code !== "string") {
            return res.status(400).send({ estado: "ERROR", mensaje: "Código inválido. Se requiere `code` como string único." });
        }

        const existingProduct = await productService.getProductByCode(code);
        if (existingProduct) {
            return res.status(400).send({ estado: "ERROR", mensaje: "Este código ya está en uso." });
        }

        const product = { title, description, code, price, status, category, thumbnails };
        await productService.createProduct(product);
        res.send({ estado: "OK", mensaje: `${title} se agregó correctamente!` });

    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al agregar el producto.", detalle: error.message });
    }
});

// 📌 Editar un producto con validaciones
productsRouter.put("/:pid", passportCall("jwt"), authorizationMiddleware("admin"), async (req, res) => {
    try {
        const pid = req.params.pid;
        const { title, description, code, price, status, category, thumbnails } = req.body;

        if (!title || typeof title !== "string" || !price || typeof price !== "number") {
            return res.status(400).send({ estado: "ERROR", mensaje: "Datos inválidos. Se requiere `title` (string) y `price` (number)." });
        }

        const product = { title, description, code, price, status, category, thumbnails };
        await productService.updateProduct(pid, product);
        res.send({ estado: "OK", mensaje: `${title} se modificó correctamente!` });

    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al actualizar el producto.", detalle: error.message });
    }
});

// 📌 Eliminar un producto con validación
productsRouter.delete("/:pid", passportCall("jwt"), authorizationMiddleware("admin"), async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productService.getProduct(pid);

        if (!product) {
            return res.status(404).send({ estado: "ERROR", mensaje: "El producto no se encontró!" });
        }

        await productService.removeProduct(pid);
        res.send({ estado: "OK", mensaje: `El producto '${product.title}' se eliminó correctamente!` });

    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al eliminar el producto.", detalle: error.message });
    }
});

export default productsRouter;