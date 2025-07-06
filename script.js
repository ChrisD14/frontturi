// Variables globales para almacenar datos
let surveyData = [];
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const EXCEL_FILE_NAME = "encuestas.xlsx"; // Nombre del archivo Excel a exportar
const API_URL = 'https://turismo-4d70b0ba9968.herokuapp.com/'; // Asegúrate de que coincida con el puerto de tu backend

// Funciones utilitarias
function getCurrentDateTime() {
    return new Date().toISOString();
}

// Función para guardar datos en el servidor
async function saveSurveyToServer(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Encuesta guardada en el servidor:', result);
        alert('Encuesta guardada correctamente en la nube.');
        // Después de guardar, recargar los datos para actualizar la tabla
        await loadSurveyDataFromServer();
    } catch (error) {
        console.error('Error al guardar la encuesta en el servidor:', error);
        alert('Error al guardar la encuesta. Por favor, inténtalo de nuevo.');
    }
}

// Función para cargar datos desde el servidor
async function loadSurveyDataFromServer() {
    try {
        const response = await fetch('https://turismo-4d70b0ba9968.herokuapp.com/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        surveyData = await response.json();
        console.log('Datos cargados del servidor:', surveyData);
        renderTable(); // Renderiza la tabla con los datos del servidor
        renderCharts(); // Renderiza los gráficos con los datos del servidor
    } catch (error) {
        console.error('Error al cargar los datos del servidor:', error);
        // Si hay un error al cargar, asegúrate de que la tabla muestre "No hay datos"
        surveyData = [];
        renderTable();
        renderCharts();
        alert('Error al cargar los datos. Asegúrate de que el servidor backend esté funcionando.');
    }
}

// Genera y descarga un archivo Excel (XLSX) con los datos actuales
function generateExcelExport() {
    if (surveyData.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(surveyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Encuestas");
    XLSX.writeFile(workbook, EXCEL_FILE_NAME);
    alert('Datos exportados a Excel correctamente.');
}

// Función para cargar datos desde un archivo Excel seleccionado por el usuario
/*async function cargarDesdeExcel() {
       const loadingIndicator = document.getElementById('loadingIndicator');
       if (!loadingIndicator) {
           console.error('El elemento loadingIndicator no se encontró en el DOM.');
           return; // Salir de la función si no se encuentra el elemento
       }
       loadingIndicator.style.display = 'block'; // Mostrar indicador de carga

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls'; // Aceptar solo archivos Excel

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            loadingIndicator.style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Reemplazar los datos existentes con los del archivo Excel
                surveyData = jsonData;
                saveToLocalStorage(); // Guardar los nuevos datos en localStorage

                renderTable();
                renderCharts();
                alert(`Se cargaron ${jsonData.length} registros desde el archivo Excel.`);
            } catch (error) {
                console.error('Error al procesar el archivo Excel:', error);
                alert('Error al cargar el archivo Excel. Asegúrate de que sea un archivo válido.');
            } finally {
                loadingIndicator.style.display = 'none'; // Ocultar indicador de carga
            }
        };
        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            alert('Error al leer el archivo.');
            loadingIndicator.style.display = 'none';
        };
        reader.readAsArrayBuffer(file);
    };
    input.click(); // Simular clic en el input de archivo
}*/


// Renderiza la tabla de datos en la página de administración
    function renderTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) {
            console.error('Elemento tableBody no encontrado.');
            return;
        }
        console.log('Iniciando renderTable(). Datos en surveyData:', surveyData.length, surveyData); // <-- Añade esto

        tableBody.innerHTML = ''; // Limpiar la tabla antes de renderizar

        if (surveyData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="12" style="text-align: center;">No hay datos disponibles.</td>`;
            tableBody.appendChild(noDataRow);
            console.log('No hay datos en surveyData, mostrando mensaje "No hay datos disponibles".'); // <-- Añade esto
            return;
        }

        surveyData.forEach((item, index) => {
            console.log(`Procesando item ${index}:`, item); // <-- Añade esto
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.Nombres || ''}</td>
                <td>${item.Apellidos || ''}</td>
                <td>${item.Edad || ''}</td>
                <td>${item.Ciudad || ''}</td>
                <td>${item['Nivel Instrucción'] || ''}</td>
                <td>${item.Ocupación || ''}</td>
                <td>${item['Motivo Visita'] || ''}</td>
                <td>${item.Transporte || ''}</td>
                <td>${item.Actividades || ''}</td>
                <td>${item.Frecuencia || ''}</td>
                <td>${item.Satisfacción || ''}</td>
                <td>${item.Opinión || ''}</td>
            `;
            tableBody.appendChild(row);
        });
        console.log('renderTable() finalizado. Filas añadidas:', surveyData.length); // <-- Añade esto
    }
    

// Obtiene los datos formateados para los gráficos
function getChartData(field) {
    const counts = {};
    surveyData.forEach(item => {
        // Usar el nombre de la columna tal como aparece en el Excel
        let value;
        switch(field) {
            case 'ciudad': value = item.Ciudad; break;
            case 'ocupacion': value = item.Ocupación; break;
            case 'motivoVisita': value = item['Motivo Visita']; break;
            case 'satisfaccion': value = item.Satisfacción; break;
            default: value = item[field];
        }
        const val = value || 'No especificado';
        counts[val] = (counts[val] || 0) + 1;
    });
    return {
        labels: Object.keys(counts),
        data: Object.values(counts)
    };
}

// Renderiza un gráfico específico usando Chart.js
function renderChart(canvasId, title, chartData, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // Asegurarse de que el elemento existe

    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico existente si existe para evitar duplicados
    if (window[canvasId + 'Chart']) {
        window[canvasId + 'Chart'].destroy();
    }

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)', // Rojo
        'rgba(54, 162, 235, 0.7)', // Azul
        'rgba(255, 206, 86, 0.7)', // Amarillo
        'rgba(75, 192, 192, 0.7)', // Verde azulado
        'rgba(153, 102, 255, 0.7)',// Púrpura
        'rgba(255, 159, 64, 0.7)', // Naranja
        'rgba(199, 199, 199, 0.7)',// Gris
        'rgba(83, 109, 254, 0.7)', // Índigo
        'rgba(255, 99, 71, 0.7)',  // Tomate
        'rgba(60, 179, 113, 0.7)'  // Verde mar
    ];

    window[canvasId + 'Chart'] = new Chart(ctx, {
        type: type,
        data: {
            labels: chartData.labels,
            datasets: [{
                label: title,
                data: chartData.data,
                backgroundColor: backgroundColors.slice(0, chartData.labels.length), // Usar solo los colores necesarios
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')), // Versión opaca para el borde
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permitir que el tamaño del contenedor controle el aspecto
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Generar gráficos
function renderCharts() {
    // Gráfico de ciudades
    renderChart('cityChart', 'Visitantes por Ciudad', getChartData('ciudad'), 'bar');

    // Gráfico de ocupaciones
    renderChart('occupationChart', 'Actividades Económicas', getChartData('ocupacion'), 'pie');

    // Gráfico de motivos de visita
    renderChart('visitReasonChart', 'Motivos de Visita', getChartData('motivoVisita'), 'bar');

    // Gráfico de niveles de satisfacción
    renderChart('satisfactionChart', 'Nivel de Satisfacción', getChartData('satisfaccion'), 'pie');
}


// Modificar el evento de guardar del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnLogin = document.getElementById('btnLogin');
    const btnExportarExcel = document.getElementById('btnExportarExcel');
    const btnActualizar = document.getElementById('btnActualizar');

    // Cargar datos del servidor al inicio si estamos en la página de administración
    if (document.getElementById('dataTable')) {
        loadSurveyDataFromServer();
    }

    // Configurar botón Guardar (formulario principal en index.html)
    if (btnGuardar && form) {
        btnGuardar.addEventListener('click', async function() { // Añadir 'async' aquí
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = {
                Nombres: document.getElementById('Nombres').value,
                Apellidos: document.getElementById('Apellidos').value,
                Edad: parseInt(document.getElementById('Edad').value),
                Ciudad: document.getElementById('Ciudad').value,
                'Nivel Instrucción': document.getElementById('Nivel Instrucción').value,
                Ocupación: document.getElementById('Ocupación').value,
                'Motivo Visita': document.getElementById('Motivo Visita').value,
                Transporte: document.getElementById('Transporte').value,
                Actividades: document.getElementById('Actividades').value,
                Frecuencia: document.getElementById('Frecuencia').value,
                Satisfacción: document.getElementById('Satisfacción').value,
                Opinión: document.getElementById('Opinión').value,
                Timestamp: getCurrentDateTime()
            };

            await saveSurveyToServer(formData); // Llama a la función que guarda en el servidor
            form.reset(); // Limpiar el formulario
        });
    }

    // Configurar Login (en login.html)
    if (btnLogin) {
        btnLogin.addEventListener('click', function() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginError = document.getElementById('loginError');
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                window.location.href = 'admin.html'; // Redirigir a la página de administración
            } else {
                loginError.textContent = 'Credenciales incorrectas';
                loginError.style.display = 'block';
                setTimeout(() => {
                    loginError.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Configurar Exportar a Excel (en admin.html)
    if (btnExportarExcel) {
        btnExportarExcel.addEventListener('click', generateExcelExport);
    }

    // Configurar Actualizar Datos (en admin.html)
    if (btnActualizar) {
        btnActualizar.addEventListener('click', function() {
            loadFromLocalStorage(); // Recargar datos desde localStorage
            renderTable(); // Volver a renderizar la tabla
            renderCharts(); // Volver a renderizar los gráficos
            alert('Datos actualizados desde la base de datos local.');
        });
    }

    // Configurar Cargar desde Excel (en admin.html)
    /*if (btnCargarExcel) {
        btnCargarExcel.addEventListener('click', cargarDesdeExcel);
    }*/

    // Renderizar datos y gráficos si estamos en la página de administración
    if (document.getElementById('dataTable')) {
        loadFromLocalStorage(); // Asegurarse de cargar los datos al entrar a admin.html
        renderTable();
        renderCharts();
    }
});
