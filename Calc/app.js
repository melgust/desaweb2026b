const groupCriteria = [
    { name: "Arquitectura y organización del sistema", max: 12 },
    { name: "Calidad general del código", max: 7 },
    { name: "Base de datos y persistencia", max: 8 },
    { name: "API REST y lógica de negocio", max: 8 },
    { name: "Dashboard e integración de datos", max: 10 },
    { name: "Autenticación, seguridad y permisos", max: 5 },
    { name: "Funcionalidades administrativas", max: 4 },
    { name: "Despliegue e infraestructura", max: 4 },
    { name: "Documentación general del proyecto", max: 2 }
];

const individualCriteria = [
    { name: "Dominio de la arquitectura y explicación técnica", max: 8 },
    { name: "Dominio del código y aporte individual", max: 10 },
    { name: "Comprensión de la base de datos y la API", max: 8 },
    { name: "Dominio del dashboard e integración", max: 6 },
    { name: "Resolución de problemas y defensa técnica", max: 8 }
];

function renderCriteria(criteria, containerId, prefix) {
    const container = document.getElementById(containerId);

    criteria.forEach((criterion, index) => {
        const row = document.createElement("div");
        row.className = "criterion";

        const top = document.createElement("div");
        top.className = "criterion-top";

        const name = document.createElement("label");
        name.className = "criterion-name";
        name.htmlFor = `${prefix}-${index}`;
        name.textContent = `${index + 1}. ${criterion.name}`;

        const max = document.createElement("span");
        max.className = "criterion-max";
        max.textContent = `Máximo: ${criterion.max} puntos`;

        const input = document.createElement("input");
        input.type = "number";
        input.id = `${prefix}-${index}`;
        input.min = "0";
        input.max = String(criterion.max);
        input.step = "0.5";
        input.placeholder = `0 a ${criterion.max}`;
        input.inputMode = "decimal";
        input.dataset.max = String(criterion.max);
        input.setAttribute("aria-label", criterion.name);

        input.addEventListener("input", () => {
            validateInput(input);
            calculateTotals();
        });

        top.append(name, max);
        row.append(top, input);
        container.appendChild(row);
    });
}

function validateInput(input) {
    const max = Number(input.dataset.max);

    if (input.value === "") {
        input.setCustomValidity("");
        return 0;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0 || value > max) {
        input.setCustomValidity(`Ingresa un valor entre 0 y ${max}.`);
        return 0;
    }

    input.setCustomValidity("");
    return value;
}

function sumCriteria(prefix) {
    const inputs = document.querySelectorAll(
        `input[id^="${prefix}-"]`
    );

    let total = 0;

    inputs.forEach(input => {
        total += validateInput(input);
    });

    return total;
}

function formatScore(value) {
    return Number(value.toFixed(2)).toString();
}

function calculateTotals() {
    const groupTotal = sumCriteria("group");
    const individualTotal = sumCriteria("individual");
    const finalTotal = groupTotal + individualTotal;

    document.getElementById("groupTotal").textContent =
        formatScore(groupTotal);

    document.getElementById("individualTotal").textContent =
        formatScore(individualTotal);

    document.getElementById("finalTotal").textContent =
        formatScore(finalTotal);

    document.getElementById("summaryGroup").textContent =
        `${formatScore(groupTotal)} / 60`;

    document.getElementById("summaryIndividual").textContent =
        `${formatScore(individualTotal)} / 40`;

    document.getElementById("progressBar").style.width =
        `${Math.min(finalTotal, 100)}%`;

    const message = document.getElementById("resultMessage");

    if (finalTotal === 100) {
        message.textContent = "¡Excelente! Se han asignado los 100 puntos.";
    } else if (finalTotal === 0) {
        message.textContent =
            "Ingresa las puntuaciones para calcular la nota.";
    } else {
        message.textContent =
            `Puntos obtenidos: ${formatScore(finalTotal)} de 100.`;
    }
}

document.getElementById("resetBtn").addEventListener("click", () => {
    const confirmed = confirm(
        "¿Deseas limpiar los datos y todas las puntuaciones?"
    );

    if (!confirmed) return;

    document.getElementById("student").value = "";
    document.getElementById("team").value = "";

    document.querySelectorAll(
        "#groupCriteria input, #individualCriteria input"
    ).forEach(input => {
        input.value = "";
        input.setCustomValidity("");
    });

    calculateTotals();
});

document.getElementById("printBtn").addEventListener("click", () => {
    const invalidInput = document.querySelector("input:invalid");

    if (invalidInput) {
        invalidInput.reportValidity();
        invalidInput.focus();
        return;
    }

    window.print();
});

renderCriteria(groupCriteria, "groupCriteria", "group");
renderCriteria(individualCriteria, "individualCriteria", "individual");

calculateTotals();