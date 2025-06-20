import productRepository from "../repositories/ProductRepository.js";
import ticketRepository from "../repositories/TicketRepository.js";
import { v4 as uuidv4 } from "uuid";

class CartService {
  constructor(cartRepo) {
    this.cartRepo = cartRepo;
  }

  async addProductToCart(cid, pid) {
    const cart = await this.cartRepo.getCartById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await productRepository.getProductById(pid);
    if (!product) throw new Error("Producto no encontrado");

    if (product.status !== "activo") {
      throw new Error("Producto inactivo, no se puede agregar al carrito");
    }

    const existing = cart.products.find(p => p.product === pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.cartRepo.saveCart(cart);
    return cart;
  }

  async purchaseCart(cid, user) {
    const cart = await this.cartRepo.getCartById(cid);
    if (!cart || cart.products.length === 0) {
      throw new Error("El carrito está vacío o no existe");
    }

    const productosSinStock = [];
    let totalAmount = 0;
    const productosComprados = [];

    for (const item of cart.products) {
      const producto = await productRepository.getProductById(item.product);
      if (producto.stock >= item.quantity) {
        producto.stock -= item.quantity;
        await productRepository.updateProduct(producto._id, producto);
        totalAmount += producto.price * item.quantity;
        productosComprados.push(item);
      } else {
        productosSinStock.push(item.product);
      }
    }

    if (productosComprados.length === 0) {
      return {
        estado: "ERROR",
        mensaje: "No hay stock disponible para los productos del carrito",
        productosSinStock
      };
    }

    const ticket = await ticketRepository.createTicket({
      code: uuidv4(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: user.email
    });

    // Limpiamos el carrito dejando solo los que no tenían stock
    cart.products = cart.products.filter(p =>
      productosSinStock.includes(p.product)
    );
    await this.cartRepo.saveCart(cart);

    return {
      estado: "OK",
      mensaje: "Compra realizada con éxito!",
      ticket,
      productosSinStock
    };
  }
}

export default CartService;