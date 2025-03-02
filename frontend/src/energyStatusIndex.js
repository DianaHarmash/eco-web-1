// energyStatusIndex.js - Функции для расчета интегрального показателя энергетического состояния

/**
 * Информация о категориях энергетических показателей с их весами и базовыми значениями
 */
const ENERGY_INDICATORS = {
    'обсяги використання води': {
        type: 'consumption',
        weight: 1.0,
        shortName: 'Використання води',
        unit: 'м³',
        efficiency: { low: 0, medium: 50, high: 80 } // % эффективности использования
    },
    'обсяги використання електроенергії': {
        type: 'consumption',
        weight: 1.2,
        shortName: 'Використання електроенергії',
        unit: 'кВт·год',
        efficiency: { low: 0, medium: 60, high: 85 }
    },
    'обсяги використання газу': {
        type: 'consumption',
        weight: 1.1,
        shortName: 'Використання газу',
        unit: 'м³',
        efficiency: { low: 0, medium: 55, high: 85 }
    },
    'обсяги використання теплової енергії': {
        type: 'consumption',
        weight: 1.1,
        shortName: 'Використання теплової енергії',
        unit: 'Гкал',
        efficiency: { low: 0, medium: 60, high: 90 }
    },
    'середні обсяги споживання': {
        type: 'average',
        weight: 0.8,
        shortName: 'Середнє споживання',
        unit: '',
        efficiency: { low: 0, medium: 50, high: 80 }
    },
    'енергоефективність будівлі або виробництва': {
        type: 'efficiency',
        weight: 1.5,
        shortName: 'Енергоефективність',
        unit: '%',
        efficiency: { low: 0, medium: 65, high: 90 }
    }
};

/**
 * Ключевые слова для распознавания энергетических показателей
 */
const ENERGY_INDICATOR_KEYWORDS = {
    'обсяги використання води': ['вод', 'water', 'водоспожив', 'водопотр'],
    'обсяги використання електроенергії': ['електро', 'electr', 'электр', 'струм', 'ток'],
    'обсяги використання газу': ['газ', 'gas', 'газов', 'газоспожив', 'газопотр'],
    'обсяги використання теплової енергії': ['тепл', 'heat', 'отопл', 'опал'],
    'середні обсяги споживання': ['середн', 'average', 'середньо', 'средн'],
    'енергоефективність будівлі або виробництва': ['ефект', 'effic', 'эффект']
};

/**
 * Среднее потребление энергоресурсов различными типами зданий/сооружений (эталонные значения)
 * Используются для нормализации показателей
 */
const AVERAGE_CONSUMPTION = {
    'water': { // м³ на 1000 м² в месяц
        'office': 50,
        'industrial': 250,
        'residential': 150,
        'commercial': 100,
        'default': 120
    },
    'electricity': { // кВт·ч на 1000 м² в месяц
        'office': 12000,
        'industrial': 50000,
        'residential': 10000,
        'commercial': 15000,
        'default': 18000
    },
    'gas': { // м³ на 1000 м² в месяц в отопительный сезон
        'office': 6000,
        'industrial': 25000,
        'residential': 8000,
        'commercial': 7000,
        'default': 9000
    },
    'heat': { // Гкал на 1000 м² в месяц в отопительный сезон
        'office': 100,
        'industrial': 200,
        'residential': 120,
        'commercial': 90,
        'default': 130
    }
};

/**
 * Расчет интегрального показателя энергетического состояния
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateEnergyStatusIndex(measurements) {
    console.log('Начало расчета показателя энергетического состояния');
    
    // Фильтрация данных по категории "Енергетичний стан"
    const energyMeasurements = measurements.filter(m => 
        m.category_name && (
            m.category_name.toLowerCase().includes('енерг') || 
            m.category_name.toLowerCase().includes('энерг') ||
            m.category_name.toLowerCase().includes('energ') ||
            m.category_name.toLowerCase().includes('споживан') ||
            m.category_name.toLowerCase().includes('використан')
        )
    );
    
    console.log(`Найдено ${energyMeasurements.length} измерений для энергетического состояния`);
    
    if (energyMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про енергетичний стан',
            color: '#999999'
        };
    }
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    energyMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    console.log(`Уникальных энергетических компонентов: ${Object.keys(latestMeasurements).length}`);
    console.log('Список компонентов:', Object.keys(latestMeasurements));
    
    // Анализ потребления различных энергоресурсов
    const consumptionByResourceType = {
        water: [],
        electricity: [],
        gas: [],
        heat: [],
        average: [],
        efficiency: []
    };
    
    // Для группировки данных по месяцам
    const monthlyConsumption = {};
    
    // Распознавание и оценка энергетических показателей
    const recognizedIndicators = [];
    
    // Функция для определения типа ресурса
    const getResourceType = (componentName) => {
        const nameLower = componentName.toLowerCase();
        
        if (nameLower.includes('вод') || nameLower.includes('water')) {
            return 'water';
        } else if (nameLower.includes('електр') || nameLower.includes('electr') || nameLower.includes('электр')) {
            return 'electricity';
        } else if (nameLower.includes('газ') || nameLower.includes('gas')) {
            return 'gas';
        } else if (nameLower.includes('тепл') || nameLower.includes('heat')) {
            return 'heat';
        } else if (nameLower.includes('середн') || nameLower.includes('average')) {
            return 'average';
        } else if (nameLower.includes('ефект') || nameLower.includes('effic')) {
            return 'efficiency';
        }
        
        return 'other';
    };
    
    Object.entries(latestMeasurements).forEach(([componentName, measurement]) => {
        const componentNameLower = componentName.toLowerCase();
        const value = parseFloat(measurement.value);
        
        if (isNaN(value)) {
            console.log(`Пропущен компонент ${componentName} с некорректным значением ${measurement.value}`);
            return; // Пропускаем некорректные значения
        }
        
        // Определяем категорию энергетического показателя
        let matchedCategory = null;
        
        // Сначала проверяем прямое соответствие
        if (ENERGY_INDICATORS[componentNameLower]) {
            matchedCategory = componentNameLower;
        } else {
            // Затем ищем по ключевым словам
            for (const [category, keywords] of Object.entries(ENERGY_INDICATOR_KEYWORDS)) {
                if (keywords.some(keyword => componentNameLower.includes(keyword))) {
                    matchedCategory = category;
                    break;
                }
            }
        }
        
        if (matchedCategory) {
            const categoryInfo = ENERGY_INDICATORS[matchedCategory];
            const resourceType = getResourceType(componentName);
            
            // Сохраняем информацию о ресурсе
            if (resourceType !== 'other') {
                consumptionByResourceType[resourceType].push({
                    name: componentName,
                    value: value,
                    unit: measurement.unit || categoryInfo.unit,
                    date: measurement.measurement_date
                });
            }
            
            // Извлекаем месяц для группировки по месяцам
            const measurementDate = new Date(measurement.measurement_date);
            const monthKey = `${measurementDate.getFullYear()}-${measurementDate.getMonth() + 1}`;
            
            if (!monthlyConsumption[monthKey]) {
                monthlyConsumption[monthKey] = {};
            }
            
            if (!monthlyConsumption[monthKey][resourceType]) {
                monthlyConsumption[monthKey][resourceType] = [];
            }
            
            monthlyConsumption[monthKey][resourceType].push({
                name: componentName,
                value: value,
                unit: measurement.unit || categoryInfo.unit
            });
            
            // Рассчитываем энергоэффективность для ресурса
            let efficiency = 0.5; // По умолчанию средняя эффективность
            
            if (categoryInfo.type === 'efficiency') {
                // Для прямых показателей энергоэффективности
                efficiency = Math.min(1, Math.max(0, value / 100)); // Нормализуем проценты в диапазон 0-1
            } else if (resourceType !== 'other' && resourceType !== 'average') {
                // Для показателей потребления
                const baseConsumption = AVERAGE_CONSUMPTION[resourceType]?.default || 1;
                efficiency = Math.min(1, Math.max(0, 1 - (value / (baseConsumption * 2))));
            }
            
            // Добавляем в список распознанных показателей
            recognizedIndicators.push({
                name: componentName,
                category: matchedCategory,
                resourceType: resourceType,
                value: value,
                unit: measurement.unit || categoryInfo.unit,
                efficiency: efficiency,
                weight: categoryInfo.weight,
                weightedEfficiency: efficiency * categoryInfo.weight,
                date: measurement.measurement_date
            });
            
            console.log(`Компонент ${componentName} распознан как ${matchedCategory} (тип: ${resourceType}), значение: ${value}, эффективность: ${(efficiency * 100).toFixed(1)}%`);
        } else {
            console.log(`Не удалось распознать компонент: ${componentName}`);
        }
    });
    
    // Если нет распознанных показателей, возвращаем сообщение
    if (recognizedIndicators.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Недостатньо даних для оцінки енергетичного стану',
            color: '#999999'
        };
    }
    
    // Расчет интегрального показателя энергоэффективности
    let totalWeightedEfficiency = 0;
    let totalWeight = 0;
    
    recognizedIndicators.forEach(indicator => {
        totalWeightedEfficiency += indicator.weightedEfficiency;
        totalWeight += indicator.weight;
    });
    
    // Общий индекс энергоэффективности (от 0 до 100)
    const energyEfficiencyIndex = totalWeight > 0 ? (totalWeightedEfficiency / totalWeight) * 100 : 50;
    
    console.log(`Интегральный индекс энергоэффективности: ${energyEfficiencyIndex.toFixed(2)}`);
    
    // Расчет показателей среднего потребления по месяцам (если доступны данные)
    const monthlyAverages = {};
    let totalMonths = 0;
    
    Object.entries(monthlyConsumption).forEach(([month, resources]) => {
        totalMonths++;
        
        Object.entries(resources).forEach(([resourceType, values]) => {
            if (values.length > 0) {
                const total = values.reduce((sum, item) => sum + item.value, 0);
                const average = total / values.length;
                
                if (!monthlyAverages[resourceType]) {
                    monthlyAverages[resourceType] = { total: 0, count: 0 };
                }
                
                monthlyAverages[resourceType].total += average;
                monthlyAverages[resourceType].count++;
            }
        });
    });
    
    // Рассчитываем средние значения за весь период
    const overallAverages = {};
    
    Object.entries(monthlyAverages).forEach(([resourceType, data]) => {
        if (data.count > 0) {
            overallAverages[resourceType] = data.total / data.count;
        }
    });
    
    // Определяем наиболее и наименее эффективные ресурсы
    let mostEfficientResource = null;
    let leastEfficientResource = null;
    let highestEfficiency = -1;
    let lowestEfficiency = 2;
    
    recognizedIndicators.forEach(indicator => {
        if (indicator.efficiency > highestEfficiency) {
            highestEfficiency = indicator.efficiency;
            mostEfficientResource = indicator;
        }
        
        if (indicator.efficiency < lowestEfficiency) {
            lowestEfficiency = indicator.efficiency;
            leastEfficientResource = indicator;
        }
    });
    
    // Рассчитываем среднедневное использование за месяц и за год
    // по формулам из документа NP_KMEEEP53
    
    // Расчет общего количества дней работы для каждого ресурса
    const totalWorkingDays = {};
    
    Object.keys(monthlyConsumption).forEach(month => {
        Object.keys(monthlyConsumption[month]).forEach(resourceType => {
            if (!totalWorkingDays[resourceType]) {
                totalWorkingDays[resourceType] = 0;
            }
            
            // Предполагаем стандартное количество рабочих дней в месяце
            totalWorkingDays[resourceType] += 22; // Среднее количество рабочих дней в месяце
        });
    });
    
    // Расчет среднего потребления за день
    const dailyAverages = {};
    
    Object.entries(overallAverages).forEach(([resourceType, value]) => {
        if (totalWorkingDays[resourceType] && totalWorkingDays[resourceType] > 0) {
            dailyAverages[resourceType] = value / (totalWorkingDays[resourceType] / totalMonths);
        }
    });
    
    // Определение класса и текста в зависимости от индекса энергоэффективности
    let energyClass, energyText, energyColor;
    
    if (energyEfficiencyIndex >= 80) {
        energyClass = 1;
        energyText = 'Відмінний енергетичний стан';
        energyColor = '#26A69A'; // Бирюзовый
    } else if (energyEfficiencyIndex >= 60) {
        energyClass = 2;
        energyText = 'Добрий енергетичний стан';
        energyColor = '#66BB6A'; // Зеленый
    } else if (energyEfficiencyIndex >= 40) {
        energyClass = 3;
        energyText = 'Задовільний енергетичний стан';
        energyColor = '#FFEB3B'; // Желтый
    } else if (energyEfficiencyIndex >= 20) {
        energyClass = 4;
        energyText = 'Незадовільний енергетичний стан';
        energyColor = '#FFA726'; // Оранжевый
    } else {
        energyClass = 5;
        energyText = 'Критичний енергетичний стан';
        energyColor = '#FF5252'; // Красный
    }
    
    // Добавляем информацию о ресурсах
    let detailText = '';
    
    if (leastEfficientResource && leastEfficientResource.efficiency < 0.3) {
        detailText = ` (потребує оптимізації: ${leastEfficientResource.resourceType === 'water' ? 'водоспоживання' : 
                         leastEfficientResource.resourceType === 'electricity' ? 'електроспоживання' : 
                         leastEfficientResource.resourceType === 'gas' ? 'газоспоживання' : 
                         leastEfficientResource.resourceType === 'heat' ? 'теплоспоживання' : 
                         'енергоспоживання'})`;
    }
    
    return {
        value: Math.round(energyEfficiencyIndex),
        class: energyClass,
        text: energyText + detailText,
        color: energyColor,
        indicators: recognizedIndicators,
        mostEfficientResource: mostEfficientResource,
        leastEfficientResource: leastEfficientResource,
        monthlyConsumption: monthlyConsumption,
        overallAverages: overallAverages,
        dailyAverages: dailyAverages
    };
}