// radiationLevelIndex.js - Функции для расчета интегрального показателя радиационного состояния

/**
 * Допустимые уровни радиационного фона (в мкЗв/ч)
 */
const RADIATION_LEVELS = {
    NORMAL: { max: 0.2, description: 'Звичайний рівень', class: 1, color: '#26A69A' },
    ACCEPTABLE: { max: 0.3, description: 'Нормальний рівень', class: 2, color: '#66BB6A' },
    ELEVATED: { max: 1.2, description: 'Підвищений рівень', class: 3, color: '#FFEB3B' },
    DANGEROUS: { max: Infinity, description: 'Небезпечний рівень', class: 4, color: '#FF5252' }
};

/**
 * Категории радиационного риска (риск/год)
 */
const RADIATION_RISK_CATEGORIES = {
    NEGLIGIBLE: { max: 1e-6, description: 'Знехтовний ризик', class: 1, color: '#26A69A' },
    SMALL: { max: 1e-5, description: 'Малий ризик', class: 2, color: '#66BB6A' },
    OPTIMIZATION_REQUIRED: { max: 5e-5, description: 'Необхідна оптимізація ризику', class: 3, color: '#FFEB3B' },
    UNACCEPTABLE: { max: Infinity, description: 'Недопустимий ризик', class: 4, color: '#FF5252' }
};

/**
 * Коэффициенты для расчета различных типов радиационных рисков
 */
const RADIATION_COEFFICIENTS = {
    // Примерные коэффициенты для расчета риска (радиологический эквивалент)
    GAMMA_DOSE_TO_RISK: 5e-5, // риск / (мЗв/год)
    // Коэффициенты для разных диапазонов доз
    DOSE_RANGES: [
        { max: 0.2, coefficient: 0.8 },  // Для доз до 0.2 мкЗв/ч
        { max: 0.3, coefficient: 1.0 },  // Для доз до 0.3 мкЗв/ч
        { max: 1.2, coefficient: 1.5 },  // Для доз до 1.2 мкЗв/ч
        { max: 10.0, coefficient: 2.0 }, // Для доз до 10 мкЗв/ч
        { max: Infinity, coefficient: 3.0 } // Для более высоких доз
    ]
};

/**
 * Расчет интегрального показателя радиационного состояния
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateRadiationLevelIndex(measurements) {
    console.log('Начало расчета показателя радиационного состояния');
    
    // Фильтрация данных по категории "Рівень радіації"
    const radiationMeasurements = measurements.filter(m => 
        m.category_name && (
            m.category_name.toLowerCase().includes('радіа') || 
            m.category_name.toLowerCase().includes('радиа') ||
            m.category_name.toLowerCase().includes('radia') ||
            m.category_name.toLowerCase().includes('радио') ||
            m.category_name.toLowerCase().includes('фон')
        )
    );
    
    console.log(`Найдено ${radiationMeasurements.length} измерений по радиации`);
    
    if (radiationMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про рівень радіації',
            color: '#999999'
        };
    }
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    radiationMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    console.log(`Уникальных компонентов радиации: ${Object.keys(latestMeasurements).length}`);
    console.log('Список компонентов:', Object.keys(latestMeasurements));
    
    // Найдем максимальное значение радиационного фона
    let maxRadiationLevel = 0;
    let maxRadiationComponent = null;
    
    Object.entries(latestMeasurements).forEach(([componentName, measurement]) => {
        const value = parseFloat(measurement.value);
        if (!isNaN(value) && value > maxRadiationLevel) {
            maxRadiationLevel = value;
            maxRadiationComponent = componentName;
        }
    });
    
    if (maxRadiationLevel === 0) {
        console.log('Не найдены корректные значения радиационного фона');
        return {
            value: null,
            class: null,
            text: 'Немає коректних даних про рівень радіації',
            color: '#999999'
        };
    }
    
    console.log(`Максимальный уровень радиации: ${maxRadiationLevel} (${maxRadiationComponent})`);
    
    // Определение категории радиационного фона
    let radiationCategory = null;
    for (const [category, limits] of Object.entries(RADIATION_LEVELS)) {
        if (maxRadiationLevel <= limits.max) {
            radiationCategory = { ...limits, category };
            break;
        }
    }
    
    if (!radiationCategory) {
        // На случай, если что-то пошло не так (такого не должно быть из-за Infinity)
        radiationCategory = { ...RADIATION_LEVELS.DANGEROUS, category: 'DANGEROUS' };
    }
    
    // Расчет радиационного риска
    let radiationRisk = 0;
    
    // Находим подходящий коэффициент для диапазона
    let doseCoefficient = 1.0;
    for (const range of RADIATION_COEFFICIENTS.DOSE_RANGES) {
        if (maxRadiationLevel <= range.max) {
            doseCoefficient = range.coefficient;
            break;
        }
    }
    
    // Рассчитываем годовую дозу в мЗв (предполагая постоянное воздействие)
    // 24 часа * 365 дней * уровень в мкЗв/ч / 1000 (перевод в мЗв)
    const annualDose = maxRadiationLevel * 24 * 365 / 1000;
    
    // Рассчитываем риск
    radiationRisk = annualDose * RADIATION_COEFFICIENTS.GAMMA_DOSE_TO_RISK * doseCoefficient;
    
    console.log(`Расчетная годовая доза: ${annualDose.toFixed(2)} мЗв, коэффициент: ${doseCoefficient}, риск: ${radiationRisk.toExponential(2)}`);
    
    // Определение категории риска
    let riskCategory = null;
    for (const [category, limits] of Object.entries(RADIATION_RISK_CATEGORIES)) {
        if (radiationRisk <= limits.max) {
            riskCategory = { ...limits, category };
            break;
        }
    }
    
    if (!riskCategory) {
        // На случай, если что-то пошло не так (такого не должно быть из-за Infinity)
        riskCategory = { ...RADIATION_RISK_CATEGORIES.UNACCEPTABLE, category: 'UNACCEPTABLE' };
    }
    
    // Формирование результата
    // Для отображения используем уровень радиации (более понятен обычным пользователям)
    // но в детали включаем информацию о риске
    
    let resultText = `${radiationCategory.description} радіаційного фону`;
    if (radiationCategory.category !== 'NORMAL' && radiationCategory.category !== 'ACCEPTABLE') {
        resultText += ` (${riskCategory.description})`;
    }
    
    return {
        value: maxRadiationLevel.toFixed(3),
        class: radiationCategory.class,
        text: resultText,
        color: radiationCategory.color,
        component: maxRadiationComponent,
        risk: {
            value: radiationRisk,
            category: riskCategory.category,
            description: riskCategory.description
        },
        details: {
            annualDose: annualDose,
            doseCoefficient: doseCoefficient
        }
    };
}