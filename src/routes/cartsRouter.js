import { Router } from "express";
import CartService from "../services/CartServices.js";
import { passportCall } from "../utils/passport.utils.js";
import { authorizationMiddleware } from "../middleware/authorizationMiddleware.js";

const cartsRouter = Router();
const cartService = new CartService();

// 📌 Obtener todos los carritos con manejo de errores
cartsRouter.get("/", async (req, res) => {
    try {
        const carts = await cartService.getAllCarts();
        res.send(carts);
    } catch (error) {
        console.error("Error al obtener carritos:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al obtener los carritos.", detalle: error.message });
    }
});

// 📌 Obtener un carrito por ID con validaciones
cartsRouter.get("/:cid", async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartService.getCart(cid);

        if (!cart) {
            return res.status(404).send({ estado: "ERROR", mensaje: "Carrito no encontrado!" });
        }

        res.send(cart);
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al obtener el carrito.", detalle: error.message });
    }
});

// 📌 Crear un carrito nuevo y devolver el ID
cartsRouter.post("/", async (req, res) => {
    try {
        const newCart = await cartService.createCart();
        res.send({
            estado: "OK",
            mensaje: "El carrito se creó correctamente!",
            cartId: newCart.id
        });
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).send({
            estado: "ERROR",
            mensaje: "Error interno al crear el carrito.",
            detalle: error.message
        });
    }
});

// 📌 Agregar un producto al carrito con validación de usuario
cartsRouter.post("/:cid/product/:pid", passportCall("jwt"), authorizationMiddleware("user"), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await cartService.addProductToCart(cid, pid);
        res.send({ estado: "OK", mensaje: "Producto agregado al carrito!" });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al agregar el producto.", detalle: error.message });
    }
});

// 📌 Modificar cantidad de un producto en el carrito con validación de usuario
cartsRouter.put("/:cid/product/:pid", passportCall("jwt"), authorizationMiddleware("user"), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        await cartService.updateProductQuantity(cid, pid, quantity);
        res.send({ estado: "OK", mensaje: "Cantidad actualizada!" });
    } catch (error) {
        console.error("Error al actualizar cantidad del producto:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al actualizar la cantidad.", detalle: error.message });
    }
});

// 📌 Eliminar un producto del carrito con validación de usuario
cartsRouter.delete("/:cid/product/:pid", passportCall("jwt"), authorizationMiddleware("user"), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await cartService.deleteProduct(cid, pid);
        res.send({ estado: "OK", mensaje: "Producto eliminado del carrito!" });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al eliminar el producto.", detalle: error.message });
    }
});

// 📌 Vaciar el carrito
cartsRouter.delete("/:cid", passportCall("jwt"), authorizationMiddleware("user"), async (req, res) => {
    try {
        const cid = req.params.cid;
        await cartService.emptyCart(cid);
        res.send({ estado: "OK", mensaje: "El carrito se vació correctamente!" });
    } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        res.status(500).send({ estado: "ERROR", mensaje: "Error interno al vaciar el carrito.", detalle: error.message });
    }
});

// 📌 Finalizar la compra y generar ticket (solo usuarios)
cartsRouter.post("/:cid/purchase", passportCall("jwt"), authorizationMiddleware("user"), async (req, res) => {
    try {
        const cid = req.params.cid;
        const userEmail = req.user.email;

        const result = await cartService.finalizePurchase(cid, userEmail);

        if (result.ticket) {
            res.send({
                estado: "OK",
                mensaje: "Compra realizada con éxito",
                ticket: result.ticket,
                productosSinStock: result.notPurchased
            });
        } else {
            res.status(400).send({
                estado: "ERROR",
                mensaje: "No se pudo completar la compra",
                detalle: result
            });
        }
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.status(500).send({
            estado: "ERROR",
            mensaje: "Error interno al procesar la compra",
            detalle: error.message
        });
    }
});

export default cartsRouter;