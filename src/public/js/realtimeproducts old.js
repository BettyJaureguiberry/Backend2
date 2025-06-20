const socket = io();

socket.on("realtimeproducts", data => {
    limpiarSelectEliminarProducto();
    let contenidoHTML = "";

    data.forEach(item => {
        contenidoHTML += `
            <div class="col-md-3">
                <div class="card text-center border-0 fw-light">
                    <img src="${item.thumbnails[0]}" class="img-fluid" alt="${item.title}">
                    <div class="card-body">
                        <h5 class="card-text">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <p class="card-footer fw-semibold" style="background-color: #f8eff4;" >$${item.price}</p>
                    </div>
                </div>
            </div>`;

        agregarItemEliminarProducto(item);
    });

    contenidoHTML += "</ul>";
    document.getElementById("content").innerHTML = contenidoHTML;
})

const agregarProducto = () => {
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const code = document.getElementById("code");
    const price = document.getElementById("price");
    const category = document.getElementById("category");
    const image = document.getElementById("image");
    
const validarCampo = (campo, nombre) => {
        if (!campo.value.trim()) {
            alert(`El campo '${nombre}' está vacío!`);
            campo.focus();
            return false;
        }
        return true;
    };

    // Validar  los campos
    if (!validarCampo(title, 'title') ||
        !validarCampo(description, 'description') ||
        !validarCampo(code, 'code') ||
        !validarCampo(category, 'category')) {
        return;

    
    }

    if (isNaN(price.value) || !price.value.trim()) {
        alert(`El campo 'price' debe ser un número válido!`);
        price.focus(); 
        return;
    }
    
    
    const product = {
        title:title.value, 
        description:description.value, 
        code:code.value, 
        price:price.value, 
        category:category.value, 
        image:image.value
    };
    
    
    socket.emit("nuevoProducto", product);
    title.value = "";   
    description.value = "";   
    code.value = "";   
    price.value = "";
    category.value = "";   
    image.value = "";
    document.getElementById("agregarProducto").innerHTML = `<div class="alert alert-success"role="alert">El producto ${product.title} se agregó correctamente!</div>`;
}


const limpiarSelectEliminarProducto = () => {
    const productId = document.getElementById("product_id");
    productId.innerHTML = "";
}

const agregarItemEliminarProducto = (item) => {
    const productId = document.getElementById("product_id");
    let option = document.createElement("option");
    option.value = item.id;
    option.innerHTML = "Producto #" + item.id +" " + item.title;
    productId.appendChild(option);
}


const eliminarProducto = () => {
    const product_id = document.getElementById("product_id").value;
    const product_option = document.getElementById("product_id").selectedOptions[0];
    const nombre = product_option ? product_option.textContent.split(' ')[2] : 'desconocido';

    if (confirm(`¿Está seguro de eliminar el producto '${nombre}'?`)) {
        socket.emit("eliminarProducto", product_id);
        document.getElementById("producto_estado1").innerHTML = `<div class="alert alert-success" role="alert">El producto '${nombre}' se eliminó correctamente!</div>`;
    }
};

