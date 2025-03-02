// economyStatusIndex.js - Функции для расчета интегрального показателя экономического состояния

/**
 * Информация об экономических показателях с их типом оценки и весами
 */
const ECONOMIC_INDICATORS = {
    // Категории, которые лучше при более высоких значениях (higher-better)
    'валовий внутрішній продукт': { 
        type: 'higher-better',
        weight: 1.5,
        shortName: 'ВВП',
        unit: 'млн грн'
    },
    'вантажообіг': { 
        type: 'higher-better', 
        weight: 1.0,
        shortName: 'Вантажообіг',
        unit: 'млн т-км'
    },
    'пасажирообіг': { 
        type: 'higher-better', 
        weight: 1.0,
        shortName: 'Пасажирообіг',
        unit: 'млн пас-км'
    },
    'експорт товарів та послуг': { 
        type: 'higher-better', 
        weight: 1.2,
        shortName: 'Експорт',
        unit: 'млн дол. США'
    },
    'заробітна плата': { 
        type: 'higher-better', 
        weight: 1.3,
        shortName: 'Зарплата',
        unit: 'грн'
    },
    'індекс промислової продукції': { 
        type: 'higher-better', 
        weight: 1.1,
        shortName: 'Індекс промисловості',
        unit: '%'
    },
    'індекс обсягу сільськогосподарського виробництва': { 
        type: 'higher-better', 
        weight: 1.1,
        shortName: 'Індекс сільгосп',
        unit: '%'
    },
    'індекс будівельної продукції': { 
        type: 'higher-better', 
        weight: 1.0,
        shortName: 'Індекс будівництва',
        unit: '%'
    },
    
    // Категории, которые лучше при более низких значениях (lower-better)
    'індекс споживчих цін': { 
        type: 'lower-better', 
        weight: 1.2,
        shortName: 'ІСЦ',
        unit: '%'
    },
    'індекс цін виробників промислової продукції': { 
        type: 'lower-better', 
        weight: 1.1,
        shortName: 'Індекс цін виробників',
        unit: '%'
    },
    
    // Специальная категория с отдельной обработкой
    'імпорт товарів та послуг': { 
        type: 'special', 
        weight: 1.0,
        shortName: 'Імпорт',
        unit: 'млн дол. США'
    }
};

/**
 * Ключевые слова для распознавания экономических показателей
 */
const ECONOMIC_INDICATOR_KEYWORDS = {
    'валовий внутрішній продукт': ['ввп', 'валов', 'внутр', 'продукт', 'gdp'],
    'вантажообіг': ['вантаж', 'грузооб', 'freight'],
    'пасажирообіг': ['пасажир', 'пассажир', 'passenger'],
    'експорт товарів та послуг': ['експорт', 'экспорт', 'export'],
    'імпорт товарів та послуг': ['імпорт', 'импорт', 'import'],
    'заробітна плата': ['заробіт', 'зарплат', 'плата', 'salary', 'wage'],
    'індекс промислової продукції': ['промисл', 'промышл', 'industrial'],
    'індекс обсягу сільськогосподарського виробництва': ['сільськ', 'сельск', 'agricultural'],
    'індекс будівельної продукції': ['будів', 'строит', 'construction'],
    'індекс споживчих цін': ['споживч', 'потребит', 'consumer', 'price'],
    'індекс цін виробників промислової продукції': ['виробник', 'производит', 'producer']
};

/**
 * Расчет интегрального показателя экономического состояния
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateEconomyStatusIndex(measurements) {
    console.log('Начало расчета показателя экономического состояния');
    
    // Фильтрация данных по категории "Економічний стан"
    const economyMeasurements = measurements.filter(m => 
        m.category_name && (
            m.category_name.toLowerCase().includes('економ') || 
            m.category_name.toLowerCase().includes('эконом') ||
            m.category_name.toLowerCase().includes('econom')
        )
    );
    
    console.log(`Найдено ${economyMeasurements.length} измерений для экономического состояния`);
    
    if (economyMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про економічний стан',
            color: '#999999'
        };
    }
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    economyMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    console.log(`Уникальных экономических компонентов: ${Object.keys(latestMeasurements).length}`);
    console.log('Список компонентов:', Object.keys(latestMeasurements));
    
    // Распознавание экономических показателей
    const recognizedIndicators = [];
    const exportValue = { value: 0, found: false };
    const importValue = { value: 0, found: false };
    
    Object.entries(latestMeasurements).forEach(([componentName, measurement]) => {
        const componentNameLower = componentName.toLowerCase();
        const value = parseFloat(measurement.value);
        
        if (isNaN(value)) {
            console.log(`Пропущен компонент ${componentName} с некорректным значением ${measurement.value}`);
            return; // Пропускаем некорректные значения
        }
        
        // Пытаемся найти соответствующий экономический показатель
        let matchedIndicator = null;
        
        // Сначала проверяем прямое соответствие
        if (ECONOMIC_INDICATORS[componentNameLower]) {
            matchedIndicator = componentNameLower;
        } else {
            // Затем ищем по ключевым словам
            for (const [indicator, keywords] of Object.entries(ECONOMIC_INDICATOR_KEYWORDS)) {
                if (keywords.some(keyword => componentNameLower.includes(keyword))) {
                    matchedIndicator = indicator;
                    break;
                }
            }
        }
        
        if (matchedIndicator) {
            const indicatorInfo = ECONOMIC_INDICATORS[matchedIndicator];
            
            // Для экспорта и импорта сохраняем значения для расчета соотношения
            if (matchedIndicator === 'експорт товарів та послуг') {
                exportValue.value = value;
                exportValue.found = true;
            } else if (matchedIndicator === 'імпорт товарів та послуг') {
                importValue.value = value;
                importValue.found = true;
            }
            
            // Добавляем в список распознанных показателей
            recognizedIndicators.push({
                name: componentName,
                indicator: matchedIndicator,
                shortName: indicatorInfo.shortName,
                value: value,
                unit: indicatorInfo.unit,
                weight: indicatorInfo.weight,
                type: indicatorInfo.type,
                date: measurement.measurement_date
            });
            
            console.log(`Компонент ${componentName} распознан как ${matchedIndicator}, значение: ${value}`);
        } else {
            console.log(`Не удалось распознать компонент: ${componentName}`);
        }
    });
    
    // Если нет распознанных экономических показателей, возвращаем сообщение
    if (recognizedIndicators.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Недостатньо даних для оцінки економічного стану',
            color: '#999999'
        };
    }
    
    // Оценка экономического состояния по различным показателям
    const scoresByType = {
        'higher-better': [],
        'lower-better': [],
        'special': []
    };
    
    // Базовые оценки для разных типов показателей
    recognizedIndicators.forEach(indicator => {
        if (indicator.type === 'higher-better' || indicator.type === 'lower-better') {
            scoresByType[indicator.type].push(indicator);
        }
    });
    
    // Расчет соотношения экспорт/импорт, если есть оба показателя
    if (exportValue.found && importValue.found && importValue.value > 0) {
        const exportImportRatio = exportValue.value / importValue.value;
        console.log(`Соотношение экспорт/импорт: ${exportImportRatio.toFixed(2)}`);
        
        // Добавляем показатель соотношения экспорт/импорт
        recognizedIndicators.push({
            name: 'Співвідношення експорт/імпорт',
            indicator: 'export_import_ratio',
            shortName: 'Експорт/Імпорт',
            value: exportImportRatio,
            unit: '',
            weight: 1.4, // Высокий вес для этого важного показателя
            type: 'higher-better',
            date: new Date().toISOString().split('T')[0] // Текущая дата
        });
        
        scoresByType['higher-better'].push(recognizedIndicators[recognizedIndicators.length - 1]);
    }
    
    // Рассчитываем нормализованные оценки
    // Для high-better: 0 (худшее) до 1 (лучшее)
    // Для low-better: 0 (худшее) до 1 (лучшее)
    
    // Определяем типовые диапазоны для каждого типа показателей
    const normalizeIndicators = (indicators, type) => {
        if (indicators.length === 0) return [];
        
        // Если только один показатель в категории, используем фиксированную оценку
        if (indicators.length === 1) {
            indicators[0].score = 0.7; // Средне-высокая оценка для одиночных показателей
            return indicators;
        }
        
        // Определяем минимальные и максимальные значения
        const values = indicators.map(ind => ind.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue;
        
        // Нормализуем оценки
        indicators.forEach(indicator => {
            if (range === 0) {
                // Если все значения одинаковые
                indicator.score = 0.5;
            } else if (type === 'higher-better') {
                // Для показателей, где выше = лучше
                indicator.score = (indicator.value - minValue) / range;
            } else if (type === 'lower-better') {
                // Для показателей, где ниже = лучше
                indicator.score = 1 - (indicator.value - minValue) / range;
            }
        });
        
        return indicators;
    };
    
    // Нормализуем показатели для каждого типа
    const normalizedHigherBetter = normalizeIndicators(scoresByType['higher-better'], 'higher-better');
    const normalizedLowerBetter = normalizeIndicators(scoresByType['lower-better'], 'lower-better');
    
    // Объединяем все нормализованные показатели
    const allNormalizedIndicators = [...normalizedHigherBetter, ...normalizedLowerBetter];
    
    // Рассчитываем взвешенную оценку
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    allNormalizedIndicators.forEach(indicator => {
        totalWeightedScore += indicator.score * indicator.weight;
        totalWeight += indicator.weight;
    });
    
    // Интегральный индекс (от 0 до 100)
    const economyIndex = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 50;
    
    console.log(`Интегральный индекс экономического состояния: ${economyIndex.toFixed(2)}`);
    
    // Выделяем лучшие и худшие показатели
    const sortedIndicators = [...allNormalizedIndicators].sort((a, b) => a.score - b.score);
    const worstIndicator = sortedIndicators[0];
    const bestIndicator = sortedIndicators[sortedIndicators.length - 1];
    
    // Определение класса и текста в зависимости от индекса
    let economyClass, economyText, economyColor;
    
    if (economyIndex >= 80) {
        economyClass = 1;
        economyText = 'Відмінний економічний стан';
        economyColor = '#26A69A'; // Бирюзовый
    } else if (economyIndex >= 60) {
        economyClass = 2;
        economyText = 'Добрий економічний стан';
        economyColor = '#66BB6A'; // Зеленый
    } else if (economyIndex >= 40) {
        economyClass = 3;
        economyText = 'Задовільний економічний стан';
        economyColor = '#FFEB3B'; // Желтый
    } else if (economyIndex >= 20) {
        economyClass = 4;
        economyText = 'Незадовільний економічний стан';
        economyColor = '#FFA726'; // Оранжевый
    } else {
        economyClass = 5;
        economyText = 'Критичний економічний стан';
        economyColor = '#FF5252'; // Красный
    }
    
    // Добавляем информацию о проблемных и хороших показателях
    let detailText = '';
    
    if (worstIndicator && worstIndicator.score < 0.3) {
        detailText = ` (проблемний показник: ${worstIndicator.shortName})`;
    } else if (bestIndicator && bestIndicator.score > 0.7) {
        detailText = ` (сильний показник: ${bestIndicator.shortName})`;
    }
    
    return {
        value: Math.round(economyIndex),
        class: economyClass,
        text: economyText + detailText,
        color: economyColor,
        indicators: allNormalizedIndicators,
        worstIndicator: worstIndicator,
        bestIndicator: bestIndicator
    };
}