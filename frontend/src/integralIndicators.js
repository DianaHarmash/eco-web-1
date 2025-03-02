// Импортируем функции для расчета показателя загрязнения воздуха
import { calculateAirQualityIndex } from './airQualityIndex.js';

/**
 * Рассчитывает все доступные интегральные показатели для объекта
 * @param {Object} factory - Данные о фабрике с измерениями
 * @returns {Object} - Объект с рассчитанными показателями по каждой подсистеме
 */
export function calculateAllIndicators(factory) {
    if (!factory || !factory.measurements) {
        return {};
    }

    const indicators = {};

    // Расчет показателя загрязнения воздуха
    indicators.airQuality = calculateAirQualityIndex(factory.measurements);
    
    // Заглушки для остальных показателей (в будущем можно реализовать)
    indicators.waterQuality = calculateDummyIndicator('Якість води', 'Немає даних про якість води');
    indicators.soilQuality = calculateDummyIndicator('Стан ґрунтів', 'Немає даних про стан ґрунтів');
    indicators.radiationLevel = calculateDummyIndicator('Рівень радіації', 'Немає даних про рівень радіації');
    indicators.economyStatus = calculateDummyIndicator('Економічний стан', 'Немає економічних даних');
    indicators.healthStatus = calculateDummyIndicator('Стан здоров\'я', 'Немає даних про стан здоров\'я');
    indicators.energyStatus = calculateDummyIndicator('Енергетичний стан', 'Немає даних про енергетичний стан');

    return indicators;
}

/**
 * Создает заглушку для индикатора (для демонстрации UI)
 * @param {string} name - Название индикатора
 * @param {string} noDataMessage - Сообщение при отсутствии данных
 * @returns {Object} - Заглушка индикатора
 */
function calculateDummyIndicator(name, noDataMessage) {
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
    const container = document.createElement('div');
    container.className = 'indicators-container';
    container.style.marginTop = '15px';
    
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
    
    // Перебираем показатели в нужном порядке
    indicatorOrder.forEach(key => {
        const indicator = indicators[key];
        
        // Пропускаем отсутствующие показатели
        if (!indicator) {
            return;
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
        if (indicator.value) {
            const indicatorValue = document.createElement('span');
            indicatorValue.className = 'indicator-value';
            indicatorValue.style.display = 'inline-block';
            indicatorValue.style.padding = '4px 8px';
            indicatorValue.style.borderRadius = '4px';
            indicatorValue.style.backgroundColor = indicator.color;
            indicatorValue.style.color = ['#FF5252', '#FFA726'].includes(indicator.color) ? '#fff' : '#000';
            indicatorValue.style.fontWeight = 'bold';
            indicatorValue.style.marginRight = '8px';
            indicatorValue.textContent = indicator.value;
            
            indicatorContainer.appendChild(indicatorValue);
        }
        
        // Текстовое описание
        const indicatorText = document.createElement('span');
        indicatorText.className = 'indicator-text';
        indicatorText.textContent = indicator.text;
        
        indicatorContainer.appendChild(indicatorText);
        
        container.appendChild(indicatorContainer);
    });
    
    return container;
}