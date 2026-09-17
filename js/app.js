const servicioTexto = {
    web: "Sitio web corporativo",
    ecommerce: "Tienda virtual (E-Commerce)",
    landing: "Landing page de alta conversión",
    seo: "Consultoría y Auditoría SEO"
};

const TASA_IVA = 0.19;

const money = (valor) => {
    return valor.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
};

const formulario = document.getElementById("formCotizacion");
const mensaje = document.getElementById("mensaje");
const btnLimpiar = document.getElementById("btnLimpiar");
const alertasNegocio = document.getElementById("alertasNegocio");
const resNivelBadge = document.getElementById("resNivel");

const calcularSubtotal = (horas, tarifa) => horas * tarifa;
const calcularDescuento = (subtotal, porcentaje) => subtotal * (porcentaje / 100);
const calcularIVA = (subtotalConDescuento) => subtotalConDescuento * TASA_IVA;
const calcularTotal = (subtotalConDescuento, iva) => subtotalConDescuento + iva;

const clasificarProyecto = (horas) => {
    if (horas <= 10) {
        resNivelBadge.className = "badge nivel-basico";
        return "Básico";
    } else if (horas <= 30) {
        resNivelBadge.className = "badge nivel-intermedio";
        return "Intermedio";
    } else {
        resNivelBadge.className = "badge nivel-avanzado";
        return "Avanzado";
    }
};

const validarDatos = (cliente, servicio, horas, tarifa, descuento) => {
    if (!cliente) return "Por favor, ingrese el nombre del cliente o empresa.";
    if (!servicio) return "Debe seleccionar un tipo de solución digital.";
    
    // Validación estricta para evitar valores exagerados o irreales
    if (isNaN(horas) || horas <= 0 || horas > 1000) {
        return "Las horas estimadas deben ser un valor realista entre 1 y 1.000.";
    }
    
    if (isNaN(tarifa) || tarifa <= 0 || tarifa > 1000000) {
        return "La tarifa por hora no puede superar $1.000.000 COP.";
    }
    
    if (isNaN(descuento) || descuento < 0 || descuento > 50) {
        return "El descuento comercial debe estar entre el 0% y el 50%.";
    }
    
    return "";
};

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    alertasNegocio.innerHTML = "";

    const cliente = document.getElementById("cliente").value.trim();
    const servicio = document.getElementById("servicio").value;
    const horas = Number(document.getElementById("horas").value);
    const tarifa = Number(document.getElementById("tarifa").value);
    const descuentoInput = document.getElementById("descuento").value;
    const descuento = descuentoInput === "" ? 0 : Number(descuentoInput);

    const error = validarDatos(cliente, servicio, horas, tarifa, descuento);

    if (error) {
        mensaje.textContent = error;
        mensaje.className = "mensaje-estado error";
        return;
    }

    const subtotal = calcularSubtotal(horas, tarifa);
    const valorDescuento = calcularDescuento(subtotal, descuento);
    const subtotalConDescuento = subtotal - valorDescuento;
    const ivaValor = calcularIVA(subtotalConDescuento);
    const total = calcularTotal(subtotalConDescuento, ivaValor);

    // Actualización dinámica de la interfaz
    document.getElementById("resCliente").textContent = cliente;
    document.getElementById("resServicio").textContent = servicioTexto[servicio];
    document.getElementById("resHoras").textContent = horas;
    resNivelBadge.textContent = `Nivel: ${clasificarProyecto(horas)}`;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("descuentoValor").textContent = `-${money(valorDescuento)}`;
    document.getElementById("ivaValor").textContent = money(ivaValor);
    document.getElementById("total").textContent = money(total);

    // Reglas de negocio avanzadas
    if (horas > 40) {
        alertasNegocio.innerHTML += `<div class="alerta-negocio">⚡ <strong>Proyecto de alta dedicación:</strong> Requiere asignación prioritaria de recursos técnicos.</div>`;
    }

    if (total > 2000000) {
        alertasNegocio.innerHTML += `<div class="alerta-negocio">💼 <strong>Requiere aprobación comercial:</strong> El monto excede el límite estándar de preventa.</div>`;
    }

    mensaje.textContent = "✔ Cotización procesada con éxito.";
    mensaje.className = "mensaje-estado ok";
});

// Botón Limpiar optimizado
btnLimpiar.addEventListener("click", () => {
    formulario.reset();
    document.getElementById("resCliente").textContent = "Sin cliente asignado";
    document.getElementById("resServicio").textContent = "Esperando selección...";
    resNivelBadge.textContent = "Nivel: -";
    resNivelBadge.className = "badge nivel-default";
    document.getElementById("resHoras").textContent = "-";
    document.getElementById("subtotal").textContent = "$0";
    document.getElementById("descuentoValor").textContent = "$0";
    document.getElementById("ivaValor").textContent = "$0";
    document.getElementById("total").textContent = "$0";
    mensaje.textContent = "";
    alertasNegocio.innerHTML = "";
    
    btnLimpiar.style.transform = "scale(0.96)";
    setTimeout(() => {
        btnLimpiar.style.transform = "scale(1)";
    }, 150);
});