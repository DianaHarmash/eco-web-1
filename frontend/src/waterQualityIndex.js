/**
 * Предельно допустимые концентрации (ПДК) для различных показателей воды
 */
const WATER_CONTAMINANTS = {
    // Химические вещества
    'свинець': { pdk: 0.01, class: 1 },
    'ртуть': { pdk: 0.0005, class: 1 },
    'кадмій': { pdk: 0.001, class: 1 },
    'нітрати': { pdk: 45, class: 2 },
    'нітрити': { pdk: 3.3, class: 2 },
    'хлориди': { pdk: 350, class: 2 },
    'сульфати': { pdk: 500, class: 2 },
    'залізо': { pdk: 0.3, class: 3 },
    'мідь': { pdk: 1.0, class: 3 },
    'цинк': { pdk: 5.0, class: 3 },
    'фосфати': { pdk: 3.5, class: 3 },
    'марганець': { pdk: 0.1, class: 3 },
    
    // Категории показателей
    'санітарно-хімічні (санітарно-токсикологічні)': { pdk: 1.0, class: 1, baseQuality: 10 },
    'санітарно-хімічні (фізико-хімічні)': { pdk: 1.0, class: 2, baseQuality: 30 },
    'санітарно-хімічні (органолептичні)': { pdk: 1.0, class: 3, baseQuality: 50 },
    'показники епідемічної безпеки (мікробіологічні)': { pdk: 1.0, class: 1, baseQuality: 0 },
    'показники епідемічної безпеки (паразитарні)': { pdk: 1.0, class: 1, baseQuality: 0 },
    'радіаційні показники': { pdk: 1.0, class: 1, baseQuality: 20 },
    'індекс забрудненості води': { pdk: 1.0, class: 2, baseQuality: 15 }
};

/**
 * Ключевые слова для распознавания типов показателей воды
 */
const WATER_CATEGORIES = {
    'санітарно-токсикологічні': ['токсикологічн', 'токсикологическ'],
    'фізико-хімічні': ['фізико-хімічн', 'физико-химическ'],
    'органолептичні': ['органолептичн', 'органолептическ'],
    'мікробіологічні': ['мікробіологічн', 'микробиологическ', 'бактер'],
    'паразитарні': ['паразитарн', 'паразитологічн'],
    'радіаційні': ['радіаційн', 'радиационн'],
    'індекс забрудненості': ['індекс', 'індекс забрудненості', 'индекс']
};

/**
 * Расчет интегрального показателя качества питьевой воды
 * @param {Array} measurements - Массив измерений
 * @returns {Object} - Данные о показателе
 */
export function calculateWaterQualityIndex(measurements) {
    // Фильтрация данных по категории "Стан водних ресурсів"
    const waterMeasurements = measurements.filter(m => 
        m.category_name && (
            m.category_name.toLowerCase().includes('водн') || 
            m.category_name.toLowerCase().includes('вода') ||
            m.category_name.toLowerCase().includes('water') ||
            m.category_name.toLowerCase().includes('ресурс')
        )
    );
    
    console.log(`Найдено ${waterMeasurements.length} измерений для водных ресурсов`);
    
    if (waterMeasurements.length === 0) {
        return {
            value: null,
            class: null,
            text: 'Немає даних про якість води',
            color: '#999999'
        };
    }
    
    // Группировка последних измерений по компонентам
    const latestMeasurements = {};
    waterMeasurements.forEach(m => {
        if (!latestMeasurements[m.component_name] || 
            new Date(m.measurement_date) > new Date(latestMeasurements[m.component_name].measurement_date)) {
            latestMeasurements[m.component_name] = m;
        }
    });
    
    // Особая обработка для микробиологических и паразитарных показателей
    // Если они присутствуют, они имеют приоритет и могут снизить качество воды до критического уровня
    const microbiologicalComponents = Object.keys(latestMeasurements).filter(name => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('мікробіологічн') || 
               nameLower.includes('бактер') || 
               nameLower.includes('паразитар') ||
               nameLower.includes('епідеміч');
    });
    
    // Если есть микробиологические показатели, проверяем их наличие
    if (microbiologicalComponents.length > 0) {
        console.log('Обнаружены микробиологические/паразитарные показатели:', microbiologicalComponents);
        
        // Предполагаем, что наличие микробиологических показателей указывает на критический уровень
        // Это можно изменить в зависимости от ваших требований
        if (microbiologicalComponents.some(c => 
            latestMeasurements[c] && parseFloat(latestMeasurements[c].value) > 10)) {

            let currentValue; 
            
            // Определяем наихудший показатель для отображения
            const worstComponent = microbiologicalComponents.reduce((worst, current) => {
                if (!worst) return current;
                
                let worstValue = parseFloat(latestMeasurements[worst].value) || 0;
                currentValue = parseFloat(latestMeasurements[current].value) || 0;
                
                return currentValue > worstValue ? current : worst;
            }, null);
            
            return {
                value: currentValue, // 0% качества = критический уровень
                class: 3,
                text: 'Забруднена вода (перевищення ГДК)',
                color: '#FF5252', // Красный
                worstContaminant: worstComponent
            };
        }
    }
    
    // Если нет критических микробиологических показателей, выполняем стандартный расчет
    // Категоризация показателей по типам
    const categorizedComponents = {};
    Object.keys(latestMeasurements).forEach(name => {
        const nameLower = name.toLowerCase();
        
        // Пытаемся определить категорию компонента
        let category = 'other';
        
        for (const [cat, keywords] of Object.entries(WATER_CATEGORIES)) {
            if (keywords.some(keyword => nameLower.includes(keyword))) {
                category = cat;
                break;
            }
        }
        
        if (!categorizedComponents[category]) {
            categorizedComponents[category] = [];
        }
        
        categorizedComponents[category].push(name);
    });
    
    console.log('Категоризированные компоненты:', categorizedComponents);
    
    // Расчет базового качества воды на основе категорий
    let baseQuality = 100; // Начинаем со 100% качества
    let worstComponent = null;
    
    // Известные категории с базовыми значениями качества
    const categoryMappings = {
        'санітарно-токсикологічні': { baseQuality: 10, name: 'Санітарно-токсикологічні показники' },
        'фізико-хімічні': { baseQuality: 30, name: 'Фізико-хімічні показники' },
        'органолептичні': { baseQuality: 50, name: 'Органолептичні показники' },
        'мікробіологічні': { baseQuality: 0, name: 'Мікробіологічні показники' },
        'паразитарні': { baseQuality: 0, name: 'Паразитарні показники' },
        'радіаційні': { baseQuality: 20, name: 'Радіаційні показники' },
        'індекс забрудненості': { baseQuality: 15, name: 'Індекс забрудненості води' }
    };
    
    // Находим наихудшую категорию
    Object.entries(categorizedComponents).forEach(([category, components]) => {
        if (components.length === 0) return;
        
        // Если категория известна, используем её базовое качество
        if (categoryMappings[category]) {
            const { baseQuality: catQuality, name } = categoryMappings[category];
            
            if (catQuality < baseQuality) {
                baseQuality = catQuality;
                worstComponent = name;
            }
        }
    });
    
    // Определение класса и текста в зависимости от качества
    let waterQualityClass, waterQualityText, waterQualityColor;
    
    if (baseQuality <= 0) {
        waterQualityClass = 5;
        waterQualityText = 'Забруднена вода (перевищення ГДК)';
        waterQualityColor = '#FF5252'; // Красный
    } else if (baseQuality <= 20) {
        waterQualityClass = 4;
        waterQualityText = 'Близька до забруднення';
        waterQualityColor = '#FFA726'; // Оранжевый
    } else if (baseQuality <= 50) {
        waterQualityClass = 3;
        waterQualityText = 'Задовільна якість води';
        waterQualityColor = '#FFEB3B'; // Желтый
    } else if (baseQuality <= 80) {
        waterQualityClass = 2;
        waterQualityText = 'Добра якість води';
        waterQualityColor = '#66BB6A'; // Зеленый
    } else {
        waterQualityClass = 1;
        waterQualityText = 'Висока якість води';
        waterQualityColor = '#26A69A'; // Бирюзовый
    }
    
    // Добавляем информацию о наихудшем показателе
    let detailText = '';
    if (worstComponent) {
        detailText = ` (найвищий показник: ${worstComponent})`;
    }
    
    return {
        value: baseQuality, // Процент качества воды
        class: waterQualityClass,
        text: waterQualityText + detailText,
        color: waterQualityColor,
        worstContaminant: worstComponent
    };
}