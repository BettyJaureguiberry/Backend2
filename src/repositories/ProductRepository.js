import ProductDAO from "../dao/ProductDAO.js";

class ProductRepository {
    constructor() {
        this.productDAO = new ProductDAO();
    }

    async getProducts(limit = 10, page = 1, query = "", sort = "asc") {
        const filter = query ? { category: query } : {};
        const options = { limit, page, sort };
        
        const result = await this.productDAO.getProducts(filter, options);
        
        return {
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.page - 1}` : null,
            nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.page + 1}` : null,
        };
    }

    async getProduct(id) {
        const product = await this.productDAO.getProductById(id);
        return product || { error: "No se encontró el producto!" };
    }

    async createProduct(product) {
        return await this.productDAO.addProduct(product);
    }

    async updateProduct(id, product) {
        return await this.productDAO.editProduct(id, product);
    }

    async removeProduct(id) {
        return await this.productDAO.deleteProduct(id);
    }
}

export default ProductRepository;