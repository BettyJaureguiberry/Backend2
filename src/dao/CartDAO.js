import fs from "fs";
import { v4 as uuidv4 } from "uuid";

class CartDAO {
    constructor() {
        this.file = "carrito.json";
        this.createFile();
    }

    createFile() {
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, JSON.stringify([]));
        }
    }

    async getCarts() {
        return JSON.parse(await fs.promises.readFile(this.file, "utf-8"));
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(cart => cart.id === id) || null;
    }

    async saveCarts(carts) {
        await fs.promises.writeFile(this.file, JSON.stringify(carts));
    }

    async createCart() {
    const carts = await this.getCarts();
    const newCart = { id: uuidv4(), products: [] };
    carts.push(newCart);
    await this.saveCarts(carts);
    return newCart;
}

}

export default CartDAO;