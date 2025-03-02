// soilQualityIndex.js - Функции для расчета интегрального показателя состояния почв

/**
 * Данные о показателях состояния почв с их оптимальными значениями и весами для расчета
 */
const SOIL_INDICATORS = {
    'солонцюватість': { 
        optimalRange: [0, 0.5], 
        weight: 0.9, 
        type: 'lower-better', 
        name: 'Солонцюватість',
        unit: '%'
    },
    'бал бонітету': { 
        optimalRange: [80, 100], 
        weight: 1.2, 
        type: 'higher-better',
        name: 'Бал бонітету для складового ґрунту',
        unit: 'бали'
    },
    'гумус': { 
        optimalRange: [3, 6], 
        weight: 1.5, 
        type: 'higher-better',
        name: 'Гумус',
        unit: '%'
    },
    'рухомі сполуки калію': { 
        optimalRange: [120, 180], 
        weight: 0.8, 
        type: 'optimal-range',
        name: 'Рухомі сполуки калію (K2O)',
        unit: 'мг/кг'
    },
    'засоленість': { 
        optimalRange: [0, 0.25], 
        weight: 0.9, 
        type: 'lower-better',
        name: 'Засоленість',
        unit: '%'
    },
    'рухомі сполуки фосфору': { 
        optimalRange: [60, 120], 
        weight: 0.8, 
        type: 'optimal-range',
        name: 'Рухомі сполуки фосфору (P2O5)',
        unit: 'мг/кг'
    },
    'ph': { 
        optimalRange: [6.0, 7.5], 
        weight: 1.1, 
        type: 'optimal-range',
        name: 'pH',
        unit: ''
    },
    'забруднення хімічними речовинами': { 
        optimalRange: [0, 1], 
        weight: 1.5, 
        type: 'lower-better',
        name: 'Забруднення хімічними речовинами',
        unit: 'відн. од.'
    }
};

// Ключевые слова для распознавания показателей почв
const SOIL_INDICATOR_KEYWORDS = {
    'солонцюватість': ['солонцюват', 'солонцеват', 'солонц', 'солонеч', 'solonetz'],
    'бал бонітету': ['бонітет', 'бонит', 'боніт', 'бал бонітету', 'bonitet'],
    'гумус': ['гумус', 'органич', 'organic', 'humus'],
    'рухомі сполуки калію': ['калі', 'кали', 'к2о', 'k2o', 'калий', 'potassium'],
    'засоленість': ['засолен', 'засоленість', 'солен', 'salin'],
    'рухомі сполуки фосфору': ['фосфор', 'р2о5', 'p2o5', 'phosph'],
    'ph': ['ph', 'рн', 'кислотні', 'кислотн'],
    'забруднення хімічними речовинами': ['забрудн', 'химич', 'хіміч', 'contamination', 'pollution']
};

/**
 * Расчет интегрального показателя состояния почв
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateSoilQualityIndex(measurements) {
    console.log('Начало расчета показателя состояния почв');
    console.log('Всего измерений:', measurements.length);
    
    // Дополнительная отладочная информация по всем измерениям
    const categoryCounts = {};
    measurements.forEach(m => {
        if (m.category_name) {
            const catName = m.category_name;
            categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
        }
    });
    console.log('Распределение измерений по категориям:', categoryCounts);
    
    // Расширенная фильтрация данных для почв
    const soilMeasurements = measurements.filter(m => {
        // Проверяем различные варианты записи категории почв
        if (m.category_name) {
            const catNameLower = m.category_name.toLowerCase();
            
            if (catNameLower.includes('ґрунт') || 
                catNameLower.includes('грунт') || 
                catNameLower.includes('почв') || 
                catNameLower.includes('soil')) {
                return true;
            }
        }
        
        // Проверяем компонент на соответствие показателям почв
        if (m.component_name) {
            const compNameLower = m.component_name.toLowerCase();
            
            // Проверяем по ключевым словам показателей почв
            for (const keywords of Object.values(SOIL_INDICATOR_KEYWORDS)) {
                if (keywords.some(keyword => compNameLower.includes(keyword))) {
                    console.log(`Найден компонент почвы по ключевому слову: ${m.component_name}`);
                    return true;
                }
            }
        }
        
        return false;
    });
    
    console.log(`Найдено ${soilMeasurements.length} измерений для почв`);
    
    // Если нет измерений, связанных с почвой, возвращаем сообщение
    if (soilMeasurements.length === 0) {
        console.log('Измерения почвы не найдены');
        return {
            value: null,
            class: null,
            text: 'Немає даних про стан ґрунтів',
            color: '#999999'
        };
    }
    
    // Выводим список найденных измерений для диагностики
    soilMeasurements.forEach(m => {
        console.log(`Измерение почвы: ${m.component_name}, значение: ${m.value}, дата: ${m.measurement_date}`);
    });
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    soilMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    console.log(`Уникальных компонентов почвы: ${Object.keys(latestMeasurements).length}`);
    console.log('Список компонентов:', Object.keys(latestMeasurements));
    
    // Распознавание и оценка показателей почвы
    const recognizedIndicators = [];
    
    // Если есть хотя бы один показатель, считаем интегральный индекс
    // Даже если мы не можем распознать тип показателя, будем использовать его с нейтральной оценкой
    Object.entries(latestMeasurements).forEach(([componentName, measurement]) => {
        const componentNameLower = componentName.toLowerCase();
        const value = parseFloat(measurement.value);
        
        // Пропускаем некорректные значения
        if (isNaN(value)) {
            console.log(`Пропущен компонент ${componentName} с некорректным значением ${measurement.value}`);
            return;
        }
        
        // Пытаемся найти соответствующий показатель в нашем списке
        let matchedIndicator = null;
        
        // Сначала проверяем прямое соответствие
        if (SOIL_INDICATORS[componentNameLower]) {
            matchedIndicator = componentNameLower;
        } else {
            // Затем ищем по ключевым словам
            for (const [indicator, keywords] of Object.entries(SOIL_INDICATOR_KEYWORDS)) {
                if (keywords.some(keyword => componentNameLower.includes(keyword))) {
                    matchedIndicator = indicator;
                    break;
                }
            }
        }
        
        if (matchedIndicator) {
            const indicatorInfo = SOIL_INDICATORS[matchedIndicator];
            const { optimalRange, weight, type, name, unit } = indicatorInfo;
            
            // Расчет нормализованного показателя (от 0 до 1, где 1 - оптимальное состояние)
            let normalizedValue;
            
            if (type === 'lower-better') {
                // Для показателей, где меньшее значение лучше
                normalizedValue = value <= optimalRange[0] ? 1 : 
                    (value >= optimalRange[1] ? 0 : 
                    (optimalRange[1] - value) / (optimalRange[1] - optimalRange[0]));
            } else if (type === 'higher-better') {
                // Для показателей, где большее значение лучше
                normalizedValue = value >= optimalRange[1] ? 1 : 
                    (value <= optimalRange[0] ? 0 : 
                    (value - optimalRange[0]) / (optimalRange[1] - optimalRange[0]));
            } else if (type === 'optimal-range') {
                // Для показателей с оптимальным диапазоном
                if (value >= optimalRange[0] && value <= optimalRange[1]) {
                    normalizedValue = 1;
                } else if (value < optimalRange[0]) {
                    normalizedValue = value / optimalRange[0];
                } else {
                    normalizedValue = optimalRange[1] / value;
                }
            }
            
            // Добавляем в список распознанных показателей
            recognizedIndicators.push({
                name: componentName,
                displayName: name || componentName,
                value: value,
                unit: unit,
                normalizedValue: normalizedValue,
                weight: weight,
                weightedValue: normalizedValue * weight
            });
            
            console.log(`Компонент ${componentName} распознан как ${matchedIndicator}, значение: ${value}, нормализованное: ${normalizedValue.toFixed(2)}`);
        } else {
            // Для нераспознанных показателей используем нейтральную оценку
            // Это позволит расчитать хотя бы приблизительный индекс при любых данных
            console.log(`Не удалось распознать компонент: ${componentName}, используем нейтральную оценку`);
            
            // Добавляем с нейтральной оценкой
            recognizedIndicators.push({
                name: componentName,
                displayName: componentName,
                value: value,
                unit: '',
                normalizedValue: 0.5,  // Нейтральная оценка
                weight: 0.7,           // Средний вес
                weightedValue: 0.5 * 0.7
            });
        }
    });
    
    console.log(`Распознано ${recognizedIndicators.length} показателей почвы`);
    
    // Даже если нет явно распознанных показателей, но есть данные о почве,
    // предоставим базовую оценку на основе имеющихся данных
    if (recognizedIndicators.length === 0 && Object.keys(latestMeasurements).length > 0) {
        console.log('Используем базовую оценку для нераспознанных показателей');
        
        // Считаем, что любые данные лучше, чем ничего
        return {
            value: 50,  // Средняя оценка
            class: 3,   // Удовлетворительное состояние
            text: 'Задовільний стан ґрунтів (базова оцінка)',
            color: '#FFEB3B', // Желтый
            indicators: Object.entries(latestMeasurements).map(([name, measurement]) => ({
                name: name,
                value: measurement.value,
                displayName: name
            }))
        };
    }
    
    // Если совсем нет данных, возвращаем сообщение
    if (recognizedIndicators.length === 0) {
        console.log('Нет распознанных показателей почвы для расчета индекса');
        return {
            value: null,
            class: null,
            text: 'Недостатньо даних для оцінки стану ґрунтів',
            color: '#999999'
        };
    }
    
    // Расчет интегрального показателя как средневзвешенное значение
    const totalWeight = recognizedIndicators.reduce((sum, indicator) => sum + indicator.weight, 0);
    const weightedSum = recognizedIndicators.reduce((sum, indicator) => sum + indicator.weightedValue, 0);
    
    // Интегральный показатель (от 0 до 100, где 100 - отличное состояние)
    const integralIndex = (weightedSum / totalWeight) * 100;
    console.log(`Расчет интегрального индекса: ${weightedSum} / ${totalWeight} * 100 = ${integralIndex}`);
    
    // Находим наихудший показатель
    const worstIndicator = [...recognizedIndicators].sort((a, b) => a.normalizedValue - b.normalizedValue)[0];
    
    // Классификация состояния почв
    let soilQualityClass, soilQualityText, soilQualityColor;
    
    if (integralIndex >= 80) {
        soilQualityClass = 1;
        soilQualityText = 'Дуже добрий стан ґрунтів';
        soilQualityColor = '#26A69A'; // Бирюзовый
    } else if (integralIndex >= 60) {
        soilQualityClass = 2;
        soilQualityText = 'Добрий стан ґрунтів';
        soilQualityColor = '#66BB6A'; // Зеленый
    } else if (integralIndex >= 40) {
        soilQualityClass = 3;
        soilQualityText = 'Задовільний стан ґрунтів';
        soilQualityColor = '#FFEB3B'; // Желтый
    } else if (integralIndex >= 20) {
        soilQualityClass = 4;
        soilQualityText = 'Поганий стан ґрунтів';
        soilQualityColor = '#FFA726'; // Оранжевый
    } else {
        soilQualityClass = 5;
        soilQualityText = 'Дуже поганий стан ґрунтів';
        soilQualityColor = '#FF5252'; // Красный
    }
    
    // Добавляем информацию о проблемном показателе
    let detailText = '';
    if (worstIndicator && worstIndicator.normalizedValue < 0.5) {
        detailText = ` (проблемний показник: ${worstIndicator.displayName})`;
    }
    
    console.log(`Результат оценки почвы: класс ${soilQualityClass}, индекс ${Math.round(integralIndex)}`);
    
    return {
        value: Math.round(integralIndex),
        class: soilQualityClass,
        text: soilQualityText + detailText,
        color: soilQualityColor,
        indicators: recognizedIndicators,
        worstIndicator: worstIndicator
    };
}