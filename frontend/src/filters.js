// Categories and their components for filters
export const categoryComponents = {
    air: [
        'Вміст пилу',
        'Двоокис азоту (NO2)',
        'Двоокис сірки (SO2)',
        'Оксид вуглецю',
        'Формальдегід (H2CO)',
        'Свинець',
        'Бенз(а)пірен',
        'Iндекс якості повітря'
    ],
    water: [
        'Показники епідемічної безпеки (мікробіологічні)',
        'Показники епідемічної безпеки (паразитарні)',
        'Санітарно-хімічні (органолептичні)',
        'Санітарно-хімічні (фізико-хімічні)',
        'Санітарно-хімічні (санітарно-токсикологічні)',
        'Радіаційні показники',
        'Індекс забрудненості води'
    ],
    ground: [
        'Гумус',
        'Рухомі сполуки фосфору (P2O5)',
        'Рухомі сполуки калію (K2O)',
        'Засоленість',
        'Солонцюватість',
        'Забруднення хімічними речовинами',
        'pH',
        'Бал бонітету для складового ґрунту'
    ],
    radiation: [
        'Рівень радіації',
        'Placeholder'
    ],
    economy: [
        'Валовий внутрішній продукт',
        'Вантажообіг',
        'Пасажирообіг',
        'Експорт товарів та послуг',
        'Імпорт товарів та послуг',
        'Заробітна плата',
        'Індекс промислової продукції',
        'Індекс обсягу сільськогосподарського виробництва',
        'Індекс будівельної продукції',
        'Індекс споживчих цін',
        'Індекс цін виробників промислової продукції'
    ],
    health: [
        'Медико-демографічні показники',
        'Показники захворюваності та поширення хвороб (хворобливість)',
        'Інвалідності та інвалідизації',
        'Фізичного розвитку населення',
        'Ризики захворювання',
        'Прогноз захворювання',
        'Прогноз тривалості життя'
    ],
    energy: [
        'Обсяги використання води',
        'Обсяги використання електроенергії',
        'Обсяги використання газу',
        'Обсяги використання теплової енергії за кожен місяць',
        'Середні обсяги споживання за місяць та рік',
        'Енергоефективність будівлі або виробництва'
    ]
};

// Category keywords for search
export const categoryKeywords = {
    'air': 'повітря',
    'water': 'водн',
    'ground': 'ґрунт',
    'radiation': 'радіац',
    'economy': 'економічн',
    'health': 'здоров',
    'energy': 'енергетичн'
};

// Display names for categories
export const categoryDisplayNames = {
    'air': 'Стан повітря',
    'water': 'Стан водних ресурсів',
    'ground': 'Стан ґрунтів',
    'radiation': 'Рівень радіації',
    'economy': 'Економічний стан',
    'health': 'Стан здоров\'я населення',
    'energy': 'Енергетичний стан'
};

// Chart colors
export const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Initial filter values
export const initialFilters = {
    categories: {
        air: true,
        water: true,
        ground: true,
        radiation: true,
        economy: true,
        health: true,
        energy: true
    },
    components: {}
};

// Initialize component filters based on category components
export function initializeComponentFilters(filters) {
    const updatedFilters = { ...filters };
    
    if (!updatedFilters.components) {
        updatedFilters.components = {};
    }
    
    Object.keys(categoryComponents).forEach(category => {
        if (!updatedFilters.components[category]) {
            updatedFilters.components[category] = {};
        }
        
        categoryComponents[category].forEach(component => {
            if (updatedFilters.components[category][component] === undefined) {
                updatedFilters.components[category][component] = true;
            }
        });
    });
    
    return updatedFilters;
}

// Generate the HTML for filter UI
export function generateFilterUI(activeFilters, onToggleCategory, onToggleComponent, onToggleComponentsVisibility) {
    const container = document.createElement('div');
    container.className = 'filters-row';

    Object.keys(categoryComponents).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'filter-category';

        // Create header with checkbox
        const headerDiv = document.createElement('div');
        headerDiv.className = 'filter-category-header';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-components';
        toggleBtn.textContent = '+';
        toggleBtn.setAttribute('aria-label', `Toggle ${categoryDisplayNames[category]} components`);
        toggleBtn.onclick = () => onToggleComponentsVisibility(category);

        const categoryCheckbox = document.createElement('input');
        categoryCheckbox.type = 'checkbox';
        categoryCheckbox.id = `category-${category}`;
        categoryCheckbox.checked = activeFilters.categories[category];
        categoryCheckbox.onchange = () => onToggleCategory(category);

        const categoryLabel = document.createElement('label');
        categoryLabel.htmlFor = `category-${category}`;
        categoryLabel.textContent = categoryDisplayNames[category];

        headerDiv.appendChild(toggleBtn);
        headerDiv.appendChild(categoryCheckbox);
        headerDiv.appendChild(categoryLabel);
        categoryDiv.appendChild(headerDiv);

        // Create component checkboxes
        const componentsDiv = document.createElement('div');
        componentsDiv.className = 'filter-components';
        componentsDiv.id = `components-${category}`;

        categoryComponents[category].forEach(component => {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'component-option';

            const componentCheckbox = document.createElement('input');
            componentCheckbox.type = 'checkbox';
            componentCheckbox.id = `component-${category}-${component.replace(/\s+/g, '-')}`;
            componentCheckbox.checked = activeFilters.components[category][component];
            componentCheckbox.onchange = () => onToggleComponent(category, component);

            const componentLabel = document.createElement('label');
            componentLabel.htmlFor = `component-${category}-${component.replace(/\s+/g, '-')}`;
            componentLabel.textContent = component;

            componentDiv.appendChild(componentCheckbox);
            componentDiv.appendChild(componentLabel);
            componentsDiv.appendChild(componentDiv);
        });

        categoryDiv.appendChild(componentsDiv);
        container.appendChild(categoryDiv);
    });

    return container;
}

// Filter factories based on active filters
export function filterFactories(factories, activeFilters) {
    return factories.filter(factory => {
        // Check if any measurements match the active filters
        return factory.measurements.some(measurement => {
            // Check if the category is active
            const category = getCategoryFromMeasurement(measurement);
            if (!category || !activeFilters.categories[category]) {
                return false;
            }
            
            // Check if the component is active
            return activeFilters.components[category][measurement.component_name];
        });
    });
}

// Helper function to determine category from measurement
function getCategoryFromMeasurement(measurement) {
    const categoryName = measurement.category_name.toLowerCase();
    
    for (const [key, keyword] of Object.entries(categoryKeywords)) {
        if (categoryName.includes(keyword)) {
            return key;
        }
    }
    
    return null;
}

// Filter measurements based on active filters
export function filterMeasurements(measurements, activeFilters) {
    return measurements.filter(measurement => {
        const category = getCategoryFromMeasurement(measurement);
        if (!category || !activeFilters.categories[category]) {
            return false;
        }
        
        return activeFilters.components[category][measurement.component_name];
    });
}