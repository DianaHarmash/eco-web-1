// integralIndicators.js
// Calculations for environmental quality indicators according to the NP_KMEEEP document

/**
 * Calculates the Air Quality Index based on measurement data
 * @param {Array} measurements - Air quality measurements
 * @returns {Object} The calculated air quality index and description
 */
function calculateAirQualityIndex(measurements) {
    // Filter out only air-related measurements
    const airMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('повітря')
    );
    
    if (airMeasurements.length === 0) {
        return null;
    }
    
    // Get the key components for AQI calculation
    const pollutants = {
        'Двоокис азоту (NO2)': { weight: 0.2, limit: 0.2 },
        'Двоокис сірки (SO2)': { weight: 0.2, limit: 0.5 },
        'Оксид вуглецю': { weight: 0.2, limit: 5.0 },
        'Формальдегід (H2CO)': { weight: 0.1, limit: 0.035 },
        'Вміст пилу': { weight: 0.15, limit: 0.5 },
        'Свинець': { weight: 0.1, limit: 0.001 },
        'Бенз(а)пірен': { weight: 0.05, limit: 0.000001 }
    };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate weighted average of normalized pollutant values
    airMeasurements.forEach(measurement => {
        const pollutantInfo = pollutants[measurement.component_name];
        if (pollutantInfo) {
            // Calculate the ratio to the limit value
            const ratio = parseFloat(measurement.value) / pollutantInfo.limit;
            weightedSum += ratio * pollutantInfo.weight;
            totalWeight += pollutantInfo.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing pollutants
    const normalizedIndex = (weightedSum / totalWeight) * 100;
    
    // Determine the air quality category
    let category, description, color;
    
    if (normalizedIndex <= 50) {
        category = 'Добрий';
        description = 'Якість повітря вважається задовільною, забруднення повітря становить невеликий ризик або не становить ризику.';
        color = '#00E400'; // Green
    } else if (normalizedIndex <= 100) {
        category = 'Задовільний';
        description = 'Якість повітря прийнятна, проте деякі забруднювачі можуть викликати помірне занепокоєння для дуже невеликої кількості людей.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex <= 150) {
        category = 'Помірно забруднений';
        description = 'Члени чутливих груп можуть відчувати вплив на здоров\'я. Широка громадськість, ймовірно, не постраждає.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex <= 200) {
        category = 'Шкідливий';
        description = 'Всі можуть почати відчувати наслідки для здоров\'я; члени чутливих груп можуть відчувати більш серйозні наслідки.';
        color = '#FF0000'; // Red
    } else if (normalizedIndex <= 300) {
        category = 'Дуже шкідливий';
        description = 'Попередження про небезпеку для здоров\'я. Більшість людей може зазнати серйозніших наслідків для здоров\'я.';
        color = '#99004C'; // Purple
    } else {
        category = 'Небезпечний';
        description = 'Тривога щодо здоров\'я: кожен може зазнати більш серйозних наслідків для здоров\'я.';
        color = '#7E0023'; // Maroon
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates the Water Quality Index based on measurement data
 * @param {Array} measurements - Water quality measurements
 * @returns {Object} The calculated water quality index and description
 */
function calculateWaterQualityIndex(measurements) {
    // Filter out only water-related measurements
    const waterMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('водн')
    );
    
    if (waterMeasurements.length === 0) {
        return null;
    }
    
    // Get the key components for WQI calculation
    const parameters = {
        'Показники епідемічної безпеки (мікробіологічні)': { weight: 0.3, limit: 1.0 },
        'Санітарно-хімічні (органолептичні)': { weight: 0.2, limit: 1.0 },
        'Санітарно-хімічні (фізико-хімічні)': { weight: 0.2, limit: 1.0 },
        'Санітарно-хімічні (санітарно-токсикологічні)': { weight: 0.2, limit: 1.0 },
        'Радіаційні показники': { weight: 0.1, limit: 1.0 }
    };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate weighted average of normalized parameter values
    waterMeasurements.forEach(measurement => {
        const paramInfo = parameters[measurement.component_name];
        if (paramInfo) {
            // Calculate the ratio to the limit value
            const ratio = parseFloat(measurement.value) / paramInfo.limit;
            weightedSum += ratio * paramInfo.weight;
            totalWeight += paramInfo.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing parameters
    const normalizedIndex = (weightedSum / totalWeight) * 100;
    
    // Determine the water quality category
    let category, description, color;
    
    if (normalizedIndex <= 50) {
        category = 'Відмінна';
        description = 'Вода дуже чиста, придатна для всіх видів використання.';
        color = '#00E400'; // Green
    } else if (normalizedIndex <= 70) {
        category = 'Добра';
        description = 'Вода чиста, придатна для питного водопостачання після простої обробки.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex <= 90) {
        category = 'Задовільна';
        description = 'Вода помірно забруднена, потребує більш складної обробки для питного використання.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex <= 110) {
        category = 'Погана';
        description = 'Вода забруднена, використання обмежене.';
        color = '#FF0000'; // Red
    } else {
        category = 'Дуже погана';
        description = 'Вода сильно забруднена, непридатна для більшості видів використання.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates the Soil Quality Index based on measurement data
 * @param {Array} measurements - Soil quality measurements
 * @returns {Object} The calculated soil quality index and description
 */
function calculateSoilQualityIndex(measurements) {
    // Filter out only soil-related measurements
    const soilMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('ґрунт')
    );
    
    if (soilMeasurements.length === 0) {
        return null;
    }
    
    // Get the key components for SQI calculation
    const parameters = {
        'Гумус': { weight: 0.25, optimal: 3.5, range: 5 }, // optimal is the desired value, range is the normal variation
        'Рухомі сполуки фосфору (P2O5)': { weight: 0.15, optimal: 150, range: 200 },
        'Рухомі сполуки калію (K2O)': { weight: 0.15, optimal: 170, range: 200 },
        'pH': { weight: 0.2, optimal: 6.5, range: 2 },
        'Засоленість': { weight: 0.1, optimal: 0, range: 0.3 },
        'Забруднення хімічними речовинами': { weight: 0.15, optimal: 0, range: 1 }
    };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate weighted average of normalized parameter values
    soilMeasurements.forEach(measurement => {
        const paramInfo = parameters[measurement.component_name];
        if (paramInfo) {
            // Calculate the deviation from optimal value
            const value = parseFloat(measurement.value);
            const deviation = Math.abs(value - paramInfo.optimal) / paramInfo.range;
            const normalizedValue = Math.max(0, 1 - deviation); // 1 is best, 0 is worst
            weightedSum += normalizedValue * paramInfo.weight;
            totalWeight += paramInfo.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing parameters
    const normalizedIndex = (weightedSum / totalWeight) * 100;
    
    // Determine the soil quality category
    let category, description, color;
    
    if (normalizedIndex >= 85) {
        category = 'Відмінна';
        description = 'Ґрунт високої якості, родючий, без забруднень.';
        color = '#00E400'; // Green
    } else if (normalizedIndex >= 70) {
        category = 'Добра';
        description = 'Ґрунт доброї якості, підходить для більшості культур.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex >= 55) {
        category = 'Задовільна';
        description = 'Ґрунт середньої якості, може потребувати покращення для певних культур.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex >= 40) {
        category = 'Погана';
        description = 'Ґрунт низької якості, потребує значного покращення.';
        color = '#FF0000'; // Red
    } else {
        category = 'Дуже погана';
        description = 'Ґрунт сильно деградований або забруднений, непридатний для сільського господарства без рекультивації.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates the Radiation Level Index based on measurement data
 * @param {Array} measurements - Radiation level measurements
 * @returns {Object} The calculated radiation level index and description
 */
function calculateRadiationLevelIndex(measurements) {
    // Filter out only radiation-related measurements
    const radiationMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('радіац')
    );
    
    if (radiationMeasurements.length === 0) {
        return null;
    }
    
    // Get the latest radiation measurement
    const latestMeasurement = radiationMeasurements.sort((a, b) => 
        new Date(b.measurement_date) - new Date(a.measurement_date)
    )[0];
    
    const radiationValue = parseFloat(latestMeasurement.value);
    
    // Determine the radiation level category based on μSv/h (microsieverts per hour)
    let category, description, color;
    
    if (radiationValue <= 0.3) {
        category = 'Нормальний';
        description = 'Природний фоновий рівень радіації, безпечний для здоров\'я.';
        color = '#00E400'; // Green
    } else if (radiationValue <= 0.5) {
        category = 'Підвищений';
        description = 'Дещо підвищений рівень радіації, але ще в межах безпечного діапазону.';
        color = '#FFFF00'; // Yellow
    } else if (radiationValue <= 1.0) {
        category = 'Високий';
        description = 'Високий рівень радіації, рекомендується обмежити перебування.';
        color = '#FF7E00'; // Orange
    } else if (radiationValue <= 5.0) {
        category = 'Дуже високий';
        description = 'Дуже високий рівень радіації, небезпечний для здоров\'я при тривалому перебуванні.';
        color = '#FF0000'; // Red
    } else {
        category = 'Небезпечний';
        description = 'Небезпечний рівень радіації, потрібна евакуація.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: radiationValue.toFixed(2),
        category,
        description,
        color,
        unit: latestMeasurement.unit || 'μSv/h'
    };
}

/**
 * Calculates the Economic Status Index based on measurement data
 * @param {Array} measurements - Economic status measurements
 * @returns {Object} The calculated economic status index and description
 */
function calculateEconomicStatusIndex(measurements) {
    // Filter out only economy-related measurements
    const economyMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('економічн')
    );
    
    if (economyMeasurements.length === 0) {
        return null;
    }
    
    // Get the key economic indicators
    const indicators = {
        'Валовий внутрішній продукт': { weight: 0.3, direction: 1 }, // 1 means higher is better
        'Індекс промислової продукції': { weight: 0.2, direction: 1 },
        'Заробітна плата': { weight: 0.2, direction: 1 },
        'Індекс споживчих цін': { weight: 0.1, direction: -1 }, // -1 means lower is better
        'Експорт товарів та послуг': { weight: 0.1, direction: 1 },
        'Імпорт товарів та послуг': { weight: 0.1, direction: -1 }
    };
    
    // Group measurements by component name and get the most recent values
    const latestValues = {};
    economyMeasurements.forEach(measurement => {
        const component = measurement.component_name;
        if (!latestValues[component] || new Date(measurement.measurement_date) > new Date(latestValues[component].measurement_date)) {
            latestValues[component] = measurement;
        }
    });
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate the economic status index
    Object.entries(latestValues).forEach(([component, measurement]) => {
        const indicator = indicators[component];
        if (indicator) {
            // Normalize to a 0-100 scale, where 50 is neutral
            let normalizedValue;
            const value = parseFloat(measurement.value);
            
            // Different normalization based on the economic indicator
            if (component === 'Індекс споживчих цін') {
                // For inflation, 100% is neutral, lower is better
                normalizedValue = 100 - (value - 100) * 2;
            } else if (component === 'Індекс промислової продукції') {
                // For industrial production index, 100% is neutral, higher is better
                normalizedValue = 50 + (value - 100);
            } else {
                // For other indicators, normalize based on a reasonable range
                normalizedValue = 50 + value / 2 * indicator.direction;
            }
            
            // Clamp the value to 0-100
            normalizedValue = Math.max(0, Math.min(100, normalizedValue));
            
            weightedSum += normalizedValue * indicator.weight;
            totalWeight += indicator.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing indicators
    const normalizedIndex = weightedSum / totalWeight;
    
    // Determine the economic status category
    let category, description, color;
    
    if (normalizedIndex >= 80) {
        category = 'Відмінний';
        description = 'Економіка регіону знаходиться в дуже доброму стані, високий рівень зростання та зайнятості.';
        color = '#00E400'; // Green
    } else if (normalizedIndex >= 65) {
        category = 'Добрий';
        description = 'Економіка регіону в доброму стані, помірне зростання та стабільність.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex >= 50) {
        category = 'Задовільний';
        description = 'Економіка регіону в задовільному стані, невелике зростання або стагнація.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex >= 35) {
        category = 'Поганий';
        description = 'Економіка регіону в поганому стані, можливий спад та високе безробіття.';
        color = '#FF0000'; // Red
    } else {
        category = 'Кризовий';
        description = 'Економіка регіону в кризовому стані, значний спад та високе безробіття.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates the Health Status Index based on measurement data
 * @param {Array} measurements - Health status measurements
 * @returns {Object} The calculated health status index and description
 */
function calculateHealthStatusIndex(measurements) {
    // Filter out only health-related measurements
    const healthMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('здоров')
    );
    
    if (healthMeasurements.length === 0) {
        return null;
    }
    
    // Get the key health indicators
    const indicators = {
        'Медико-демографічні показники': { weight: 0.25, direction: 1 }, // 1 means higher is better
        'Показники захворюваності та поширення хвороб (хворобливість)': { weight: 0.25, direction: -1 }, // -1 means lower is better
        'Інвалідності та інвалідизації': { weight: 0.15, direction: -1 },
        'Фізичного розвитку населення': { weight: 0.15, direction: 1 },
        'Ризики захворювання': { weight: 0.1, direction: -1 },
        'Прогноз тривалості життя': { weight: 0.1, direction: 1 }
    };
    
    // Group measurements by component name and get the most recent values
    const latestValues = {};
    healthMeasurements.forEach(measurement => {
        const component = measurement.component_name;
        if (!latestValues[component] || new Date(measurement.measurement_date) > new Date(latestValues[component].measurement_date)) {
            latestValues[component] = measurement;
        }
    });
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate the health status index
    Object.entries(latestValues).forEach(([component, measurement]) => {
        const indicator = indicators[component];
        if (indicator) {
            // Normalize to a 0-100 scale
            let normalizedValue;
            const value = parseFloat(measurement.value);
            
            // Different normalization based on the health indicator
            if (component === 'Прогноз тривалості життя') {
                // For life expectancy, normalize to a 0-100 scale
                normalizedValue = ((value - 50) / 40) * 100; // assuming 50-90 years range
            } else if (component === 'Показники захворюваності та поширення хвороб (хворобливість)') {
                // For disease prevalence, lower is better
                normalizedValue = 100 - value;
            } else {
                // For other indicators, normalize on a 0-100 scale
                normalizedValue = value;
            }
            
            // Adjust direction (higher is always better for the index)
            normalizedValue = indicator.direction === -1 ? 100 - normalizedValue : normalizedValue;
            
            // Clamp the value to 0-100
            normalizedValue = Math.max(0, Math.min(100, normalizedValue));
            
            weightedSum += normalizedValue * indicator.weight;
            totalWeight += indicator.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing indicators
    const normalizedIndex = weightedSum / totalWeight;
    
    // Determine the health status category
    let category, description, color;
    
    if (normalizedIndex >= 80) {
        category = 'Відмінний';
        description = 'Здоров\'я населення регіону на дуже високому рівні, низька захворюваність.';
        color = '#00E400'; // Green
    } else if (normalizedIndex >= 65) {
        category = 'Добрий';
        description = 'Здоров\'я населення регіону на доброму рівні, показники вище середнього.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex >= 50) {
        category = 'Задовільний';
        description = 'Здоров\'я населення регіону на задовільному рівні, середні показники.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex >= 35) {
        category = 'Поганий';
        description = 'Здоров\'я населення регіону на низькому рівні, висока захворюваність.';
        color = '#FF0000'; // Red
    } else {
        category = 'Критичний';
        description = 'Здоров\'я населення регіону в критичному стані, дуже висока захворюваність.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates the Energy Status Index based on measurement data
 * @param {Array} measurements - Energy status measurements
 * @returns {Object} The calculated energy status index and description
 */
function calculateEnergyStatusIndex(measurements) {
    // Filter out only energy-related measurements
    const energyMeasurements = measurements.filter(m => 
        m.category_name && m.category_name.toLowerCase().includes('енергетичн')
    );
    
    if (energyMeasurements.length === 0) {
        return null;
    }
    
    // Get the key energy indicators
    const indicators = {
        'Обсяги використання води': { weight: 0.15, direction: -1 }, // -1 means lower is better
        'Обсяги використання електроенергії': { weight: 0.2, direction: -1 },
        'Обсяги використання газу': { weight: 0.15, direction: -1 },
        'Обсяги використання теплової енергії за кожен місяць': { weight: 0.15, direction: -1 },
        'Середні обсяги споживання за місяць та рік': { weight: 0.15, direction: -1 },
        'Енергоефективність будівлі або виробництва': { weight: 0.2, direction: 1 } // 1 means higher is better
    };
    
    // Group measurements by component name and get the most recent values
    const latestValues = {};
    energyMeasurements.forEach(measurement => {
        const component = measurement.component_name;
        if (!latestValues[component] || new Date(measurement.measurement_date) > new Date(latestValues[component].measurement_date)) {
            latestValues[component] = measurement;
        }
    });
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Calculate the energy status index
    Object.entries(latestValues).forEach(([component, measurement]) => {
        const indicator = indicators[component];
        if (indicator) {
            // Normalize to a 0-100 scale
            let normalizedValue;
            const value = parseFloat(measurement.value);
            
            // Different normalization based on the energy indicator
            if (component === 'Енергоефективність будівлі або виробництва') {
                // For energy efficiency, higher is better, normalize to 0-100
                normalizedValue = value;
            } else {
                // For consumption indicators, lower is better, normalize inversely
                // Assuming a reasonable range for consumption
                const maxConsumption = 100; // This should be adjusted based on actual data
                normalizedValue = 100 - (value / maxConsumption * 100);
            }
            
            // Adjust direction (higher is always better for the index)
            normalizedValue = indicator.direction === -1 ? 100 - normalizedValue : normalizedValue;
            
            // Clamp the value to 0-100
            normalizedValue = Math.max(0, Math.min(100, normalizedValue));
            
            weightedSum += normalizedValue * indicator.weight;
            totalWeight += indicator.weight;
        }
    });
    
    // If we don't have enough data, return null
    if (totalWeight === 0) {
        return null;
    }
    
    // Normalize to account for missing indicators
    const normalizedIndex = weightedSum / totalWeight;
    
    // Determine the energy status category
    let category, description, color;
    
    if (normalizedIndex >= 80) {
        category = 'Відмінний';
        description = 'Дуже висока енергоефективність, низьке споживання ресурсів.';
        color = '#00E400'; // Green
    } else if (normalizedIndex >= 65) {
        category = 'Добрий';
        description = 'Добра енергоефективність, раціональне використання ресурсів.';
        color = '#FFFF00'; // Yellow
    } else if (normalizedIndex >= 50) {
        category = 'Задовільний';
        description = 'Середня енергоефективність, помірне використання ресурсів.';
        color = '#FF7E00'; // Orange
    } else if (normalizedIndex >= 35) {
        category = 'Поганий';
        description = 'Низька енергоефективність, високе споживання ресурсів.';
        color = '#FF0000'; // Red
    } else {
        category = 'Критичний';
        description = 'Дуже низька енергоефективність, надмірне споживання ресурсів.';
        color = '#99004C'; // Purple
    }
    
    return {
        index: normalizedIndex.toFixed(1),
        category,
        description,
        color
    };
}

/**
 * Calculates all available indicators for a factory
 * @param {Object} factory - Factory data with measurements
 * @returns {Object} Object containing all calculated indicators
 */
function calculateAllIndicators(factory) {
    if (!factory.measurements || factory.measurements.length === 0) {
        return {};
    }
    
    const indicators = {};
    
    // Calculate Air Quality Index
    const airQuality = calculateAirQualityIndex(factory.measurements);
    if (airQuality) {
        indicators.airQuality = airQuality;
    }
    
    // Calculate Water Quality Index
    const waterQuality = calculateWaterQualityIndex(factory.measurements);
    if (waterQuality) {
        indicators.waterQuality = waterQuality;
    }
    
    // Calculate Soil Quality Index
    const soilQuality = calculateSoilQualityIndex(factory.measurements);
    if (soilQuality) {
        indicators.soilQuality = soilQuality;
    }
    
    // Calculate Radiation Level Index
    const radiationLevel = calculateRadiationLevelIndex(factory.measurements);
    if (radiationLevel) {
        indicators.radiationLevel = radiationLevel;
    }
    
    // Calculate Economic Status Index
    const economicStatus = calculateEconomicStatusIndex(factory.measurements);
    if (economicStatus) {
        indicators.economicStatus = economicStatus;
    }
    
    // Calculate Health Status Index
    const healthStatus = calculateHealthStatusIndex(factory.measurements);
    if (healthStatus) {
        indicators.healthStatus = healthStatus;
    }
    
    // Calculate Energy Status Index
    const energyStatus = calculateEnergyStatusIndex(factory.measurements);
    if (energyStatus) {
        indicators.energyStatus = energyStatus;
    }
    
    return indicators;
}

/**
 * Creates HTML element to display indicators
 * @param {Object} indicators - Object with calculated indicators
 * @returns {HTMLElement} Element showing the indicators
 */
function createIndicatorsDisplay(indicators) {
    const container = document.createElement('div');
    container.className = 'indicators-container';
    
    // Add a title
    const title = document.createElement('h4');
    title.textContent = 'Інтегральні показники якості';
    container.appendChild(title);
    
    // Function to create an indicator item
    function createIndicatorItem(name, indicator) {
        const item = document.createElement('div');
        item.className = 'indicator-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'indicator-name';
        nameSpan.textContent = name + ':';
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'indicator-value';
        valueSpan.style.backgroundColor = indicator.color;
        valueSpan.textContent = indicator.category;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'indicator-text';
        textSpan.textContent = ` (${indicator.index}${indicator.unit ? ' ' + indicator.unit : ''})`;
        
        item.appendChild(nameSpan);
        item.appendChild(valueSpan);
        item.appendChild(textSpan);
        
        return item;
    }
    
    // Add indicators if they exist
    if (indicators.airQuality) {
        container.appendChild(createIndicatorItem('Якість повітря', indicators.airQuality));
    }
    
    if (indicators.waterQuality) {
        container.appendChild(createIndicatorItem('Якість води', indicators.waterQuality));
    }
    
    if (indicators.soilQuality) {
        container.appendChild(createIndicatorItem('Якість ґрунту', indicators.soilQuality));
    }
    
    if (indicators.radiationLevel) {
        container.appendChild(createIndicatorItem('Рівень радіації', indicators.radiationLevel));
    }
    
    if (indicators.economicStatus) {
        container.appendChild(createIndicatorItem('Економічний стан', indicators.economicStatus));
    }
    
    if (indicators.healthStatus) {
        container.appendChild(createIndicatorItem('Стан здоров\'я населення', indicators.healthStatus));
    }
    
    if (indicators.energyStatus) {
        container.appendChild(createIndicatorItem('Енергетичний стан', indicators.energyStatus));
    }
    
    // If no indicators were added, show a message
    if (container.children.length === 1) {
        const noData = document.createElement('p');
        noData.textContent = 'Немає даних для розрахунку показників';
        noData.style.fontStyle = 'italic';
        noData.style.color = '#666';
        container.appendChild(noData);
    }
    
    return container;
}

// Export functions for use in other modules
export {
    calculateAirQualityIndex,
    calculateWaterQualityIndex,
    calculateSoilQualityIndex,
    calculateRadiationLevelIndex,
    calculateEconomicStatusIndex,
    calculateHealthStatusIndex,
    calculateEnergyStatusIndex,
    calculateAllIndicators,
    createIndicatorsDisplay
};