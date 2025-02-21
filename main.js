// Estado del carrito
let carrito = {};

// Elementos del DOM
const domElements = {
    cartBtn: document.querySelector('.cart-btn'),
    cartBadge: document.getElementById('contador-carrito'),
    cartSidebar: document.getElementById('menuCarrito'),
    cartList: document.getElementById('lista-carrito'),
    cartTotal: document.getElementById('total-carrito'),
    emptyCartBtn: document.getElementById('btnVaciar')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
});

function toggleCarrito() {
    domElements.cartSidebar.classList.toggle('active');
    document.body.style.overflow = domElements.cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function agregarAlCarrito(id, nombre, precio) {
    if (carrito[id]) {
        carrito[id].cantidad++;
    } else {
        carrito[id] = { nombre, cantidad: 1, precio };
    }
    actualizarCarrito();
    mostrarNotificacion(nombre, carrito[id].cantidad);
}

function actualizarCarrito() {
    const listaCarrito = domElements.cartList;
    const totalCarrito = domElements.cartTotal;
    const contadorCarrito = domElements.cartBadge;
    const btnVaciar = domElements.emptyCartBtn;
    let total = 0;
    let cantidadTotal = 0;
    let mensajeDescuento = '';

    if (listaCarrito) {
        listaCarrito.innerHTML = Object.entries(carrito).map(([id, item]) => {
            let subtotal = item.precio * item.cantidad;

            // Aplicar descuentos según la cantidad
            if (item.cantidad === 2) {
                subtotal = 95000;
                mensajeDescuento = 'Descuento por compra superior a una unidad';
            } else if (item.cantidad === 3) {
                subtotal = 120000;
                mensajeDescuento = 'Descuento por compra superior a una unidad';
            } else if (item.cantidad >= 4) {
                subtotal = item.precio * item.cantidad;
                mensajeDescuento = '';
            }

            total += subtotal;
            cantidadTotal += item.cantidad;

            return `
                <div class="cart-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0">${item.nombre}</h6>
                            <p class="text-muted mb-0">$${subtotal.toLocaleString()} (${item.cantidad} unidades)</p>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick="modificarCantidad(${id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="btn btn-outline-secondary" onclick="modificarCantidad(${id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (totalCarrito) totalCarrito.textContent = `$${total.toLocaleString()}`;
    if (contadorCarrito) {
        contadorCarrito.textContent = cantidadTotal;
        contadorCarrito.style.display = cantidadTotal > 0 ? 'block' : 'none';
    }
    if (btnVaciar) btnVaciar.style.display = cantidadTotal > 0 ? 'block' : 'none';

    if (mensajeDescuento) {
        listaCarrito.innerHTML += `<strong><p class="text-danger text-center">${mensajeDescuento}</p></strong>`;
    }
}

function modificarCantidad(id, cambio) {
    if (!carrito[id]) return;

    carrito[id].cantidad += cambio;
    if (carrito[id].cantidad <= 0) {
        delete carrito[id];
    }

    actualizarCarrito();
}

function vaciarCarrito() {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

    carrito = {}; // Vacia el carrito
    actualizarCarrito(); // Refresca la interfaz
    
    // Forzar el cierre del carrito asegurando que el estado cambie
    setTimeout(() => {
        if (domElements.cartSidebar.classList.contains('active')) {
            toggleCarrito(); // Cierra el carrito si sigue abierto
        }
    }, 300); 

    // Mostrar la notificación correctamente
    mostrarNotificacion('Carrito vacío', '', true);
}

function mostrarNotificacion(nombreProducto, cantidad, esVaciado = false) {
    let notificacion = document.getElementById('notificacion-carrito');

    // Si la notificación ya existe en el DOM, la eliminamos para reiniciarla completamente
    if (notificacion) {
        notificacion.remove();
    }

    // Crear nueva notificación desde cero
    notificacion = document.createElement("div");
    notificacion.id = "notificacion-carrito";
    notificacion.className = "notificacion-carrito mostrar";
    notificacion.style.position = "fixed";
    notificacion.style.bottom = "20px";
    notificacion.style.right = "20px";
    notificacion.style.background = esVaciado ? "#dc3545" : "#28a745";
    notificacion.style.color = "#fff";
    notificacion.style.padding = "10px 20px";
    notificacion.style.borderRadius = "5px";
    notificacion.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    notificacion.style.zIndex = "9999";

    const mensaje = document.createElement("p");
    mensaje.style.margin = "0";
    mensaje.style.fontWeight = "bold";
    mensaje.innerHTML = esVaciado ? "Carrito vaciado correctamente" : `Producto agregado: ${nombreProducto} (Cantidad: ${cantidad})`;

    notificacion.appendChild(mensaje);
    document.body.appendChild(notificacion); // Agregamos al DOM

    setTimeout(() => {
        notificacion.classList.remove("mostrar");
        notificacion.remove(); // Eliminamos completamente la notificación tras 2.5 segundos
    }, 2500);
}




function cerrarNotificacion() {
    document.getElementById('notificacion-carrito').classList.remove('mostrar');
}

function comprarPorWhatsApp() {
    if (Object.keys(carrito).length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }

    let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
    let total = 0;

    Object.entries(carrito).forEach(([_, item]) => {
        let subtotal = item.precio * item.cantidad;

        if (item.cantidad === 2) subtotal = 95000;
        if (item.cantidad === 3) subtotal = 120000;

        mensaje += `${item.nombre} x${item.cantidad} - $${subtotal.toLocaleString()}\n`;
        total += subtotal;
    });

    mensaje += `\nTotal: $${total.toLocaleString()}`;

    const numeroWhatsApp = "573202274408";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    carrito = {};
    actualizarCarrito();

    // 🔹 Cerrar el carrito antes de redirigir
    toggleCarrito();

    // 🔹 Redirigir al menú y abrir WhatsApp después de 1 segundo
    setTimeout(() => {
        window.location.href = "#";
        window.open(url, "_blank");
    }, 1000);
}
//Eliminar hamburguesa en móvil
document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth <= 768) {
        let menu = document.getElementById("navbarNav"); // Menú desplegable
        let menuToggler = document.querySelector(".navbar-toggler"); // Botón hamburguesa

        if (menu) menu.remove(); // Elimina el menú
        if (menuToggler) menuToggler.remove(); // Elimina el botón hamburguesa
    }
});

// Chatbot
document.addEventListener("DOMContentLoaded", function () {
    const chatWidget = document.querySelector(".chat-widget");
    const chatBtn = document.querySelector(".chat-btn");
    const closeChat = document.querySelector(".close-chat");
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");
    const pages = document.querySelectorAll(".faq-page");
    let currentPage = 0;

    chatBtn.addEventListener("click", function () {
        chatWidget.classList.add("active");
    });

    closeChat.addEventListener("click", function () {
        chatWidget.classList.remove("active");
        resetChat();
    });

    function updateFAQPage() {
        pages.forEach((page, index) => {
            page.classList.toggle("active", index === currentPage);
        });

        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === pages.length - 1;
    }

    nextBtn.addEventListener("click", function () {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updateFAQPage();
        }
    });

    prevBtn.addEventListener("click", function () {
        if (currentPage > 0) {
            currentPage--;
            updateFAQPage();
        }
    });

    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", function () {
            this.nextElementSibling.classList.toggle("visible");
        });
    });

    function resetChat() {
        currentPage = 0;
        updateFAQPage();
        document.querySelectorAll(".faq-answer").forEach(answer => {
            answer.classList.remove("visible");
        });
    }

    updateFAQPage();
});
