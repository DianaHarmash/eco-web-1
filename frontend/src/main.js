import { 
    categoryComponents, 
    categoryKeywords, 
    categoryDisplayNames, 
    initialFilters, 
    initializeComponentFilters, 
    generateFilterUI, 
    filterFactories, 
    filterMeasurements 
} from './filters.js';

import {
    createPieChart,
    createCategoryCharts,
    createComponentTable
} from './pieChart.js';

import {
    calculateAllIndicators,
    createIndicatorsDisplay
} from './integralIndicators.js';

let map;
let markers = [];
let factoriesData = [];
let activeFilters = { ...initialFilters };
let expandedCategories = {}; // Track which categories have expanded component lists

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { Marker } = await google.maps.importLibrary("marker");
    const { InfoWindow } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 50.46002204159702, lng: 30.6198825268124 },
        zoom: 10,
    });

    try {
        const response = await fetch('/api/web-eco/all-factories-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        factoriesData = await response.json();
        
        // Initialize filters
        activeFilters = initializeComponentFilters(activeFilters);
        
        // Setup UI and event listeners
        setupFilterUI();
        setupEventListeners();
        
        // Initial update
        updateMarkersAndTable();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function setupFilterUI() {
    const filtersContainer = document.getElementById('categories-filters');
    
    // Clear existing content
    filtersContainer.innerHTML = '';
    
    // Generate new filter UI
    const filterElement = generateFilterUI(
        activeFilters,
        handleCategoryToggle,
        handleComponentToggle,
        toggleComponentsVisibility
    );
    
    filtersContainer.appendChild(filterElement);
    
    // Setup action buttons
    document.getElementById('apply-filters').addEventListener('click', updateMarkersAndTable);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

function handleCategoryToggle(category) {
    const checkbox = document.getElementById(`category-${category}`);
    activeFilters.categories[category] = checkbox.checked;
    
    // Update all component checkboxes for this category
    categoryComponents[category].forEach(component => {
        const componentCheckbox = document.getElementById(`component-${category}-${component.replace(/\s+/g, '-')}`);
        if (componentCheckbox) {
            componentCheckbox.disabled = !checkbox.checked;
        }
    });
}

function handleComponentToggle(category, component) {
    const checkbox = document.getElementById(`component-${category}-${component.replace(/\s+/g, '-')}`);
    activeFilters.components[category][component] = checkbox.checked;
}

function toggleComponentsVisibility(category) {
    const componentsDiv = document.getElementById(`components-${category}`);
    const toggleBtn = componentsDiv.previousElementSibling.querySelector('.toggle-components');
    
    expandedCategories[category] = !expandedCategories[category];
    
    if (expandedCategories[category]) {
        componentsDiv.classList.add('active');
        toggleBtn.textContent = '-';
    } else {
        componentsDiv.classList.remove('active');
        toggleBtn.textContent = '+';
    }
}

function resetFilters() {
    // Reset to initial values
    activeFilters = initializeComponentFilters(initialFilters);
    
    // Update UI
    setupFilterUI();
    
    // Apply the reset filters
    updateMarkersAndTable();
}

function setupEventListeners() {
    // Map events or other global listeners can be added here
}

function updateMarkersAndTable() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Filter factories based on active filters
    const filteredFactories = filterFactories(factoriesData, activeFilters);

    // Create new markers for filtered factories
    filteredFactories.forEach(factory => {
        const marker = new google.maps.Marker({
            position: {
                lat: parseFloat(factory.latitude),
                lng: parseFloat(factory.longitude)
            },
            map: map,
            title: factory.factory_name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(factory)
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });

    // Update data table
    updateDataTable(filteredFactories);
}

function createInfoWindowContent(factory) {
    const container = document.createElement('div');
    container.className = 'info-window';
    
    const title = document.createElement('h3');
    title.textContent = factory.factory_name;
    container.appendChild(title);
    
    const coords = document.createElement('p');
    coords.textContent = `Координати: ${factory.latitude}, ${factory.longitude}`;
    container.appendChild(coords);
    
    // Расчет и отображение всех интегральных показателей
    if (factory.measurements && factory.measurements.length > 0) {
        // Расчет всех доступных показателей
        const indicators = calculateAllIndicators(factory);
        
        // Создание и добавление элемента отображения показателей
        const indicatorsDisplay = createIndicatorsDisplay(indicators);
        container.appendChild(indicatorsDisplay);
        
        // Получаем уникальные категории из измерений
        const categories = new Set();
        factory.measurements.forEach(m => {
            if (m.category_name) {
                categories.add(m.category_name);
            }
        });
        
        const categoriesList = document.createElement('p');
        categoriesList.textContent = `Наявні дані: ${Array.from(categories).join(', ')}`;
        container.appendChild(categoriesList);
    }
    
    // Добавить кнопку для открытия диаграмм
    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Переглянути детальні дані';
    detailsButton.className = 'details-button';
    
    detailsButton.addEventListener('click', function() {
        console.log('Button clicked for factory:', factory.factory_name);
        try {
            showPieChartModal(factory);
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    });
    
    container.appendChild(detailsButton);
    
    return container;
}

function updateDataTable(factories) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    
    // If no factories match the filters, show a message
    if (factories.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Немає даних, що відповідають вибраним фільтрам.';
        tableContainer.appendChild(message);
        return;
    }
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Create header row
    const headerRow = document.createElement('tr');
    const factoryHeader = document.createElement('th');
    factoryHeader.textContent = 'Назва фабрики';
    headerRow.appendChild(factoryHeader);
    
    // Add column for each active category
    const activeCategories = Object.keys(activeFilters.categories)
        .filter(category => activeFilters.categories[category]);
    
    activeCategories.forEach(category => {
        const th = document.createElement('th');
        th.textContent = categoryDisplayNames[category];
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create rows for each factory
    factories.forEach(factory => {
        const row = document.createElement('tr');
        
        // Factory name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = factory.factory_name;
        row.appendChild(nameCell);
        
        // Add cells for each active category
        activeCategories.forEach(category => {
            const cell = document.createElement('td');
            
            // Filter measurements for this factory and category
            const measurements = factory.measurements.filter(m => {
                const measurementCategory = Object.keys(categoryKeywords).find(key => 
                    m.category_name.toLowerCase().includes(categoryKeywords[key])
                );
                
                if (measurementCategory !== category) {
                    return false;
                }
                
                // Check if component is active
                return activeFilters.components[category][m.component_name];
            });
            
            if (measurements.length > 0) {
                createChart(measurements, cell);
            } else {
                cell.textContent = 'Немає даних';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function createCategoryDropdown(factory, selectedCategory, onChange) {
    // Create container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'category-dropdown-container';
    
    // Create label
    const label = document.createElement('label');
    label.htmlFor = 'category-select';
    label.textContent = 'Виберіть категорію:';
    
    // Create select element
    const select = document.createElement('select');
    select.id = 'category-select';
    select.className = 'category-select';
    
    // Get available categories
    const availableCategories = {
        'ground': 'Стан ґрунтів',
        'air': 'Стан повітря',
        'water': 'Стан водних ресурсів',
        'radiation': 'Рівень радіації',
        'economy': 'Економічний стан',
        'health': 'Стан здоров\'я населення',
        'energy': 'Енергетичний стан'
    };
    
    // Add options to select
    Object.entries(availableCategories).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        
        // Select the active category
        if (value === selectedCategory) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
    
    // Add change event listener
    select.addEventListener('change', (e) => {
        onChange(e.target.value);
    });
    
    // Assemble dropdown
    dropdownContainer.appendChild(label);
    dropdownContainer.appendChild(select);
    
    return dropdownContainer;
}

function showPieChartModal(factory) {
    console.log('Showing modal for factory:', factory);
    
    // Создать или получить модальное окно
    let modal = document.getElementById('pieChartModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pieChartModal';
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Аналіз викидів';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.style.display = 'none';
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        const factoryName = document.createElement('h3');
        factoryName.className = 'factory-name';
        modalContent.appendChild(factoryName);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    // Получаем актуальное содержимое модального окна
    const modalContent = modal.querySelector('.modal-content'); 

    const airQualityContainer = modal.querySelector('#airQualityContainer');
    if (airQualityContainer) {
        airQualityContainer.innerHTML = '';

        // Расчет всех доступных показателей
        const indicators = calculateAllIndicators(factory);
        
        // Создание и добавление элемента отображения показателей
        const indicatorsDisplay = createIndicatorsDisplay(indicators);
        airQualityContainer.appendChild(indicatorsDisplay);
    }
    
    // Обновить имя фабрики
    const factoryNameElement = modal.querySelector('.factory-name');
    factoryNameElement.textContent = factory.factory_name;
    
    // Удалить существующий контейнер для выбора категории (если есть)
    const existingCategoryContainer = modal.querySelector('.category-dropdown-container');
    if (existingCategoryContainer) {
        existingCategoryContainer.remove();
    }
    
    // Удалить существующие контейнеры диаграмм и таблицы
    const existingChartsContainer = modal.querySelector('.charts-container');
    if (existingChartsContainer) {
        existingChartsContainer.remove();
    }
    
    const existingTableContainer = modal.querySelector('.emissions-table-container');
    if (existingTableContainer) {
        existingTableContainer.remove();
    }
    
    // Определение категорий
    const categoryKeywords = {
        'ground': 'ґрунт',
        'air': 'повітря',
        'water': 'водн',
        'radiation': 'радіац',
        'economy': 'економічн',
        'health': 'здоров',
        'energy': 'енергетичн'
    };
    
    // Найти первую доступную категорию
    let initialCategory = 'ground'; // По умолчанию
    Object.entries(categoryKeywords).some(([category, keyword]) => {
        if (factory.measurements.some(m => 
            m.category_name && m.category_name.toLowerCase().includes(keyword)
        )) {
            initialCategory = category;
            return true;
        }
        return false;
    });
    
    // Создать UI элементы
    const categorySelector = createCategoryDropdown(factory, initialCategory, (newCategory) => {
        // Обновить диаграммы и таблицу при изменении категории
        createCategoryCharts(factory, newCategory, categoryKeywords[newCategory]);
    });
    
    // Создать контейнер для диаграмм
    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'charts-container';
    
    const avgChartContainer = document.createElement('div');
    avgChartContainer.id = 'avgEmissionsChart';
    avgChartContainer.className = 'pie-chart-wrapper';
    
    const maxChartContainer = document.createElement('div');
    maxChartContainer.id = 'maxEmissionsChart';
    maxChartContainer.className = 'pie-chart-wrapper';
    
    chartsContainer.appendChild(avgChartContainer);
    chartsContainer.appendChild(maxChartContainer);
    
    // Создать контейнер для таблицы
    const tableContainer = document.createElement('div');
    tableContainer.id = 'emissionsTable';
    tableContainer.className = 'emissions-table-container';
    
    // Добавить все элементы в модальное окно
    modalContent.appendChild(categorySelector);
    modalContent.appendChild(chartsContainer);
    modalContent.appendChild(tableContainer);
    
    // Первоначальное отображение
    createCategoryCharts(factory, initialCategory, categoryKeywords[initialCategory]);
    
    // Показать модальное окно
    modal.style.display = 'block';
    
    // Обработчик закрытия модального окна по клику вне его
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function createChart(measurements, container) {
    const measurementsByCategory = {};
    measurements.forEach(m => {
        if (!measurementsByCategory[m.category_name]) {
            measurementsByCategory[m.category_name] = [];
        }
        measurementsByCategory[m.category_name].push(m);
    });

    Object.entries(measurementsByCategory).forEach(([categoryName, categoryMeasurements]) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = categoryName;
        categoryContainer.appendChild(categoryTitle);

        const measurementsByComponent = {};
        categoryMeasurements.forEach(m => {
            if (!measurementsByComponent[m.component_name]) {
                measurementsByComponent[m.component_name] = [];
            }
            measurementsByComponent[m.component_name].push(m);
        });

        const select = document.createElement('select');
        select.style.marginBottom = '10px';
        Object.keys(measurementsByComponent).forEach(componentName => {
            const option = document.createElement('option');
            option.value = componentName;
            option.textContent = componentName;
            select.appendChild(option);
        });
        categoryContainer.appendChild(select);

        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        categoryContainer.appendChild(chartContainer);

        select.addEventListener('change', () => {
            const selectedComponent = select.value;
            createComponentChart(measurementsByComponent[selectedComponent], chartContainer);
        });

        if (Object.keys(measurementsByComponent).length > 0) {
            const firstComponent = Object.keys(measurementsByComponent)[0];
            createComponentChart(measurementsByComponent[firstComponent], chartContainer);
        }

        container.appendChild(categoryContainer);
    });
}

function createComponentChart(componentMeasurements, chartContainer) {
    chartContainer.innerHTML = ''; 

    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    chartContainer.appendChild(tooltip);

    const width = 300;
    const height = 150;
    const padding = 30;
    const bottomPadding = 50; // Increased bottom padding for date labels
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height + bottomPadding); // Increased height
    
    const values = componentMeasurements.map(m => parseFloat(m.value));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const xScale = (width - 2 * padding) / (componentMeasurements.length - 1);
    const yScale = (height - 2 * padding) / (maxValue - minValue || 1);
    
    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    xAxis.setAttribute('d', `M ${padding} ${height - padding} H ${width - padding}`);
    xAxis.setAttribute('stroke', '#000');
    
    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    yAxis.setAttribute('d', `M ${padding} ${padding} V ${height - padding}`);
    yAxis.setAttribute('stroke', '#000');
    
    svg.appendChild(xAxis);
    svg.appendChild(yAxis);

    // Y-axis labels
    const yLabels = 5;
    for (let i = 0; i <= yLabels; i++) {
        const value = minValue + (maxValue - minValue) * (i / yLabels);
        const y = height - padding - (value - minValue) * yScale;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding - 5);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('font-size', '10');
        text.textContent = value.toFixed(1);
        svg.appendChild(text);
    }
    
    // X-axis date labels
    const dateCount = Math.min(5, componentMeasurements.length); // Display at most 5 dates to avoid overcrowding
    const dateInterval = Math.max(1, Math.floor(componentMeasurements.length / dateCount));
    
    componentMeasurements.forEach((m, i) => {
        if (i % dateInterval === 0 || i === componentMeasurements.length - 1) {
            const x = padding + i * xScale;
            const [year, month, day] = m.measurement_date.split('-');
            const formattedDate = `${day}.${month}`;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', height - padding + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.textContent = formattedDate;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('d', `M ${x} ${height - padding} V ${height - padding + 5}`);
            line.setAttribute('stroke', '#000');
            
            svg.appendChild(text);
            svg.appendChild(line);
        }
    });
    
    let pathD = '';
    const points = [];
    
    componentMeasurements.forEach((m, i) => {
        const x = padding + i * xScale;
        const y = height - padding - (m.value - minValue) * yScale;
        
        if (i === 0) {
            pathD += `M ${x} ${y}`;
        } else {
            pathD += ` L ${x} ${y}`;
        }
        
        points.push({ x, y, measurement: m });
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class', 'chart-line');
    svg.appendChild(path);
    
    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('class', 'chart-point');
        
        circle.addEventListener('mouseover', (e) => {
            const [year, month, day] = point.measurement.measurement_date.split('-');
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX - chartContainer.getBoundingClientRect().left + 10}px`;
            tooltip.style.top = `${e.clientY - chartContainer.getBoundingClientRect().top - 20}px`;
            tooltip.innerHTML = `
                Значення: ${point.measurement.value} ${point.measurement.unit}<br>
                Дата: ${day}.${month}.${year}
            `;
            circle.setAttribute('r', '7');
        });
        
        circle.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
            circle.setAttribute('r', '5');
        });
        
        svg.appendChild(circle);
    });
    
    chartContainer.appendChild(svg);
}

(async function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
})();
