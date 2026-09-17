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
const btnLimpiarHistorial = document.getElementById("btnLimpiarHistorial");
const btnPdf = document.getElementById("btnPdf");
const alertasNegocio = document.getElementById("alertasNegocio");
const resNivelBadge = document.getElementById("resNivel");
const historialBody = document.getElementById("historialBody");

// Elementos del acordeón del historial
const toggleHistorialBtn = document.getElementById("toggleHistorial");
const historialContenido = document.getElementById("historialContenido");
const flechaIndicador = document.getElementById("flechaIndicador");

let cotizacionActual = null;

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
    if (isNaN(horas) || horas <= 0 || horas > 1000) return "Las horas estimadas deben ser un valor realista entre 1 y 1.000.";
    if (isNaN(tarifa) || tarifa <= 0 || tarifa > 1000000) return "La tarifa por hora no puede superar $1.000.000 COP.";
    if (isNaN(descuento) || descuento < 0 || descuento > 50) return "El descuento comercial debe estar entre el 0% y el 50%.";
    return "";
};

// --- GESTIÓN DEL HISTORIAL (LOCALSTORAGE) ---
const obtenerHistorial = () => {
    const historialGuardado = localStorage.getItem("cotizaciones_nexus");
    return historialGuardado ? JSON.parse(historialGuardado) : [];
};

const guardarEnHistorial = (nuevaCotizacion) => {
    const historial = obtenerHistorial();
    historial.unshift(nuevaCotizacion);
    localStorage.setItem("cotizaciones_nexus", JSON.stringify(historial));
    renderizarHistorial();
};

const renderizarHistorial = () => {
    const historial = obtenerHistorial();
    
    if (historial.length === 0) {
        historialBody.innerHTML = `<tr><td colspan="5" class="tabla-vacia">No hay cotizaciones registradas aún.</td></tr>`;
        return;
    }

    historialBody.innerHTML = "";
    historial.forEach(item => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td style="font-weight: 600; color: var(--text-main);">${item.cliente}</td>
            <td style="color: var(--text-muted);">${item.servicio}</td>
            <td>${item.horas} hrs</td>
            <td style="font-weight: 700; color: var(--primary);">${money(item.total)}</td>
            <td style="color: var(--text-muted); font-size: 12px;">${item.fecha}</td>
        `;
        historialBody.appendChild(fila);
    });
};

document.addEventListener("DOMContentLoaded", renderizarHistorial);

// Controlador de apertura y cierre del Historial (Acordeón)
toggleHistorialBtn.addEventListener("click", (e) => {
    if (e.target.closest("#btnLimpiarHistorial")) return;
    historialContenido.classList.toggle("abierto");
    flechaIndicador.classList.toggle("rotada");
});

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
    const nivel = clasificarProyecto(horas);

    document.getElementById("resCliente").textContent = cliente;
    document.getElementById("resServicio").textContent = servicioTexto[servicio];
    document.getElementById("resHoras").textContent = horas;
    resNivelBadge.textContent = `Nivel: ${nivel}`;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("descuentoValor").textContent = `-${money(valorDescuento)}`;
    document.getElementById("ivaValor").textContent = money(ivaValor);
    document.getElementById("total").textContent = money(total);

    btnPdf.style.display = "flex";

    cotizacionActual = {
        cliente,
        servicio: servicioTexto[servicio],
        horas,
        tarifa,
        descuento,
        subtotal,
        valorDescuento,
        ivaValor,
        total,
        nivel,
        fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    guardarEnHistorial(cotizacionActual);

    if (horas > 40) {
        alertasNegocio.innerHTML += `<div class="alerta-negocio">⚡ <strong>Proyecto de alta dedicación:</strong> Requiere asignación prioritaria de recursos técnicos.</div>`;
    }

    if (total > 2000000) {
        alertasNegocio.innerHTML += `<div class="alerta-negocio">💼 <strong>Requiere aprobación comercial:</strong> El monto excede el límite estándar de preventa.</div>`;
    }

    mensaje.textContent = "✔ Cotización procesada y guardada con éxito.";
    mensaje.className = "mensaje-estado ok";
});

// --- GENERACIÓN DE PDF PROFESIONAL CON JSPDF ---
btnPdf.addEventListener("click", () => {
    if (!cotizacionActual) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXUS DIGITAL", 20, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Oficial de Cotización Tecnológica", 135, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Detalles del Cliente", 20, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Cliente / Empresa: ${cotizacionActual.cliente}`, 20, 60);
    doc.text(`Solución Requerida: ${cotizacionActual.servicio}`, 20, 68);
    doc.text(`Fecha de Emisión: ${cotizacionActual.fecha}`, 20, 76);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Parámetros del Proyecto", 20, 95);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Clasificación de Complejidad: Nivel ${cotizacionActual.nivel}`, 20, 105);
    doc.text(`Horas Estimadas: ${cotizacionActual.horas} hrs`, 20, 113);
    doc.text(`Tarifa por Hora: ${money(cotizacionActual.tarifa)}`, 20, 121);
    doc.text(`Descuento Aplicado: ${cotizacionActual.descuento}%`, 20, 129);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 145, 170, 55, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen Financiero", 30, 157);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Subtotal bruto:`, 30, 168);
    doc.text(`${money(cotizacionActual.subtotal)}`, 160, 168, { align: "right" });

    doc.text(`Descuento comercial:`, 30, 176);
    doc.text(`-${money(cotizacionActual.valorDescuento)}`, 160, 176, { align: "right" });

    doc.text(`IVA (19%):`, 30, 184);
    doc.text(`${money(cotizacionActual.ivaValor)}`, 160, 184, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229);
    doc.text(`Inversión Total:`, 30, 194);
    doc.text(`${money(cotizacionActual.total)}`, 160, 194, { align: "right" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Nexus Digital - Documento generado automáticamente por sistema.", 20, 230);

    doc.save(`Cotizacion_${cotizacionActual.cliente.replace(/\s+/g, "_")}.pdf`);
});

// Botón Limpiar formulario
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
    btnPdf.style.display = "none";
    cotizacionActual = null;
});

// Botón Limpiar Historial completo
btnLimpiarHistorial.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas borrar todo el historial de cotizaciones?")) {
        localStorage.removeItem("cotizaciones_nexus");
        renderizarHistorial();
    }
});