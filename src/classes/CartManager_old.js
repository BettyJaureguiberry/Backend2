import fs from "fs";
import {v4 as uuidv4} from  'uuid'; 

class CartManager {
    constructor() {
        this.carts = [],
        this.file = "carrito.json",
        this.createFile()
    }

    createFile() {
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, JSON.stringify(this.carts))
        }
    }

    

    getCarts() {
        this.carts = JSON.parse(fs.readFileSync(this.file, "utf-8"));
        
        return this.carts;
    }

    getCartById(id) {        
        this.getCarts();
        let cart = this.carts.find(item => item.id == id);
        
        return cart ? cart.products : {"Error":"No se encontró el Carrito!"};
    }

    createCart() {
        
        const cart = { id: uuidv4(), products: [] };
        this.carts.push(cart);
        this.saveCarts();
        return cart;
    }

    addCartProduct(cid, pid) {
        this.getCarts();
        let cart = this.carts.find(item => item.id == cid);
        let product = cart.products.find(item => item.product == pid)

        if (product) {
            product.quantity += 1;
        } else {
            let product = {product:pid, quantity:1};
            cart.products.push(product);
        }

        this.saveCarts();
    }

    saveCarts() {
        fs.writeFileSync(this.file, JSON.stringify(this.carts));
    }
}

export default CartManager