/**
 * Расчет интегрального показателя загрязнения воздуха
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateAirQualityIndex(measurements) {
    // Фильтрация данных по категории "Стан повітря"
    const airMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('повітря')
    );
    
    if (airMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про якість повітря',
            color: '#999999'
        };
    }

    // Группировка по компонентам
    const componentGroups = {};
    airMeasurements.forEach(m => {
        if (!componentGroups[m.component_name]) {
            componentGroups[m.component_name] = [];
        }
        componentGroups[m.component_name].push({
            date: new Date(m.measurement_date),
            value: parseFloat(m.value)
        });
    });

    // Расчет сезонных средних значений для каждого компонента
    const seasonalAverages = {};
    Object.entries(componentGroups).forEach(([component, measurements]) => {
        seasonalAverages[component] = calculateSeasonalAverage(measurements);
    });

    // Расчет α (отношение текущих значений к сезонным средним) для последних измерений
    let alphaSum = 0;
    let alphaCount = 0;

    Object.entries(componentGroups).forEach(([component, measurements]) => {
        // Сортируем измерения по дате (от новых к старым)
        measurements.sort((a, b) => b.date - a.date);
        
        // Берем последнее измерение для каждого компонента
        if (measurements.length > 0 && seasonalAverages[component] > 0) {
            const latestMeasurement = measurements[0];
            const alpha = latestMeasurement.value / seasonalAverages[component];
            
            alphaSum += alpha;
            alphaCount++;
        }
    });

    // Расчет среднего значения α
    const alphaAvg = alphaCount > 0 ? alphaSum / alphaCount : 0;

    // Классификация уровня загрязнения
    let airQualityClass, airQualityText, airQualityColor;

    if (alphaAvg >= 1.5) {
        airQualityClass = 1;
        airQualityText = 'Високе забруднення';
        airQualityColor = '#FF5252'; // Красный
    } else if (alphaAvg >= 1.0) {
        airQualityClass = 2;
        airQualityText = 'Підвищене забруднення';
        airQualityColor = '#FFA726'; // Оранжевый
    } else if (alphaAvg >= 0.6) {
        airQualityClass = 3;
        airQualityText = 'Знижене забруднення';
        airQualityColor = '#FFEB3B'; // Желтый
    } else {
        airQualityClass = 4;
        airQualityText = 'Слабке забруднення';
        airQualityColor = '#66BB6A'; // Зеленый
    }

    return {
        value: alphaAvg.toFixed(2),
        class: airQualityClass,
        text: airQualityText,
        color: airQualityColor
    };
}

/**
 * Функция для расчета сезонных средних значений
 * @param {Array} measurements - Массив измерений
 * @returns {number} - Среднее значение
 */
function calculateSeasonalAverage(measurements) {
    if (measurements.length === 0) return 0;
    
    // Группировка измерений по сезонам
    const seasonalGroups = {
        winter: [], // Декабрь, Январь, Февраль
        spring: [], // Март, Апрель, Май
        summer: [], // Июнь, Июль, Август
        autumn: []  // Сентябрь, Октябрь, Ноябрь
    };
    
    measurements.forEach(m => {
        const month = m.date.getMonth();
        if (month >= 2 && month <= 4) {
            seasonalGroups.spring.push(m.value);
        } else if (month >= 5 && month <= 7) {
            seasonalGroups.summer.push(m.value);
        } else if (month >= 8 && month <= 10) {
            seasonalGroups.autumn.push(m.value);
        } else {
            seasonalGroups.winter.push(m.value);
        }
    });
    
    // Определение текущего сезона
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let currentSeason;
    
    if (currentMonth >= 2 && currentMonth <= 4) {
        currentSeason = 'spring';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
        currentSeason = 'summer';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
        currentSeason = 'autumn';
    } else {
        currentSeason = 'winter';
    }
    
    // Расчет среднего значения для текущего сезона
    const seasonValues = seasonalGroups[currentSeason];
    if (seasonValues.length === 0) {
        // Если нет данных для текущего сезона, используем все данные
        const allValues = [].concat(...Object.values(seasonalGroups));
        return allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    }
    
    return seasonValues.reduce((sum, val) => sum + val, 0) / seasonValues.length;
}

/**
 * Создает HTML-элемент отображения индикатора качества воздуха
 * @param {Object} airQualityData - Данные о качестве воздуха
 * @returns {HTMLElement} - HTML-элемент
 */
export function createAirQualityIndicator(airQualityData) {
    const container = document.createElement('div');
    container.className = 'air-quality-indicator';
    container.style.marginTop = '10px';
    container.style.marginBottom = '10px';
    
    if (!airQualityData.value) {
        container.textContent = airQualityData.text;
        return container;
    }
    
    // Создание индикатора
    const indicator = document.createElement('div');
    indicator.className = 'air-quality-value';
    indicator.style.display = 'inline-block';
    indicator.style.padding = '8px 12px';
    indicator.style.borderRadius = '4px';
    indicator.style.backgroundColor = airQualityData.color;
    indicator.style.color = airQualityData.class > 2 ? '#000' : '#fff';
    indicator.style.fontWeight = 'bold';
    indicator.style.textAlign = 'center';
    indicator.style.minWidth = '40px';
    indicator.textContent = airQualityData.value;
    
    // Заголовок
    const title = document.createElement('div');
    title.className = 'air-quality-title';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.textContent = 'Iндекс забруднення повітря:';
    
    // Текстовое описание
    const description = document.createElement('div');
    description.className = 'air-quality-description';
    description.style.marginTop = '5px';
    description.textContent = airQualityData.text;
    
    container.appendChild(title);
    container.appendChild(indicator);
    container.appendChild(description);
    
    return container;
}