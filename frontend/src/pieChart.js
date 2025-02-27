// pieChart.js - Функциональность для создания круговых диаграмм
import { categoryDisplayNames, categoryKeywords } from './filters.js';

/**
 * Создает круговую диаграмму для визуализации данных
 * @param {Object} data - Данные для визуализации
 * @param {string} containerId - ID контейнера для размещения диаграммы
 * @param {string} title - Заголовок диаграммы
 */
export function createPieChart(data, containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Очистить контейнер перед добавлением новых элементов
    container.innerHTML = '';

    // Добавить заголовок
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.className = 'pie-chart-title';
    container.appendChild(titleElement);

    // Проверить, есть ли данные для диаграммы
    if (data.length === 0) {
        const noDataMessage = document.createElement('p');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'Немає даних для відображення';
        container.appendChild(noDataMessage);
        return;
    }

    // Создать легенду с названиями компонентов над диаграммой
    const legendContainer = document.createElement('div');
    legendContainer.className = 'pie-chart-legend';
    
    data.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = item.color;
        
        const label = document.createElement('span');
        label.className = 'legend-label';
        label.textContent = item.label;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
    
    container.appendChild(legendContainer);

    // Создать контейнер для диаграммы
    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';
    container.appendChild(chartContainer);

    // Используем Canvas для рендеринга
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.className = 'pie-chart-canvas';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Получить общую сумму значений
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Центр круга
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Нарисовать сегменты круговой диаграммы
    let startAngle = -0.5 * Math.PI; // Начинаем с верхней точки круга
    
    data.forEach(item => {
        const percentage = item.value / total;
        const sliceAngle = percentage * 2 * Math.PI;
        
        // Рисуем сегмент
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        // Заливка сегмента
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Обводка сегмента
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Добавляем значение на сегмент
        const midAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.6;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value.toFixed(1), textX, textY);
        
        // Обновляем начальный угол для следующего сегмента
        startAngle += sliceAngle;
    });
    
    // Создать значения под диаграммой
    const valuesContainer = document.createElement('div');
    valuesContainer.className = 'pie-values-container';
    
    data.forEach(item => {
        const valueItem = document.createElement('div');
        valueItem.className = 'pie-value-item';
        valueItem.style.color = item.color;
        valueItem.textContent = `${item.value.toFixed(1)}`;
        valuesContainer.appendChild(valueItem);
    });
    
    chartContainer.appendChild(valuesContainer);
}

/**
 * Создает диаграммы для указанной категории
 * @param {Object} factory - Данные о фабрике
 * @param {string} category - Категория для отображения
 * @param {string} categoryKeyword - Ключевое слово для фильтрации категории
 */
export function createCategoryCharts(factory, category, categoryKeyword) {
    console.log('Creating charts for category:', category, 'with keyword:', categoryKeyword);
    
    // Получить данные для выбранной категории
    const categoryMeasurements = factory.measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes(categoryKeyword)
    );
    
    console.log('Filtered measurements:', categoryMeasurements);
    
    // Группировать данные по компонентам
    const componentData = {};
    categoryMeasurements.forEach(m => {
        if (!componentData[m.component_name]) {
            componentData[m.component_name] = [];
        }
        componentData[m.component_name].push(parseFloat(m.value));
    });
    
    console.log('Component data:', componentData);
    
    // Создать данные для диаграмм (средние значения)
    const avgChartData = [];
    const colors = [
        '#2196F3', // Синий
        '#FF8042', // Оранжевый
        '#8884d8', // Фиолетовый
        '#00BFA5', // Бирюзовый
        '#FFBB28', // Желтый
        '#82ca9d', // Зеленый
        '#ff7c7c', // Светло-красный
        '#9c27b0', // Пурпурный
        '#3f51b5', // Индиго
        '#ffeb3b', // Желтый
        '#4caf50', // Зеленый
        '#e91e63'  // Розовый
    ];
    
    Object.entries(componentData).forEach(([component, values], index) => {
        if (values.length > 0) {
            const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            avgChartData.push({
                label: component,
                value: avgValue,
                color: colors[index % colors.length]
            });
        }
    });
    
    // Создать данные для диаграмм (максимальные значения)
    const maxChartData = [];
    
    Object.entries(componentData).forEach(([component, values], index) => {
        if (values.length > 0) {
            const maxValue = Math.max(...values);
            maxChartData.push({
                label: component,
                value: maxValue,
                color: colors[index % colors.length]
            });
        }
    });
    
    // Создать круговые диаграммы
    createPieChart(avgChartData, 'avgEmissionsChart', 'Графік середніх викидів');
    createPieChart(maxChartData, 'maxEmissionsChart', 'Графік максимальних викидів');
    
    // Создать таблицу для выбранной категории
    createComponentTable(categoryMeasurements, 'emissionsTable');
}

/**
 * Создает таблицу с данными о компонентах
 * @param {Array} measurements - Массив измерений
 * @param {string} containerId - ID контейнера для таблицы
 */
export function createComponentTable(measurements, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'emissions-table';
    
    // Создать заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Елемент', 'Дата', 'Значення', 'Одиниця виміру'];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Создать тело таблицы
    const tbody = document.createElement('tbody');
    
    // Сортировка измерений по дате и имени компонента
    const sortedMeasurements = [...measurements].sort((a, b) => {
        // Сначала сортируем по имени компонента
        if (a.component_name !== b.component_name) {
            return a.component_name.localeCompare(b.component_name);
        }
        // Затем по дате (от новых к старым)
        return new Date(b.measurement_date) - new Date(a.measurement_date);
    });
    
    // Добавить строки для каждого измерения
    sortedMeasurements.forEach(measurement => {
        const row = document.createElement('tr');
        
        // Компонент
        const componentCell = document.createElement('td');
        componentCell.textContent = measurement.component_name;
        row.appendChild(componentCell);
        
        // Дата
        const dateCell = document.createElement('td');
        const date = new Date(measurement.measurement_date);
        dateCell.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        row.appendChild(dateCell);
        
        // Значение
        const valueCell = document.createElement('td');
        valueCell.textContent = parseFloat(measurement.value).toFixed(2);
        row.appendChild(valueCell);
        
        // Единица измерения
        const unitCell = document.createElement('td');
        unitCell.textContent = measurement.unit || 'мг/м3';
        row.appendChild(unitCell);
        
        tbody.appendChild(row);
    });
    
    // Если нет данных, показать сообщение
    if (measurements.length === 0) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = headers.length;
        noDataCell.textContent = 'Немає даних';
        noDataCell.style.textAlign = 'center';
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}