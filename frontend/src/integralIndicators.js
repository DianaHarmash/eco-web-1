// integralIndicators.js - функции для расчета интегральных показателей по всем подсистемам

// Импортируем функции для расчета показателей
import { calculateAirQualityIndex } from './airQualityIndex.js';
import { calculateWaterQualityIndex } from './waterQualityIndex.js';

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
    
    // Заглушки для остальных показателей
    indicators.soilQuality = createDummyIndicator('Стан ґрунтів', 'Немає даних про стан ґрунтів');
    indicators.radiationLevel = createDummyIndicator('Рівень радіації', 'Немає даних про рівень радіації');
    indicators.economyStatus = createDummyIndicator('Економічний стан', 'Немає економічних даних');
    indicators.healthStatus = createDummyIndicator('Стан здоров\'я', 'Немає даних про стан здоров\'я');
    indicators.energyStatus = createDummyIndicator('Енергетичний стан', 'Немає даних про енергетичний стан');
    
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
        
        // Добавляем дополнительную информацию для качества воды
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