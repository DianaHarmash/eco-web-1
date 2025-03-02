// healthStatusIndex.js - Функции для расчета интегрального показателя состояния здоровья населения

/**
 * Информация о категориях показателей здоровья с их типом оценки и весами
 */
const HEALTH_INDICATORS = {
    'медико-демографічні показники': {
        type: 'lower-better', // Для большинства медико-демографических показателей низкие значения лучше
        exceptions: ['народжуваність', 'природний приріст'], // Исключения, где высокие значения лучше
        weight: 1.5,
        shortName: 'Медико-демографічні',
        subCategories: {
            'народжуваність': { type: 'higher-better', baseline: 15, weight: 1.2 }, // на 1000 населения
            'смертність': { type: 'lower-better', baseline: 10, weight: 1.3 }, // на 1000 населения
            'дитяча смертність': { type: 'lower-better', baseline: 5, weight: 1.5 }, // на 1000 живорожденных
            'природний приріст': { type: 'higher-better', baseline: 0, weight: 1.4 }, // на 1000 населения
            'смертність від хвороб системи кровообігу': { type: 'lower-better', baseline: 600, weight: 1.2 }, // на 100 000 населения
            'смертність від новоутворень': { type: 'lower-better', baseline: 160, weight: 1.2 } // на 100 000 населения
        }
    },
    'показники захворюваності та поширення хвороб': {
        type: 'lower-better', // Низкие показатели заболеваемости лучше
        weight: 1.4,
        shortName: 'Захворюваність',
        subCategories: {
            'загальна захворюваність': { type: 'lower-better', baseline: 60000, weight: 1.0 }, // на 100 000 населения
            'первинна захворюваність': { type: 'lower-better', baseline: 50000, weight: 1.1 }, // на 100 000 населения
            'хвороби системи кровообігу': { type: 'lower-better', baseline: 4000, weight: 1.2 }, // на 100 000 населения
            'хвороби органів дихання': { type: 'lower-better', baseline: 15000, weight: 1.1 }, // на 100 000 населения
            'хвороби органів травлення': { type: 'lower-better', baseline: 3000, weight: 1.0 }, // на 100 000 населения
            'інфекційні хвороби': { type: 'lower-better', baseline: 2000, weight: 1.3 } // на 100 000 населения
        }
    },
    'інвалідності та інвалідизації': {
        type: 'lower-better', // Низкие показатели инвалидности лучше
        weight: 1.3,
        shortName: 'Інвалідність',
        subCategories: {
            'загальна інвалідність': { type: 'lower-better', baseline: 60, weight: 1.1 }, // на 1000 населения
            'первинна інвалідність': { type: 'lower-better', baseline: 10, weight: 1.2 }, // на 1000 населения
            'інвалідність серед дітей': { type: 'lower-better', baseline: 20, weight: 1.3 }, // на 1000 детей
            'інвалідність внаслідок травм': { type: 'lower-better', baseline: 3, weight: 1.0 } // на 1000 населения
        }
    },
    'фізичного розвитку населення': {
        type: 'optimal-range', // Оптимальные значения в определенном диапазоне
        weight: 1.1,
        shortName: 'Фізичний розвиток',
        subCategories: {
            'частка дітей з нормальним фізичним розвитком': { type: 'higher-better', baseline: 80, weight: 1.2 }, // %
            'частка осіб з надлишковою вагою': { type: 'lower-better', baseline: 20, weight: 1.0 }, // %
            'частка осіб з дефіцитом ваги': { type: 'lower-better', baseline: 5, weight: 1.0 }, // %
            'середній зріст дітей': { type: 'optimal-range', baseline: [140, 180], weight: 0.9 } // см (зависит от возраста)
        }
    },
    'ризики захворювання': {
        type: 'lower-better', // Низкие риски лучше
        weight: 1.2,
        shortName: 'Ризики захворювань',
        subCategories: {
            'ризик серцево-судинних захворювань': { type: 'lower-better', baseline: 10, weight: 1.3 }, // %
            'ризик онкологічних захворювань': { type: 'lower-better', baseline: 5, weight: 1.3 }, // %
            'ризик інфекційних захворювань': { type: 'lower-better', baseline: 3, weight: 1.2 }, // %
            'ризик цукрового діабету': { type: 'lower-better', baseline: 5, weight: 1.1 } // %
        }
    },
    'прогноз захворювання': {
        type: 'higher-better', // Благоприятный прогноз (высокие значения) лучше
        weight: 1.1,
        shortName: 'Прогноз захворювань',
        subCategories: {
            'прогноз одужання': { type: 'higher-better', baseline: 80, weight: 1.2 }, // %
            'прогноз ускладнень': { type: 'lower-better', baseline: 20, weight: 1.1 }, // %
            'прогноз виживання': { type: 'higher-better', baseline: 90, weight: 1.3 } // %
        }
    },
    'прогноз тривалості життя': {
        type: 'higher-better', // Высокая продолжительность жизни лучше
        weight: 1.6,
        shortName: 'Тривалість життя',
        subCategories: {
            'очікувана тривалість життя при народженні': { type: 'higher-better', baseline: 75, weight: 1.5 }, // лет
            'очікувана тривалість здорового життя': { type: 'higher-better', baseline: 65, weight: 1.4 }, // лет
            'очікувана тривалість життя у віці 60 років': { type: 'higher-better', baseline: 20, weight: 1.2 } // лет
        }
    }
};

/**
 * Ключевые слова для распознавания категорий и подкатегорий показателей здоровья
 */
const HEALTH_INDICATOR_KEYWORDS = {
    // Категории
    'медико-демографічні показники': [
        'демограф', 'народжуван', 'смертн', 'приріст', 'вік', 'населення', 'демогр', 'рожд', 'смерт'
    ],
    'показники захворюваності та поширення хвороб': [
        'захворюва', 'хвороб', 'патолог', 'заболева', 'болезн', 'поширен', 'распространен'
    ],
    'інвалідності та інвалідизації': [
        'інвалід', 'непрацездат', 'неповносправ', 'инвалид', 'нетрудоспособ'
    ],
    'фізичного розвитку населення': [
        'фізичн', 'розвит', 'фізик', 'развит', 'зріст', 'рост', 'вага', 'вес'
    ],
    'ризики захворювання': [
        'ризик', 'риск', 'ймовірн', 'вероятн', 'фактор'
    ],
    'прогноз захворювання': [
        'прогноз', 'передбач', 'предсказ', 'предикт', 'предвид'
    ],
    'прогноз тривалості життя': [
        'тривал', 'продолж', 'життя', 'жизн', 'виживан', 'выжива'
    ],
    
    // Подкатегории
    'народжуваність': ['народжуван', 'рождаем'],
    'смертність': ['смертн', 'смерт', 'летальн'],
    'дитяча смертність': ['дитяч', 'детск', 'младенч', 'немовля'],
    'природний приріст': ['приріст', 'прирост'],
    'смертність від хвороб системи кровообігу': ['кровообіг', 'кровообращ', 'серцев', 'сердеч'],
    'смертність від новоутворень': ['новоутвор', 'онко', 'рак'],
    
    'загальна захворюваність': ['загальн', 'общ', 'всего'],
    'первинна захворюваність': ['первинн', 'первичн', 'нові', 'новые'],
    'хвороби системи кровообігу': ['серц', 'сердц', 'кровообіг', 'кровообращ', 'інфаркт', 'інсульт'],
    'хвороби органів дихання': ['дихан', 'легені', 'бронхіт', 'пневмоні'],
    'хвороби органів травлення': ['травл', 'шлунк', 'желудок', 'печінк', 'печень'],
    'інфекційні хвороби': ['інфекц', 'вірус', 'бактері'],
    
    'загальна інвалідність': ['загальн', 'общ', 'всего'],
    'первинна інвалідність': ['первинн', 'первичн', 'нові', 'новые'],
    'інвалідність серед дітей': ['діт', 'дет'],
    'інвалідність внаслідок травм': ['травм', 'ушкодж', 'поврежд'],
    
    'частка дітей з нормальним фізичним розвитком': ['нормальн', 'діт', 'дет'],
    'частка осіб з надлишковою вагою': ['надлишк', 'избыточ', 'ожирін', 'ожирен'],
    'частка осіб з дефіцитом ваги': ['дефіцит', 'недостатн', 'худ'],
    'середній зріст дітей': ['зріст', 'рост', 'діт', 'дет'],
    
    'ризик серцево-судинних захворювань': ['серц', 'сердц', 'судин'],
    'ризик онкологічних захворювань': ['онко', 'рак', 'злояк', 'злокач'],
    'ризик інфекційних захворювань': ['інфекц', 'вірус', 'бактері'],
    'ризик цукрового діабету': ['діабет', 'цукр', 'сахар'],
    
    'прогноз одужання': ['одуж', 'выздоров', 'ремісі', 'ремиссия'],
    'прогноз ускладнень': ['ускладн', 'осложн'],
    'прогноз виживання': ['вижива', 'выжива', 'пережива'],
    
    'очікувана тривалість життя при народженні': ['народж', 'рожден'],
    'очікувана тривалість здорового життя': ['здоров', 'здрав'],
    'очікувана тривалість життя у віці 60 років': ['60', 'стар', 'пенсійн', 'пенсион', 'похил']
};

/**
 * Расчет интегрального показателя состояния здоровья населения
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateHealthStatusIndex(measurements) {
    console.log('Начало расчета показателя состояния здоровья населения');
    
    // Фильтрация данных по категории "Стан здоров'я населення"
    const healthMeasurements = measurements.filter(m => 
        m.category_name && (
            m.category_name.toLowerCase().includes('здоров') || 
            m.category_name.toLowerCase().includes('захворюван') ||
            m.category_name.toLowerCase().includes('медик') ||
            m.category_name.toLowerCase().includes('медиц') ||
            m.category_name.toLowerCase().includes('health') ||
            m.category_name.toLowerCase().includes('medic')
        )
    );
    
    console.log(`Найдено ${healthMeasurements.length} измерений для состояния здоровья`);
    
    if (healthMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про стан здоров\'я населення',
            color: '#999999'
        };
    }
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    healthMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    console.log(`Уникальных компонентов здоровья: ${Object.keys(latestMeasurements).length}`);
    console.log('Список компонентов:', Object.keys(latestMeasurements));
    
    // Распознавание и оценка показателей здоровья
    const recognizedIndicators = [];
    const indicatorsByCategory = {};
    
    Object.entries(latestMeasurements).forEach(([componentName, measurement]) => {
        const componentNameLower = componentName.toLowerCase();
        const value = parseFloat(measurement.value);
        
        if (isNaN(value)) {
            console.log(`Пропущен компонент ${componentName} с некорректным значением ${measurement.value}`);
            return; // Пропускаем некорректные значения
        }
        
        // Определяем категорию и подкатегорию
        let matchedCategory = null;
        let matchedSubCategory = null;
        
        // Сначала ищем категорию
        for (const [category, keywords] of Object.entries(HEALTH_INDICATOR_KEYWORDS)) {
            // Пропускаем подкатегории на этом этапе
            if (Object.values(HEALTH_INDICATORS).some(ind => ind.subCategories && ind.subCategories[category])) {
                continue;
            }
            
            if (keywords.some(keyword => componentNameLower.includes(keyword))) {
                matchedCategory = category;
                break;
            }
        }
        
        // Если категория найдена, ищем подкатегорию
        if (matchedCategory && HEALTH_INDICATORS[matchedCategory]) {
            const { subCategories } = HEALTH_INDICATORS[matchedCategory];
            
            if (subCategories) {
                for (const [subCategory, keywords] of Object.entries(HEALTH_INDICATOR_KEYWORDS)) {
                    if (subCategories[subCategory] && keywords.some(keyword => componentNameLower.includes(keyword))) {
                        matchedSubCategory = subCategory;
                        break;
                    }
                }
            }
        } else {
            // Если категория не найдена, пробуем найти по подкатегории
            for (const [category, info] of Object.entries(HEALTH_INDICATORS)) {
                if (info.subCategories) {
                    for (const [subCategory, subInfo] of Object.entries(info.subCategories)) {
                        if (HEALTH_INDICATOR_KEYWORDS[subCategory] && 
                            HEALTH_INDICATOR_KEYWORDS[subCategory].some(keyword => componentNameLower.includes(keyword))) {
                            matchedCategory = category;
                            matchedSubCategory = subCategory;
                            break;
                        }
                    }
                    if (matchedSubCategory) break;
                }
            }
        }
        
        // Если не удалось определить категорию или подкатегорию, пытаемся определить по категории измерения
        if (!matchedCategory && measurement.category_name) {
            const categoryNameLower = measurement.category_name.toLowerCase();
            
            for (const [category, keywords] of Object.entries(HEALTH_INDICATOR_KEYWORDS)) {
                // Пропускаем подкатегории
                if (Object.values(HEALTH_INDICATORS).some(ind => ind.subCategories && ind.subCategories[category])) {
                    continue;
                }
                
                if (keywords.some(keyword => categoryNameLower.includes(keyword))) {
                    matchedCategory = category;
                    break;
                }
            }
        }
        
        if (matchedCategory) {
            const categoryInfo = HEALTH_INDICATORS[matchedCategory];
            let subCategoryInfo = null;
            
            if (matchedSubCategory && categoryInfo.subCategories && categoryInfo.subCategories[matchedSubCategory]) {
                subCategoryInfo = categoryInfo.subCategories[matchedSubCategory];
            }
            
            // Определяем тип оценки и базовое значение
            const indicatorType = subCategoryInfo ? subCategoryInfo.type : categoryInfo.type;
            const indicatorBaseline = subCategoryInfo ? subCategoryInfo.baseline : null;
            const indicatorWeight = subCategoryInfo ? subCategoryInfo.weight : categoryInfo.weight;
            
            // Расчет нормализованного показателя (от 0 до 1)
            let normalizedValue;
            
            if (indicatorType === 'lower-better') {
                // Для показателей, где меньшее значение лучше
                if (indicatorBaseline) {
                    normalizedValue = value <= 0 ? 1 : Math.max(0, 1 - (value / (indicatorBaseline * 2)));
                } else {
                    // Без базового значения используем линейную нормализацию
                    normalizedValue = Math.max(0, 1 - (value / 100));
                }
            } else if (indicatorType === 'higher-better') {
                // Для показателей, где большее значение лучше
                if (indicatorBaseline) {
                    normalizedValue = value >= indicatorBaseline * 2 ? 1 : Math.min(1, value / indicatorBaseline);
                } else {
                    // Без базового значения используем линейную нормализацию
                    normalizedValue = Math.min(1, value / 100);
                }
            } else if (indicatorType === 'optimal-range' && Array.isArray(indicatorBaseline)) {
                // Для показателей с оптимальным диапазоном
                const [min, max] = indicatorBaseline;
                if (value >= min && value <= max) {
                    normalizedValue = 1;
                } else if (value < min) {
                    normalizedValue = Math.max(0, value / min);
                } else {
                    normalizedValue = Math.max(0, max / value);
                }
            } else {
                // По умолчанию используем нейтральную оценку
                normalizedValue = 0.5;
            }
            
            // Формирование информации о показателе
            const indicator = {
                name: componentName,
                category: matchedCategory,
                subCategory: matchedSubCategory,
                value: value,
                unit: measurement.unit || '',
                normalizedValue: normalizedValue,
                weight: indicatorWeight,
                weightedValue: normalizedValue * indicatorWeight,
                date: measurement.measurement_date
            };
            
            // Добавляем в списки
            recognizedIndicators.push(indicator);
            
            if (!indicatorsByCategory[matchedCategory]) {
                indicatorsByCategory[matchedCategory] = [];
            }
            indicatorsByCategory[matchedCategory].push(indicator);
            
            console.log(`Компонент ${componentName} распознан как ${matchedCategory}${matchedSubCategory ? ' / ' + matchedSubCategory : ''}, значение: ${value}, нормализованное: ${normalizedValue.toFixed(2)}`);
        } else {
            console.log(`Не удалось распознать компонент: ${componentName}`);
        }
    });
    
    // Если нет распознанных показателей, возвращаем сообщение
    if (recognizedIndicators.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Недостатньо даних для оцінки стану здоров\'я',
            color: '#999999'
        };
    }
    
    // Анализ показателей по категориям
    const categoryScores = {};
    const categoryWeights = {};
    
    Object.entries(indicatorsByCategory).forEach(([category, indicators]) => {
        // Расчет средневзвешенной оценки для категории
        let categoryScore = 0;
        let categoryWeight = 0;
        
        indicators.forEach(indicator => {
            categoryScore += indicator.weightedValue;
            categoryWeight += indicator.weight;
        });
        
        if (categoryWeight > 0) {
            categoryScores[category] = categoryScore / categoryWeight;
            categoryWeights[category] = HEALTH_INDICATORS[category].weight;
        }
    });
    
    // Расчет итогового интегрального индекса
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(categoryScores).forEach(([category, score]) => {
        const weight = categoryWeights[category];
        totalWeightedScore += score * weight;
        totalWeight += weight;
    });
    
    // Интегральный индекс (от 0 до 100)
    const healthIndex = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 50;
    
    console.log(`Интегральный индекс состояния здоровья: ${healthIndex.toFixed(2)}`);
    
    // Найдем наиболее проблемные и сильные категории
    const sortedCategories = Object.entries(categoryScores)
        .map(([category, score]) => ({ category, score }))
        .sort((a, b) => a.score - b.score);
    
    const worstCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
    const bestCategory = sortedCategories.length > 0 ? sortedCategories[sortedCategories.length - 1] : null;
    
    // Определение класса и текста в зависимости от индекса
    let healthClass, healthText, healthColor;
    
    if (healthIndex >= 80) {
        healthClass = 1;
        healthText = 'Дуже добрий стан здоров\'я населення';
        healthColor = '#26A69A'; // Бирюзовый
    } else if (healthIndex >= 60) {
        healthClass = 2;
        healthText = 'Добрий стан здоров\'я населення';
        healthColor = '#66BB6A'; // Зеленый
    } else if (healthIndex >= 40) {
        healthClass = 3;
        healthText = 'Задовільний стан здоров\'я населення';
        healthColor = '#FFEB3B'; // Желтый
    } else if (healthIndex >= 20) {
        healthClass = 4;
        healthText = 'Незадовільний стан здоров\'я населення';
        healthColor = '#FFA726'; // Оранжевый
    } else {
        healthClass = 5;
        healthText = 'Критичний стан здоров\'я населення';
        healthColor = '#FF5252'; // Красный
    }
    
    // Добавляем информацию о проблемных категориях
    let detailText = '';
    
    if (worstCategory && worstCategory.score < 0.3) {
        detailText = ` (проблемна категорія: ${HEALTH_INDICATORS[worstCategory.category].shortName})`;
    }
    
    return {
        value: Math.round(healthIndex),
        class: healthClass,
        text: healthText + detailText,
        color: healthColor,
        indicators: recognizedIndicators,
        categories: indicatorsByCategory,
        categoryScores: categoryScores,
        worstCategory: worstCategory,
        bestCategory: bestCategory
    };
}