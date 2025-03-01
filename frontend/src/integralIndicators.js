// Импортируем функции для расчета показателей
import { calculateAirQualityIndex } from './airQualityIndex.js';
import { calculateWaterQualityIndex } from './waterQualityIndex.js';
import { calculateSoilQualityIndex } from './soilQualityIndex.js';
import { calculateRadiationLevelIndex } from './radiationLevelIndex.js';
import { calculateEconomyStatusIndex } from './economyStatusIndex.js';
import { calculateHealthStatusIndex } from './healthStatusIndex.js';
import { calculateEnergyStatusIndex } from './energyStatusIndex.js';

const HEALTH_INDICATORS = {
    'медико-демографічні показники': {
        shortName: 'Медико-демографічні'
    },
    'показники захворюваності та поширення хвороб': {
        shortName: 'Захворюваність'
    },
    'інвалідності та інвалідизації': {
        shortName: 'Інвалідність'
    },
    'фізичного розвитку населення': {
        shortName: 'Фізичний розвиток'
    },
    'ризики захворювання': {
        shortName: 'Ризики захворювань'
    },
    'прогноз захворювання': {
        shortName: 'Прогноз захворювань'
    },
    'прогноз тривалості життя': {
        shortName: 'Тривалість життя'
    }
};

/**
 * Рассчитывает все доступные интегральные показатели для объекта
 * @param {Object} factory - Данные о фабрике с измерениями
 * @returns {Object} - Объект с рассчитанными показателями по каждой подсистеме
 */
export function calculateAllIndicators(factory) {
    console.log('Начало расчета интегральных показателей для:', factory.factory_name);
    
    if (!factory || !factory.measurements) {
        console.warn('Отсутствуют данные factory или measurements');
        return {};
    }
    
    console.log(`Найдено ${factory.measurements.length} измерений`);
    
    const indicators = {};

    try {
        // Расчет показателя загрязнения воздуха
        indicators.airQuality = calculateAirQualityIndex(factory.measurements);
        console.log('Показатель качества воздуха рассчитан:', indicators.airQuality);
    } catch (error) {
        console.error('Ошибка при расчете показателя качества воздуха:', error);
        indicators.airQuality = createDummyIndicator('Якість повітря', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя качества воды
        indicators.waterQuality = calculateWaterQualityIndex(factory.measurements);
        console.log('Показатель качества воды рассчитан:', indicators.waterQuality);
    } catch (error) {
        console.error('Ошибка при расчете показателя качества воды:', error);
        indicators.waterQuality = createDummyIndicator('Якість води', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя загрязнения почв
        indicators.soilQuality = calculateSoilQualityIndex(factory.measurements);
        console.log('Показатель качества почв рассчитан:', indicators.soilQuality);
    } catch (error) {
        console.error('Ошибка при расчете показателя качества почв:', error);
        indicators.soilQuality = createDummyIndicator('Стан ґрунтів', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя радиационного состояния
        indicators.radiationLevel = calculateRadiationLevelIndex(factory.measurements);
        console.log('Показатель радиационного состояния рассчитан:', indicators.radiationLevel);
    } catch (error) {
        console.error('Ошибка при расчете показателя радиационного состояния:', error);
        indicators.radiationLevel = createDummyIndicator('Рівень радіації', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя экономического состояния
        indicators.economyStatus = calculateEconomyStatusIndex(factory.measurements);
        console.log('Показатель экономического состояния рассчитан:', indicators.economyStatus);
    } catch (error) {
        console.error('Ошибка при расчете показателя экономического состояния:', error);
        indicators.economyStatus = createDummyIndicator('Економічний стан', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя состояния здоровья населения
        indicators.healthStatus = calculateHealthStatusIndex(factory.measurements);
        console.log('Показатель состояния здоровья населения рассчитан:', indicators.healthStatus);
    } catch (error) {
        console.error('Ошибка при расчете показателя состояния здоровья населения:', error);
        indicators.healthStatus = createDummyIndicator('Стан здоров\'я', 'Помилка розрахунку');
    }
    
    try {
        // Расчет показателя энергетического состояния
        indicators.energyStatus = calculateEnergyStatusIndex(factory.measurements);
        console.log('Показатель энергетического состояния рассчитан:', indicators.energyStatus);
    } catch (error) {
        console.error('Ошибка при расчете показателя энергетического состояния:', error);
        indicators.energyStatus = createDummyIndicator('Енергетичний стан', 'Помилка розрахунку');
    }
    
    return indicators;
}

/**
 * Создает заглушку для индикатора
 * @param {string} name - Название индикатора
 * @param {string} noDataMessage - Сообщение при отсутствии данных
 * @returns {Object} - Заглушка индикатора
 */
function createDummyIndicator(name, noDataMessage) {
    return {
        value: null,
        class: null,
        text: noDataMessage,
        color: '#999999'
    };
}

/**
 * Создает HTML-элемент для отображения всех интегральных показателей
 * @param {Object} indicators - Объект с рассчитанными показателями
 * @returns {HTMLElement} - HTML-элемент с индикаторами
 */
export function createIndicatorsDisplay(indicators) {
    console.log('Создание отображения индикаторов:', indicators);
    
    const container = document.createElement('div');
    container.className = 'indicators-container';
    container.style.marginTop = '15px';
    container.style.marginBottom = '15px';
    
    // Проверка наличия показателей
    if (!indicators || Object.keys(indicators).length === 0) {
        console.warn('Отсутствуют данные для отображения индикаторов');
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Немає даних для відображення';
        noDataMessage.style.fontStyle = 'italic';
        noDataMessage.style.color = '#666';
        container.appendChild(noDataMessage);
        return container;
    }
    
    // Добавляем заголовок
    const title = document.createElement('h4');
    title.textContent = 'Інтегральні показники:';
    title.style.marginBottom = '10px';
    container.appendChild(title);
    
    // Определяем порядок отображения показателей
    const indicatorOrder = [
        'airQuality', 
        'waterQuality', 
        'soilQuality', 
        'radiationLevel', 
        'economyStatus', 
        'healthStatus', 
        'energyStatus'
    ];
    
    // Считаем, сколько показателей было добавлено
    let addedIndicators = 0;
    
    // Перебираем показатели в нужном порядке
    for (const key of indicatorOrder) {
        const indicator = indicators[key];
        
        // Пропускаем отсутствующие показатели
        if (!indicator) {
            continue;
        }
        
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'indicator-item';
        indicatorContainer.style.marginBottom = '8px';
        indicatorContainer.style.display = 'flex';
        indicatorContainer.style.alignItems = 'center';
        
        // Название показателя
        const indicatorName = document.createElement('span');
        indicatorName.className = 'indicator-name';
        indicatorName.style.marginRight = '10px';
        indicatorName.style.minWidth = '150px';
        
        switch(key) {
            case 'airQuality':
                indicatorName.textContent = 'Якість повітря:';
                break;
            case 'waterQuality':
                indicatorName.textContent = 'Якість води:';
                break;
            case 'soilQuality':
                indicatorName.textContent = 'Стан ґрунтів:';
                break;
            case 'radiationLevel':
                indicatorName.textContent = 'Рівень радіації:';
                break;
            case 'economyStatus':
                indicatorName.textContent = 'Економічний стан:';
                break;
            case 'healthStatus':
                indicatorName.textContent = 'Стан здоров\'я:';
                break;
            case 'energyStatus':
                indicatorName.textContent = 'Енергетичний стан:';
                break;
            default:
                indicatorName.textContent = key + ':';
        }
        
        indicatorContainer.appendChild(indicatorName);
        
        // Значение показателя (если есть)
        if (indicator.value !== null && indicator.value !== undefined) {
            const indicatorValue = document.createElement('span');
            indicatorValue.className = 'indicator-value';
            indicatorValue.style.display = 'inline-block';
            indicatorValue.style.padding = '4px 8px';
            indicatorValue.style.borderRadius = '4px';
            indicatorValue.style.backgroundColor = indicator.color || '#999999';
            indicatorValue.style.color = ['#FF5252', '#FFA726'].includes(indicator.color) ? '#fff' : '#000';
            indicatorValue.style.fontWeight = 'bold';
            indicatorValue.style.marginRight = '8px';
            
            // Форматирование для различных показателей
            if (key === 'waterQuality') {
                // Это процент качества (100% = хорошо, 0% = плохо)
                indicatorValue.textContent = indicator.value + '%';
                
                // Добавляем дополнительную информацию при наведении
                if (indicator.rawRatio) {
                    indicatorValue.title = `Відношення до ГДК: ${indicator.rawRatio}`;
                }
            } else {
                indicatorValue.textContent = indicator.value;
            }
            
            indicatorContainer.appendChild(indicatorValue);
        }
        
        // Текстовое описание
        const indicatorText = document.createElement('span');
        indicatorText.className = 'indicator-text';
        indicatorText.textContent = indicator.text || 'Немає опису';
        
        // Добавляем дополнительную информацию для различных показателей
        if (key === 'waterQuality' && indicator.value !== null) {
            // Дополнительная информация о качестве воды
            if (indicator.value === 0) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(критичний рівень!)</span>`;
            } else if (indicator.value < 20) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;">(низька якість)</span>`;
            } else if (indicator.value > 95) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#26A69A;font-weight:bold;">(дуже чиста)</span>`;
            }
            
            // Если есть информация о наихудшем загрязнителе
            if (indicator.worstContaminant && indicator.value < 80) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                detailSpan.textContent = `Найвищий показник: ${indicator.worstContaminant}`;
                indicatorText.appendChild(detailSpan);
            }
        } else if (key === 'soilQuality' && indicator.value !== null) {
            // Дополнительная информация о состоянии почв
            if (indicator.class >= 4) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(потребує покращення)</span>`;
            } else if (indicator.class === 3) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FFEB3B;font-style:italic;">(прийнятна якість)</span>`;
            }
            
            // Если есть информация о показателях
            if (indicator.indicators && indicator.indicators.length > 0) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                
                // Группируем показатели по качеству
                const goodIndicators = indicator.indicators.filter(i => i.normalizedValue >= 0.7);
                const mediumIndicators = indicator.indicators.filter(i => i.normalizedValue >= 0.4 && i.normalizedValue < 0.7);
                const badIndicators = indicator.indicators.filter(i => i.normalizedValue < 0.4);
                
                if (badIndicators.length > 0) {
                    const badNames = badIndicators.map(i => i.displayName.split(' ')[0]).join(', ');
                    detailSpan.textContent = `Проблемні показники: ${badNames}`;
                } else if (indicator.indicators.length >= 3) {
                    detailSpan.textContent = `Оцінено ${indicator.indicators.length} показників ґрунту`;
                }
                
                indicatorText.appendChild(detailSpan);
            }
        } else if (key === 'airQuality' && indicator.value !== null) {
            // Дополнительная информация о качестве воздуха
            const airValue = parseFloat(indicator.value);
            if (airValue >= 1.5) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(значне перевищення норми)</span>`;
            } else if (airValue >= 1.0) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FFA726;font-style:italic;">(перевищення норми)</span>`;
            } 
        }  else if (key === 'radiationLevel' && indicator.value !== null) {
            // Дополнительная информация о радиационном состоянии
            const radiationValue = parseFloat(indicator.value);
            
            if (indicator.class >= 3) {
                // Для повышенного и опасного уровня
                indicatorText.innerHTML = `${indicator.text} <span style="color:${indicator.color};font-weight:bold;">(потребує контролю)</span>`;
                
                if (indicator.risk && indicator.risk.category !== 'NEGLIGIBLE' && indicator.risk.category !== 'SMALL') {
                    const detailSpan = document.createElement('div');
                    detailSpan.style.fontSize = '0.9em';
                    detailSpan.style.marginTop = '3px';
                    detailSpan.style.color = '#666';
                    detailSpan.textContent = `Категорія ризику: ${indicator.risk.description}`;
                    indicatorText.appendChild(detailSpan);
                }
            } else {
                // Для нормального уровня
                if (radiationValue <= 0.2) {
                    indicatorText.innerHTML = `${indicator.text} <span style="color:#26A69A;font-style:italic;">(природний фон)</span>`;
                }
            }
             // Если есть информация о компоненте
             if (indicator.component) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                detailSpan.textContent = `Вимірювання: ${indicator.component}`;
                indicatorText.appendChild(detailSpan);
            }
        } else if (key === 'economyStatus' && indicator.value !== null) {
            // Дополнительная информация об экономическом состоянии
            if (indicator.class >= 4) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(потребує покращення)</span>`;
            } else if (indicator.class <= 2) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#66BB6A;font-style:italic;">(позитивна динаміка)</span>`;
            }
            
            // Добавляем детали по лучшим и худшим индикаторам
            if (indicator.indicators && indicator.indicators.length > 0) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                
                const details = [];
                
                // Если есть проблемный индикатор
                if (indicator.worstIndicator && indicator.worstIndicator.score < 0.3) {
                    details.push(`Проблемний: ${indicator.worstIndicator.shortName} (${indicator.worstIndicator.value} ${indicator.worstIndicator.unit})`);
                }
                
                // Если есть сильный индикатор
                if (indicator.bestIndicator && indicator.bestIndicator.score > 0.7) {
                    details.push(`Сильний: ${indicator.bestIndicator.shortName} (${indicator.bestIndicator.value} ${indicator.bestIndicator.unit})`);
                }
                
                if (details.length > 0) {
                    detailSpan.textContent = details.join(', ');
                    indicatorText.appendChild(detailSpan);
                } else {
                    // Если нет выделенных индикаторов, показываем общее количество
                    detailSpan.textContent = `Оцінено ${indicator.indicators.length} економічних показників`;
                    indicatorText.appendChild(detailSpan);
                }
            }
        } else if (key === 'healthStatus' && indicator.value !== null) {
            // Дополнительная информация о состоянии здоровья населения
            if (indicator.class >= 4) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(потребує уваги)</span>`;
            } else if (indicator.class <= 2) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#66BB6A;font-style:italic;">(позитивні показники)</span>`;
            }
            
            // Добавляем детали по категориям
            if (indicator.categories) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                
                const categoryCount = Object.keys(indicator.categories).length;
                
                // Если есть проблемная категория
                if (indicator.worstCategory && indicator.worstCategory.score < 0.3) {
                    const worstCategoryName = HEALTH_INDICATORS && 
                                             HEALTH_INDICATORS[indicator.worstCategory.category] ? 
                                             HEALTH_INDICATORS[indicator.worstCategory.category].shortName :
                                             indicator.worstCategory.category;
                    
                    detailSpan.textContent = `Проблемна категорія: ${worstCategoryName}`;
                } else if (categoryCount > 0) {
                    // Показываем количество оцененных категорий
                    detailSpan.textContent = `Оцінено ${categoryCount} ${categoryCount === 1 ? 'категорію' : 'категорії'} показників здоров'я`;
                }
                
                indicatorText.appendChild(detailSpan);
            }
        } else if (key === 'energyStatus' && indicator.value !== null) {
            // Дополнительная информация об энергетическом состоянии
            if (indicator.class >= 4) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#FF5252;font-weight:bold;">(енергонеефективно)</span>`;
            } else if (indicator.class <= 2) {
                indicatorText.innerHTML = `${indicator.text} <span style="color:#66BB6A;font-style:italic;">(енергоефективно)</span>`;
            }
            
            // Добавляем детали по ресурсам
            if (indicator.indicators && indicator.indicators.length > 0) {
                const detailSpan = document.createElement('div');
                detailSpan.style.fontSize = '0.9em';
                detailSpan.style.marginTop = '3px';
                detailSpan.style.color = '#666';
                
                const resourceTypes = new Set(indicator.indicators.map(i => i.resourceType));
                
                // Если есть наименее эффективный ресурс
                if (indicator.leastEfficientResource && indicator.leastEfficientResource.efficiency < 0.4) {
                    const resourceName = {
                        'water': 'водоспоживання',
                        'electricity': 'електроспоживання',
                        'gas': 'газоспоживання',
                        'heat': 'теплоспоживання'
                    }[indicator.leastEfficientResource.resourceType] || 'енергоспоживання';
                    
                    detailSpan.textContent = `Найменш ефективне: ${resourceName}`;
                } else if (resourceTypes.size > 0) {
                    // Показываем количество оцененных ресурсов
                    detailSpan.textContent = `Оцінено ${resourceTypes.size} ${resourceTypes.size === 1 ? 'вид' : 'види'} енергоресурсів`;
                }
                
                indicatorText.appendChild(detailSpan);
            }
        }
        
        indicatorContainer.appendChild(indicatorText);
        container.appendChild(indicatorContainer);
        
        addedIndicators++; // Увеличиваем счетчик добавленных индикаторов
    }
    
    // Если не было добавлено ни одного индикатора, показываем сообщение
    if (addedIndicators === 0) {
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Немає даних для відображення';
        noDataMessage.style.fontStyle = 'italic';
        noDataMessage.style.color = '#666';
        container.appendChild(noDataMessage);
    }
    
    return container;
}