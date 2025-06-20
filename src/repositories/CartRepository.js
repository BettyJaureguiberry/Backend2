import CartDAO from "../dao/CartDAO.js";

class CartRepository {
    constructor() {
        this.cartDAO = new CartDAO();
    }

    async getAllCarts() {
        return await this.cartDAO.getCarts();
    }
    async createCart() {
    return await this.cartDAO.createCart();
}

    async getCart(id) {
        const cart = await this.cartDAO.getCartById(id);
        return cart || { error: "No se encontró el carrito!" };
    }

    async addProductToCart(cid, pid) {
        const carts = await this.cartDAO.getCarts();
        const cartIndex = carts.findIndex(cart => cart.id === cid);

        if (cartIndex === -1) return { error: "Carrito no encontrado" };

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await this.cartDAO.saveCarts(carts);
        return cart;
    }
}

export default CartRepository;