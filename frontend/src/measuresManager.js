// measuresManager.js - Інтеграція функціональності управління заходами

// Імпорти необхідних модулів
import { categoryDisplayNames, categoryKeywords } from './filters.js';
import { calculateAllIndicators } from './integralIndicators.js';

// Базовий URL для API
const API_BASE_URL = '/api/web-eco';

/**
 * Отримує категорії заходів з сервера
 * @returns {Promise<Array>} Масив категорій заходів
 */
async function fetchMeasureCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/measure-categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching measure categories:', error);
        throw error;
    }
}

/**
 * Отримує заходи з сервера, опціонально фільтруючи за категорією
 * @param {number|null} categoryId - ID категорії або null для отримання всіх заходів
 * @returns {Promise<Array>} Масив заходів
 */
async function fetchMeasures(categoryId = null) {
    try {
        const url = categoryId 
            ? `${API_BASE_URL}/measures?categoryId=${categoryId}` 
            : `${API_BASE_URL}/measures`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching measures:', error);
        throw error;
    }
}

/**
 * Отримує детальну інформацію про захід
 * @param {number} measureId - ID заходу
 * @returns {Promise<Object>} Дані про захід
 */
async function fetchMeasureDetails(measureId) {
    try {
        const response = await fetch(`${API_BASE_URL}/measures/${measureId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching measure details for ID ${measureId}:`, error);
        throw error;
    }
}

/**
 * Отримує заходи для конкретного об'єкта
 * @param {number} factoryId - ID об'єкта
 * @returns {Promise<Array>} Масив заходів для об'єкта
 */
async function fetchFactoryMeasures(factoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/factory/${factoryId}/measures`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching measures for factory ID ${factoryId}:`, error);
        throw error;
    }
}

/**
 * Додає захід для об'єкта
 * @param {number} factoryId - ID об'єкта
 * @param {Object} measureData - Дані заходу
 * @returns {Promise<Object>} Результат операції
 */
async function addFactoryMeasure(factoryId, measureData) {
    try {
        const response = await fetch(`${API_BASE_URL}/factory/${factoryId}/measures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(measureData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error adding measure to factory ID ${factoryId}:`, error);
        throw error;
    }
}

/**
 * Видаляє захід для об'єкта
 * @param {number} factoryMeasureId - ID заходу в об'єкті
 * @returns {Promise<Object>} Результат операції
 */
async function removeFactoryMeasure(factoryMeasureId) {
    try {
        const response = await fetch(`${API_BASE_URL}/factory-measures/${factoryMeasureId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error removing factory measure ID ${factoryMeasureId}:`, error);
        throw error;
    }
}

/**
 * Отримує регіональні програми
 * @returns {Promise<Array>} Масив регіональних програм
 */
async function fetchRegionalPrograms() {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching regional programs:', error);
        throw error;
    }
}

/**
 * Отримує детальну інформацію про регіональну програму
 * @param {number} programId - ID програми
 * @returns {Promise<Object>} Дані про програму
 */
async function fetchProgramDetails(programId) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching program details for ID ${programId}:`, error);
        throw error;
    }
}

/**
 * Створює нову регіональну програму
 * @param {Object} programData - Дані програми
 * @returns {Promise<Object>} Створена програма
 */
async function createRegionalProgram(programData) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(programData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating regional program:', error);
        throw error;
    }
}

/**
 * Додає захід до регіональної програми
 * @param {number} programId - ID програми
 * @param {Object} measureData - Дані заходу
 * @returns {Promise<Object>} Результат операції
 */
async function addProgramMeasure(programId, measureData) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}/measures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(measureData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error adding measure to program ID ${programId}:`, error);
        throw error;
    }
}

/**
 * Видаляє захід з регіональної програми
 * @param {number} programId - ID програми
 * @param {number} measureId - ID заходу
 * @returns {Promise<Object>} Результат операції
 */
async function removeProgramMeasure(programId, measureId) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}/measures/${measureId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error removing measure ID ${measureId} from program ID ${programId}:`, error);
        throw error;
    }
}

/**
 * Генерує звіт для регіональної програми
 * @param {number} programId - ID програми
 * @param {string} format - Формат звіту ('doc' або 'xls')
 * @returns {Promise<Object>} Дані про згенерований звіт
 */
async function generateProgramReport(programId, format) {
    try {
        if (format !== 'doc' && format !== 'xls') {
            throw new Error('Unsupported format. Use "doc" or "xls".');
        }
        
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}/report/${format}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error generating ${format} report for program ID ${programId}:`, error);
        throw error;
    }
}

/**
 * Завантажує згенерований звіт
 * @param {string} filename - Ім'я файлу звіту
 */
function downloadReport(filename) {
    window.open(`${API_BASE_URL}/download-report/${filename}`, '_blank');
}

/**
 * Створює UI для показу заходів для відображення у модальному вікні
 * @param {Object} factory - Дані про фабрику
 * @returns {Promise<HTMLElement>} HTML елемент з інтерфейсом заходів
 */
async function createMeasuresView(factory) {
    // Створюємо контейнер
    const container = document.createElement('div');
    container.className = 'measures-container';
    
    // Заголовок
    const title = document.createElement('h3');
    title.textContent = 'Заходи для покращення стану об\'єкта';
    title.className = 'measures-title';
    container.appendChild(title);
    
    try {
        // Завантажуємо поточні заходи для фабрики
        const factoryMeasures = await fetchFactoryMeasures(factory.id);
        
        // Групуємо заходи за категоріями
        const categorizedMeasures = {};
        factoryMeasures.forEach(measure => {
            if (!categorizedMeasures[measure.category_name]) {
                categorizedMeasures[measure.category_name] = [];
            }
            categorizedMeasures[measure.category_name].push(measure);
        });
        
        // Створюємо UI для відображення заходів по категоріям
        if (factoryMeasures.length === 0) {
            const noMeasuresMsg = document.createElement('p');
            noMeasuresMsg.textContent = 'Для цього об\'єкта ще не додано заходів.';
            noMeasuresMsg.className = 'no-measures-message';
            container.appendChild(noMeasuresMsg);
        } else {
            Object.entries(categorizedMeasures).forEach(([category, measures]) => {
                const categorySection = document.createElement('div');
                categorySection.className = 'measures-category-section';
                
                const categoryTitle = document.createElement('h4');
                categoryTitle.textContent = category;
                categoryTitle.className = 'measures-category-title';
                categorySection.appendChild(categoryTitle);
                
                // Таблиця заходів для категорії
                const table = document.createElement('table');
                table.className = 'measures-table';
                
                // Заголовок таблиці
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                ['№', 'Назва заходу', 'Статус', 'Термін', 'Пріоритет', 'Дії'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                
                thead.appendChild(headerRow);
                table.appendChild(thead);
                
                // Тіло таблиці
                const tbody = document.createElement('tbody');
                
                measures.forEach((measure, index) => {
                    const row = document.createElement('tr');
                    
                    // Номер
                    const numCell = document.createElement('td');
                    numCell.textContent = index + 1;
                    row.appendChild(numCell);
                    
                    // Назва заходу
                    const nameCell = document.createElement('td');
                    nameCell.textContent = measure.measure_name;
                    row.appendChild(nameCell);
                    
                    // Статус
                    const statusCell = document.createElement('td');
                    statusCell.textContent = measure.status || 'Планується';
                    row.appendChild(statusCell);
                    
                    // Термін
                    const dateCell = document.createElement('td');
                    if (measure.start_date && measure.planned_end_date) {
                        const startDate = new Date(measure.start_date).toLocaleDateString();
                        const endDate = new Date(measure.planned_end_date).toLocaleDateString();
                        dateCell.textContent = `${startDate} - ${endDate}`;
                    } else {
                        dateCell.textContent = measure.implementation_time || 'Не визначено';
                    }
                    row.appendChild(dateCell);
                    
                    // Пріоритет
                    const priorityCell = document.createElement('td');
                    priorityCell.textContent = measure.priority || '1';
                    row.appendChild(priorityCell);
                    
                    // Дії
                    const actionsCell = document.createElement('td');
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Видалити';
                    removeBtn.className = 'remove-measure-btn';
                    removeBtn.onclick = async () => {
                        if (confirm(`Видалити захід "${measure.measure_name}"?`)) {
                            try {
                                await removeFactoryMeasure(measure.factory_measure_id);
                                row.remove();
                                
                                // Якщо це був останній захід в категорії, видаляємо всю секцію
                                if (tbody.children.length === 0) {
                                    categorySection.remove();
                                }
                                
                                // Якщо це був останній захід взагалі, показуємо повідомлення
                                if (container.querySelectorAll('.measures-table tbody tr').length === 0) {
                                    const noMeasuresMsg = document.createElement('p');
                                    noMeasuresMsg.textContent = 'Для цього об\'єкта ще не додано заходів.';
                                    noMeasuresMsg.className = 'no-measures-message';
                                    container.appendChild(noMeasuresMsg);
                                }
                            } catch (error) {
                                alert(`Помилка при видаленні заходу: ${error.message}`);
                            }
                        }
                    };
                    
                    actionsCell.appendChild(removeBtn);
                    row.appendChild(actionsCell);
                    
                    tbody.appendChild(row);
                });
                
                table.appendChild(tbody);
                categorySection.appendChild(table);
                container.appendChild(categorySection);
            });
        }
        
        // Додаємо кнопку для додавання нових заходів
        const addSection = document.createElement('div');
        addSection.className = 'add-measure-section';
        
        const addButton = document.createElement('button');
        addButton.textContent = 'Додати новий захід';
        addButton.className = 'add-measure-button';
        addButton.onclick = () => {
            showAddMeasureModal(factory);
        };
        
        addSection.appendChild(addButton);
        container.appendChild(addSection);
        
        // Додаємо розділ для створення програми
        const programSection = document.createElement('div');
        programSection.className = 'program-section';
        
        const programTitle = document.createElement('h3');
        programTitle.textContent = 'Створення регіональної програми';
        programTitle.className = 'program-title';
        programSection.appendChild(programTitle);
        
        const createProgramButton = document.createElement('button');
        createProgramButton.textContent = 'Створити програму з вибраних заходів';
        createProgramButton.className = 'create-program-button';
        createProgramButton.onclick = () => {
            showCreateProgramModal(factory);
        };
        
        programSection.appendChild(createProgramButton);
        container.appendChild(programSection);
        
    } catch (error) {
        console.error('Error creating measures view:', error);
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Помилка при завантаженні заходів: ${error.message}`;
        errorMsg.className = 'error-message';
        container.appendChild(errorMsg);
    }
    
    return container;
}

/**
 * Показує модальне вікно для додавання заходу до об'єкта
 * @param {Object} factory - Дані про фабрику
 */
async function showAddMeasureModal(factory) {
    let modal = document.getElementById('addMeasureModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addMeasureModal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    try {
        // Завантажуємо категорії та заходи
        const categories = await fetchMeasureCategories();
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Додати захід для об\'єкта';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // Форма для додавання заходу
        const form = document.createElement('form');
        form.id = 'addMeasureForm';
        form.className = 'add-measure-form';
        
        // Вибір категорії
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'form-group';
        
        const categoryLabel = document.createElement('label');
        categoryLabel.htmlFor = 'measure-category';
        categoryLabel.textContent = 'Категорія заходу:';
        
        const categorySelect = document.createElement('select');
        categorySelect.id = 'measure-category';
        categorySelect.name = 'category';
        categorySelect.required = true;
        
        // Додаємо опцію за замовчуванням
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Виберіть категорію';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        categorySelect.appendChild(defaultOption);
        
        // Додаємо категорії
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        });
        
        categoryGroup.appendChild(categoryLabel);
        categoryGroup.appendChild(categorySelect);
        form.appendChild(categoryGroup);
        
        // Вибір заходу (буде заповнено після вибору категорії)
        const measureGroup = document.createElement('div');
        measureGroup.className = 'form-group';
        
        const measureLabel = document.createElement('label');
        measureLabel.htmlFor = 'measure-select';
        measureLabel.textContent = 'Захід:';
        
        const measureSelect = document.createElement('select');
        measureSelect.id = 'measure-select';
        measureSelect.name = 'measureId';
        measureSelect.required = true;
        measureSelect.disabled = true;
        
        // Додаємо опцію за замовчуванням
        const measureDefault = document.createElement('option');
        measureDefault.value = '';
        measureDefault.textContent = 'Спочатку виберіть категорію';
        measureDefault.selected = true;
        measureDefault.disabled = true;
        measureSelect.appendChild(measureDefault);
        
        measureGroup.appendChild(measureLabel);
        measureGroup.appendChild(measureSelect);
        form.appendChild(measureGroup);
        
        // При зміні категорії завантажуємо відповідні заходи
        categorySelect.addEventListener('change', async () => {
            const categoryId = categorySelect.value;
            
            try {
                const measures = await fetchMeasures(categoryId);
                
                // Очищаємо поточні опції
                measureSelect.innerHTML = '';
                
                // Додаємо опцію за замовчуванням
                const defaultMeasure = document.createElement('option');
                defaultMeasure.value = '';
                defaultMeasure.textContent = 'Виберіть захід';
                defaultMeasure.selected = true;
                defaultMeasure.disabled = true;
                measureSelect.appendChild(defaultMeasure);
                
                // Додаємо заходи
                measures.forEach(measure => {
                    const option = document.createElement('option');
                    option.value = measure.id;
                    option.textContent = measure.measure_name;
                    measureSelect.appendChild(option);
                });
                
                // Розблоковуємо вибір заходу
                measureSelect.disabled = false;
                
            } catch (error) {
                console.error('Error loading measures for category:', error);
                alert(`Помилка при завантаженні заходів: ${error.message}`);
            }
        });
        
        // Пріоритет
        const priorityGroup = document.createElement('div');
        priorityGroup.className = 'form-group';
        
        const priorityLabel = document.createElement('label');
        priorityLabel.htmlFor = 'measure-priority';
        priorityLabel.textContent = 'Пріоритет:';
        
        const priorityInput = document.createElement('input');
        priorityInput.type = 'number';
        priorityInput.id = 'measure-priority';
        priorityInput.name = 'priority';
        priorityInput.min = 1;
        priorityInput.max = 10;
        priorityInput.value = 1;
        
        priorityGroup.appendChild(priorityLabel);
        priorityGroup.appendChild(priorityInput);
        form.appendChild(priorityGroup);
        
        // Статус
        const statusGroup = document.createElement('div');
        statusGroup.className = 'form-group';
        
        const statusLabel = document.createElement('label');
        statusLabel.htmlFor = 'measure-status';
        statusLabel.textContent = 'Статус:';
        
        const statusSelect = document.createElement('select');
        statusSelect.id = 'measure-status';
        statusSelect.name = 'status';
        
        ['Планується', 'В процесі', 'Завершено', 'Відкладено'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
        
        statusGroup.appendChild(statusLabel);
        statusGroup.appendChild(statusSelect);
        form.appendChild(statusGroup);
        
        // Дати
        const datesGroup = document.createElement('div');
        datesGroup.className = 'form-group dates-group';
        
        // Дата початку
        const startDateLabel = document.createElement('label');
        startDateLabel.htmlFor = 'start-date';
        startDateLabel.textContent = 'Дата початку:';
        
        const startDateInput = document.createElement('input');
        startDateInput.type = 'date';
        startDateInput.id = 'start-date';
        startDateInput.name = 'startDate';
        
        // Дата завершення
        const endDateLabel = document.createElement('label');
        endDateLabel.htmlFor = 'end-date';
        endDateLabel.textContent = 'Планова дата завершення:';
        
        const endDateInput = document.createElement('input');
        endDateInput.type = 'date';
        endDateInput.id = 'end-date';
        endDateInput.name = 'plannedEndDate';
        
        datesGroup.appendChild(startDateLabel);
        datesGroup.appendChild(startDateInput);
        datesGroup.appendChild(endDateLabel);
        datesGroup.appendChild(endDateInput);
        form.appendChild(datesGroup);
        
        // Примітки
        const notesGroup = document.createElement('div');
        notesGroup.className = 'form-group';
        
        const notesLabel = document.createElement('label');
        notesLabel.htmlFor = 'measure-notes';
        notesLabel.textContent = 'Примітки:';
        
        const notesTextarea = document.createElement('textarea');
        notesTextarea.id = 'measure-notes';
        notesTextarea.name = 'notes';
        notesTextarea.rows = 3;
        
        notesGroup.appendChild(notesLabel);
        notesGroup.appendChild(notesTextarea);
        form.appendChild(notesGroup);
        
        // Кнопки форми
        const buttonsGroup = document.createElement('div');
        buttonsGroup.className = 'form-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Скасувати';
        cancelButton.className = 'cancel-button';
        cancelButton.onclick = () => { modal.style.display = 'none'; };
        
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Додати захід';
        submitButton.className = 'submit-button';
        
        buttonsGroup.appendChild(cancelButton);
        buttonsGroup.appendChild(submitButton);
        form.appendChild(buttonsGroup);
        
        // Обробник відправки форми
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const measureData = {
                measureId: parseInt(formData.get('measureId')),
                priority: parseInt(formData.get('priority')),
                status: formData.get('status'),
                startDate: formData.get('startDate') || null,
                plannedEndDate: formData.get('plannedEndDate') || null,
                notes: formData.get('notes') || null
            };
            
            try {
                await addFactoryMeasure(factory.id, measureData);
                
                alert('Захід успішно додано!');
                
                // Закриваємо модальне вікно
                modal.style.display = 'none';
                
                // Оновлюємо список заходів (перевідкриваємо деталі об'єкта)
                const detailsButton = document.getElementById('factoryDetails');
                if (detailsButton) {
                    detailsButton.click();
                }
                
            } catch (error) {
                console.error('Error adding measure:', error);
                alert(`Помилка при додаванні заходу: ${error.message}`);
            }
        });
        
        modalContent.appendChild(form);
        
        // Очищаємо та додаємо новий контент
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Показуємо модальне вікно
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing add measure modal:', error);
        alert(`Помилка при відкритті форми додавання заходу: ${error.message}`);
    }
}

/**
 * Показує модальне вікно для створення регіональної програми
 * @param {Object} factory - Дані про фабрику
 */
async function showCreateProgramModal(factory) {
    let modal = document.getElementById('createProgramModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createProgramModal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    try {
        // Завантажуємо поточні заходи для фабрики
        const factoryMeasures = await fetchFactoryMeasures(factory.id);
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Створення регіональної програми';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        if (factoryMeasures.length === 0) {
            const noMeasuresMsg = document.createElement('p');
            noMeasuresMsg.textContent = 'Для створення програми необхідно спочатку додати заходи до об\'єкта.';
            noMeasuresMsg.className = 'error-message';
            modalContent.appendChild(noMeasuresMsg);
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Закрити';
            closeButton.className = 'cancel-button';
            closeButton.onclick = () => { modal.style.display = 'none'; };
            modalContent.appendChild(closeButton);
        } else {
            // Форма для створення програми
            const form = document.createElement('form');
            form.id = 'createProgramForm';
            form.className = 'create-program-form';
            
            // Назва програми
            const nameGroup = document.createElement('div');
            nameGroup.className = 'form-group';
            
            const nameLabel = document.createElement('label');
            nameLabel.htmlFor = 'program-name';
            nameLabel.textContent = 'Назва програми:';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = 'program-name';
            nameInput.name = 'programName';
            nameInput.required = true;
            
            nameGroup.appendChild(nameLabel);
            nameGroup.appendChild(nameInput);
            form.appendChild(nameGroup);
            
            // Опис програми
            const descGroup = document.createElement('div');
            descGroup.className = 'form-group';
            
            const descLabel = document.createElement('label');
            descLabel.htmlFor = 'program-description';
            descLabel.textContent = 'Опис програми:';
            
            const descTextarea = document.createElement('textarea');
            descTextarea.id = 'program-description';
            descTextarea.name = 'description';
            descTextarea.rows = 4;
            
            descGroup.appendChild(descLabel);
            descGroup.appendChild(descTextarea);
            form.appendChild(descGroup);
            
            // Дати програми
            const datesGroup = document.createElement('div');
            datesGroup.className = 'form-group dates-group';
            
            // Дата початку
            const startDateLabel = document.createElement('label');
            startDateLabel.htmlFor = 'program-start-date';
            startDateLabel.textContent = 'Дата початку:';
            
            const startDateInput = document.createElement('input');
            startDateInput.type = 'date';
            startDateInput.id = 'program-start-date';
            startDateInput.name = 'startDate';
            startDateInput.required = true;
            
            // Дата завершення
            const endDateLabel = document.createElement('label');
            endDateLabel.htmlFor = 'program-end-date';
            endDateLabel.textContent = 'Дата завершення:';
            
            const endDateInput = document.createElement('input');
            endDateInput.type = 'date';
            endDateInput.id = 'program-end-date';
            endDateInput.name = 'endDate';
            endDateInput.required = true;
            
            datesGroup.appendChild(startDateLabel);
            datesGroup.appendChild(startDateInput);
            datesGroup.appendChild(endDateLabel);
            datesGroup.appendChild(endDateInput);
            form.appendChild(datesGroup);
            
            // Загальний бюджет
            const budgetGroup = document.createElement('div');
            budgetGroup.className = 'form-group';
            
            const budgetLabel = document.createElement('label');
            budgetLabel.htmlFor = 'program-budget';
            budgetLabel.textContent = 'Загальний бюджет (грн):';
            
            const budgetInput = document.createElement('input');
            budgetInput.type = 'number';
            budgetInput.id = 'program-budget';
            budgetInput.name = 'totalBudget';
            budgetInput.min = 0;
            budgetInput.step = 1000;
            budgetInput.required = true;
            
            budgetGroup.appendChild(budgetLabel);
            budgetGroup.appendChild(budgetInput);
            form.appendChild(budgetGroup);
            
            // Статус програми
            const statusGroup = document.createElement('div');
            statusGroup.className = 'form-group';
            
            const statusLabel = document.createElement('label');
            statusLabel.htmlFor = 'program-status';
            statusLabel.textContent = 'Статус програми:';
            
            const statusSelect = document.createElement('select');
            statusSelect.id = 'program-status';
            statusSelect.name = 'status';
            
            ['Планується', 'В процесі', 'Завершено', 'Призупинено'].forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });
            
            statusGroup.appendChild(statusLabel);
            statusGroup.appendChild(statusSelect);
            form.appendChild(statusGroup);
            
            // Вибір заходів для програми
            const measuresGroup = document.createElement('div');
            measuresGroup.className = 'form-group';
            
            const measuresLabel = document.createElement('h3');
            measuresLabel.textContent = 'Виберіть заходи для програми:';
            measuresGroup.appendChild(measuresLabel);
            
            // Групуємо заходи за категоріями
            const categorizedMeasures = {};
            factoryMeasures.forEach(measure => {
                if (!categorizedMeasures[measure.category_name]) {
                    categorizedMeasures[measure.category_name] = [];
                }
                categorizedMeasures[measure.category_name].push(measure);
            });
            
            // Створюємо список заходів з чекбоксами
            Object.entries(categorizedMeasures).forEach(([category, measures]) => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'measures-category';
                
                const categoryTitle = document.createElement('h4');
                categoryTitle.textContent = category;
                categoryDiv.appendChild(categoryTitle);
                
                measures.forEach(measure => {
                    const measureDiv = document.createElement('div');
                    measureDiv.className = 'measure-checkbox';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `measure-${measure.id}`;
                    checkbox.name = 'measures';
                    checkbox.value = measure.id;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `measure-${measure.id}`;
                    label.textContent = measure.measure_name;
                    
                    measureDiv.appendChild(checkbox);
                    measureDiv.appendChild(label);
                    categoryDiv.appendChild(measureDiv);
                });
                
                measuresGroup.appendChild(categoryDiv);
            });
            
            form.appendChild(measuresGroup);
            
            // Кнопки форми
            const buttonsGroup = document.createElement('div');
            buttonsGroup.className = 'form-buttons';
            
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.textContent = 'Скасувати';
            cancelButton.className = 'cancel-button';
            cancelButton.onclick = () => { modal.style.display = 'none'; };
            
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.textContent = 'Створити програму';
            submitButton.className = 'submit-button';
            
            buttonsGroup.appendChild(cancelButton);
            buttonsGroup.appendChild(submitButton);
            form.appendChild(buttonsGroup);
            
            // Обробник відправки форми
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                
                // Отримуємо вибрані заходи
                const selectedMeasures = Array.from(formData.getAll('measures')).map(id => parseInt(id));
                
                if (selectedMeasures.length === 0) {
                    alert('Будь ласка, виберіть хоча б один захід для програми.');
                    return;
                }
                
                // Створюємо дані програми
                const programData = {
                    programName: formData.get('programName'),
                    description: formData.get('description'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    status: formData.get('status'),
                    totalBudget: parseFloat(formData.get('totalBudget')),
                    createdBy: 'System User' // Можна замінити на ім'я поточного користувача
                };
                
                try {
                    // Створюємо програму
                    const program = await createRegionalProgram(programData);
                    
                    // Додаємо вибрані заходи до програми
                    for (const measureId of selectedMeasures) {
                        const measure = factoryMeasures.find(m => m.id === measureId);
                        
                        if (measure) {
                            await addProgramMeasure(program.id, {
                                measureId: measureId,
                                priority: measure.priority || 1,
                                budgetAllocation: measure.estimated_cost || 0,
                                plannedStartDate: measure.start_date || programData.startDate,
                                plannedEndDate: measure.planned_end_date || programData.endDate,
                                notes: measure.notes || null
                            });
                        }
                    }
                    
                    alert(`Програму "${programData.programName}" успішно створено!`);
                    
                    // Запитуємо користувача, чи хоче він згенерувати звіт
                    if (confirm('Бажаєте згенерувати звіт або кошторис для програми?')) {
                        showGenerateReportModal(program.id);
                    } else {
                        // Закриваємо модальне вікно
                        modal.style.display = 'none';
                    }
                    
                } catch (error) {
                    console.error('Error creating program:', error);
                    alert(`Помилка при створенні програми: ${error.message}`);
                }
            });
            
            modalContent.appendChild(form);
        }
        
        // Очищаємо та додаємо новий контент
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Показуємо модальне вікно
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing create program modal:', error);
        alert(`Помилка при відкритті форми створення програми: ${error.message}`);
    }
}

/**
 * Показує модальне вікно для генерації звітів програми
 * @param {number} programId - ID програми
 */
async function showGenerateReportModal(programId) {
    let modal = document.getElementById('generateReportModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'generateReportModal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    try {
        // Завантажуємо деталі програми
        const program = await fetchProgramDetails(programId);
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Генерація звітів програми';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // Інформація про програму
        const programInfo = document.createElement('div');
        programInfo.className = 'program-info';
        
        const programName = document.createElement('h3');
        programName.textContent = program.program_name;
        programInfo.appendChild(programName);
        
        const programDetails = document.createElement('p');
        programDetails.innerHTML = `<strong>Опис:</strong> ${program.description || 'Не вказано'}<br>` +
            `<strong>Терміни:</strong> ${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}<br>` +
            `<strong>Статус:</strong> ${program.status}<br>` +
            `<strong>Загальний бюджет:</strong> ${program.total_budget.toLocaleString()} грн`;
        programInfo.appendChild(programDetails);
        
        modalContent.appendChild(programInfo);
        
        // Кнопки для генерації звітів
        const reportsSection = document.createElement('div');
        reportsSection.className = 'reports-section';
        
        const reportsTitle = document.createElement('h3');
        reportsTitle.textContent = 'Виберіть тип звіту:';
        reportsSection.appendChild(reportsTitle);
        
        // Кнопка для DOC звіту
        const docReportBtn = document.createElement('button');
        docReportBtn.textContent = 'Згенерувати звіт (DOC)';
        docReportBtn.className = 'report-button doc-report';
        docReportBtn.onclick = async () => {
            try {
                docReportBtn.disabled = true;
                docReportBtn.textContent = 'Генерація...';
                
                const result = await generateProgramReport(programId, 'doc');
                
                alert('Звіт успішно згенеровано!');
                
                // Відкриваємо згенерований звіт
                downloadReport(result.filename);
                
                docReportBtn.disabled = false;
                docReportBtn.textContent = 'Згенерувати звіт (DOC)';
            } catch (error) {
                console.error('Error generating DOC report:', error);
                alert(`Помилка при генерації звіту: ${error.message}`);
                
                docReportBtn.disabled = false;
                docReportBtn.textContent = 'Згенерувати звіт (DOC)';
            }
        };
        
        // Кнопка для XLS кошторису
        const xlsReportBtn = document.createElement('button');
        xlsReportBtn.textContent = 'Згенерувати кошторис (XLS)';
        xlsReportBtn.className = 'report-button xls-report';
        xlsReportBtn.onclick = async () => {
            try {
                xlsReportBtn.disabled = true;
                xlsReportBtn.textContent = 'Генерація...';
                
                const result = await generateProgramReport(programId, 'xls');
                
                alert('Кошторис успішно згенеровано!');
                
                // Відкриваємо згенерований кошторис
                downloadReport(result.filename);
                
                xlsReportBtn.disabled = false;
                xlsReportBtn.textContent = 'Згенерувати кошторис (XLS)';
            } catch (error) {
                console.error('Error generating XLS estimate:', error);
                alert(`Помилка при генерації кошторису: ${error.message}`);
                
                xlsReportBtn.disabled = false;
                xlsReportBtn.textContent = 'Згенерувати кошторис (XLS)';
            }
        };
        
        reportsSection.appendChild(docReportBtn);
        reportsSection.appendChild(xlsReportBtn);
        
        // Кнопка закриття
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Закрити';
        closeButton.className = 'cancel-button';
        closeButton.onclick = () => { modal.style.display = 'none'; };
        reportsSection.appendChild(closeButton);
        
        modalContent.appendChild(reportsSection);
        
        // Очищаємо та додаємо новий контент
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Показуємо модальне вікно
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing generate report modal:', error);
        alert(`Помилка при відкритті форми генерації звітів: ${error.message}`);
    }
}

/**
 * Створює UI для перегляду та управління регіональними програмами
 * @returns {HTMLElement} Елемент з інтерфейсом програм
 */
async function createProgramsView() {
    // Створюємо контейнер
    const container = document.createElement('div');
    container.className = 'programs-container';
    
    // Заголовок
    const title = document.createElement('h2');
    title.textContent = 'Регіональні програми';
    title.className = 'programs-title';
    container.appendChild(title);
    
    try {
        // Завантажуємо програми
        const programs = await fetchRegionalPrograms();
        
        if (programs.length === 0) {
            const noPrograms = document.createElement('p');
            noPrograms.textContent = 'Наразі немає створених регіональних програм.';
            noPrograms.className = 'no-programs-message';
            container.appendChild(noPrograms);
        } else {
            // Створюємо таблицю програм
            const table = document.createElement('table');
            table.className = 'programs-table';
            
            // Заголовок таблиці
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            ['№', 'Назва програми', 'Статус', 'Період', 'Бюджет, грн', 'Кількість заходів', 'Дії'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Тіло таблиці
            const tbody = document.createElement('tbody');
            
            programs.forEach((program, index) => {
                const row = document.createElement('tr');
                
                // Номер
                const numCell = document.createElement('td');
                numCell.textContent = index + 1;
                row.appendChild(numCell);
                
                // Назва програми
                const nameCell = document.createElement('td');
                nameCell.textContent = program.program_name;
                row.appendChild(nameCell);
                
                // Статус
                const statusCell = document.createElement('td');
                statusCell.textContent = program.status;
                row.appendChild(statusCell);
                
                // Період
                const periodCell = document.createElement('td');
                if (program.start_date && program.end_date) {
                    const startDate = new Date(program.start_date).toLocaleDateString();
                    const endDate = new Date(program.end_date).toLocaleDateString();
                    periodCell.textContent = `${startDate} - ${endDate}`;
                } else {
                    periodCell.textContent = 'Не визначено';
                }
                row.appendChild(periodCell);
                
                // Бюджет
                const budgetCell = document.createElement('td');
                budgetCell.textContent = program.total_budget.toLocaleString();
                row.appendChild(budgetCell);
                
                // Кількість заходів
                const measuresCell = document.createElement('td');
                measuresCell.textContent = program.measures_count || 0;
                row.appendChild(measuresCell);
                
                // Дії
                const actionsCell = document.createElement('td');
                
                // Кнопка для перегляду деталей
                const viewBtn = document.createElement('button');
                viewBtn.textContent = 'Деталі';
                viewBtn.className = 'view-program-btn';
                viewBtn.onclick = () => {
                    showProgramDetailsModal(program.id);
                };
                
                // Кнопка для генерації звітів
                const reportBtn = document.createElement('button');
                reportBtn.textContent = 'Звіти';
                reportBtn.className = 'generate-report-btn';
                reportBtn.onclick = () => {
                    showGenerateReportModal(program.id);
                };
                
                actionsCell.appendChild(viewBtn);
                actionsCell.appendChild(reportBtn);
                row.appendChild(actionsCell);
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            container.appendChild(table);
        }
        
        // Додаємо кнопку для створення нової програми
        const createButton = document.createElement('button');
        createButton.textContent = 'Створити нову програму';
        createButton.className = 'create-program-btn';
        createButton.onclick = () => {
            showCreateNewProgramModal();
        };
        
        container.appendChild(createButton);
        
    } catch (error) {
        console.error('Error loading programs:', error);
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Помилка при завантаженні програм: ${error.message}`;
        errorMsg.className = 'error-message';
        container.appendChild(errorMsg);
    }
    
    return container;
}

/**
 * Показує модальне вікно з деталями програми
 * @param {number} programId - ID програми
 */
async function showProgramDetailsModal(programId) {
    let modal = document.getElementById('programDetailsModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'programDetailsModal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    try {
        // Завантажуємо деталі програми
        const program = await fetchProgramDetails(programId);
        
        // Завантажуємо зв'язані об'єкти
        const programFactories = await fetchProgramFactories(programId);
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content program-details-modal';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Деталі програми';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // Інформація про програму
        const programInfo = document.createElement('div');
        programInfo.className = 'program-info-detailed';
        
        // Створюємо таблицю з інформацією
        const infoTable = document.createElement('table');
        infoTable.className = 'program-info-table';
        
        // Додаємо рядки з інформацією
        const infoRows = [
            ['Назва програми', program.program_name],
            ['Опис', program.description || 'Не вказано'],
            ['Дата початку', new Date(program.start_date).toLocaleDateString()],
            ['Дата завершення', new Date(program.end_date).toLocaleDateString()],
            ['Статус', program.status],
            ['Загальний бюджет', `${program.total_budget.toLocaleString()} грн`],
            ['Кількість заходів', program.measures ? program.measures.length : 0],
            ['Створено', new Date(program.created_at).toLocaleString()]
        ];
        
        infoRows.forEach(([label, value]) => {
            const row = document.createElement('tr');
            
            const labelCell = document.createElement('td');
            labelCell.className = 'info-label';
            labelCell.textContent = label;
            
            const valueCell = document.createElement('td');
            valueCell.className = 'info-value';
            valueCell.textContent = value;
            
            row.appendChild(labelCell);
            row.appendChild(valueCell);
            infoTable.appendChild(row);
        });
        
        programInfo.appendChild(infoTable);
        modalContent.appendChild(programInfo);
        
        // Секція зв'язаних об'єктів
        const factoriesSection = document.createElement('div');
        factoriesSection.className = 'program-factories-section';
        
        const factoriesTitle = document.createElement('h3');
        factoriesTitle.textContent = 'Об\'єкти програми';
        factoriesSection.appendChild(factoriesTitle);
        
        if (!programFactories || programFactories.length === 0) {
            const noFactories = document.createElement('p');
            noFactories.textContent = 'Для цієї програми не вибрано жодного об\'єкта.';
            noFactories.className = 'no-factories-message';
            factoriesSection.appendChild(noFactories);
        } else {
            // Створюємо таблицю об'єктів
            const factoriesTable = document.createElement('table');
            factoriesTable.className = 'factories-table';
            
            // Заголовок таблиці
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            ['№', 'Назва об\'єкта', 'Регіон'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            factoriesTable.appendChild(thead);
            
            // Тіло таблиці
            const tbody = document.createElement('tbody');
            
            programFactories.forEach((factory, index) => {
                const row = document.createElement('tr');
                
                // Номер
                const numCell = document.createElement('td');
                numCell.textContent = index + 1;
                row.appendChild(numCell);
                
                // Назва об'єкта
                const nameCell = document.createElement('td');
                nameCell.textContent = factory.factory_name;
                row.appendChild(nameCell);
                
                // Регіон
                const regionCell = document.createElement('td');
                regionCell.textContent = factory.region || 'Не вказано';
                row.appendChild(regionCell);
                
                tbody.appendChild(row);
            });
            
            factoriesTable.appendChild(tbody);
            factoriesSection.appendChild(factoriesTable);
        }
        
        modalContent.appendChild(factoriesSection);
        
        // Заходи програми
        const measuresSection = document.createElement('div');
        measuresSection.className = 'program-measures-section';
        
        const measuresTitle = document.createElement('h3');
        measuresTitle.textContent = 'Заходи програми';
        measuresSection.appendChild(measuresTitle);
        
        if (!program.measures || program.measures.length === 0) {
            const noMeasures = document.createElement('p');
            noMeasures.textContent = 'Ця програма не містить заходів.';
            noMeasures.className = 'no-measures-message';
            measuresSection.appendChild(noMeasures);
        } else {
            // Групуємо заходи за категоріями
            const categorizedMeasures = {};
            program.measures.forEach(measure => {
                if (!categorizedMeasures[measure.category_name]) {
                    categorizedMeasures[measure.category_name] = [];
                }
                categorizedMeasures[measure.category_name].push(measure);
            });
            
            // Створюємо вкладки для категорій
            const tabsContainer = document.createElement('div');
            tabsContainer.className = 'category-tabs';
            
            const tabButtons = document.createElement('div');
            tabButtons.className = 'tab-buttons';
            
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            
            // Додаємо вкладки для кожної категорії
            Object.keys(categorizedMeasures).forEach((category, index) => {
                // Кнопка вкладки
                const tabButton = document.createElement('button');
                tabButton.className = `tab-button ${index === 0 ? 'active' : ''}`;
                tabButton.textContent = category;
                tabButton.onclick = () => {
                    // Деактивуємо всі вкладки
                    document.querySelectorAll('.tab-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('active');
                    });
                    
                    // Активуємо обрану вкладку
                    tabButton.classList.add('active');
                    document.getElementById(`tab-${category.replace(/\s+/g, '-')}`).classList.add('active');
                };
                
                tabButtons.appendChild(tabButton);
                
                // Вміст вкладки
                const tabPane = document.createElement('div');
                tabPane.id = `tab-${category.replace(/\s+/g, '-')}`;
                tabPane.className = `tab-pane ${index === 0 ? 'active' : ''}`;
                
                // Таблиця заходів для категорії
                const measuresTable = document.createElement('table');
                measuresTable.className = 'measures-table';
                
                // Заголовок таблиці
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                ['№', 'Назва заходу', 'Вартість, грн', 'Ефективність', 'Термін реалізації'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                
                thead.appendChild(headerRow);
                measuresTable.appendChild(thead);
                
                // Тіло таблиці
                const tbody = document.createElement('tbody');
                
                categorizedMeasures[category].forEach((measure, index) => {
                    const row = document.createElement('tr');
                    
                    // Номер
                    const numCell = document.createElement('td');
                    numCell.textContent = index + 1;
                    row.appendChild(numCell);
                    
                    // Назва заходу
                    const nameCell = document.createElement('td');
                    nameCell.textContent = measure.measure_name;
                    if (measure.description) {
                        const description = document.createElement('div');
                        description.className = 'measure-description';
                        description.textContent = measure.description;
                        nameCell.appendChild(description);
                    }
                    row.appendChild(nameCell);
                    
                    // Вартість
                    const costCell = document.createElement('td');
                    costCell.textContent = measure.estimated_cost ? measure.estimated_cost.toLocaleString() : 'Не вказано';
                    row.appendChild(costCell);
                    
                    // Ефективність
                    const effectivenessCell = document.createElement('td');
                    effectivenessCell.textContent = measure.effectiveness_description || 'Не вказано';
                    row.appendChild(effectivenessCell);
                    
                    // Термін реалізації
                    const timeCell = document.createElement('td');
                    timeCell.textContent = measure.implementation_time || 'Не вказано';
                    row.appendChild(timeCell);
                    
                    tbody.appendChild(row);
                });
                
                measuresTable.appendChild(tbody);
                tabPane.appendChild(measuresTable);
                tabContent.appendChild(tabPane);
            });
            
            tabsContainer.appendChild(tabButtons);
            tabsContainer.appendChild(tabContent);
            measuresSection.appendChild(tabsContainer);
        }
        
        modalContent.appendChild(measuresSection);
        
        // Кнопки для генерації звітів
        const reportsSection = document.createElement('div');
        reportsSection.className = 'reports-section';
        
        const reportDocBtn = document.createElement('button');
        reportDocBtn.textContent = 'Згенерувати звіт (DOC)';
        reportDocBtn.className = 'report-button doc-report';
        reportDocBtn.onclick = async () => {
            try {
                reportDocBtn.disabled = true;
                reportDocBtn.textContent = 'Генерація...';
                
                const result = await generateProgramReport(programId, 'doc');
                
                alert('Звіт успішно згенеровано!');
                
                // Відкриваємо згенерований звіт
                downloadReport(result.filename);
                
                reportDocBtn.disabled = false;
                reportDocBtn.textContent = 'Згенерувати звіт (DOC)';
            } catch (error) {
                console.error('Error generating DOC report:', error);
                alert(`Помилка при генерації звіту: ${error.message}`);
                
                reportDocBtn.disabled = false;
                reportDocBtn.textContent = 'Згенерувати звіт (DOC)';
            }
        };
        
        const reportXlsBtn = document.createElement('button');
        reportXlsBtn.textContent = 'Згенерувати кошторис (XLS)';
        reportXlsBtn.className = 'report-button xls-report';
        reportXlsBtn.onclick = async () => {
            try {
                reportXlsBtn.disabled = true;
                reportXlsBtn.textContent = 'Генерація...';
                
                const result = await generateProgramReport(programId, 'xls');
                
                alert('Кошторис успішно згенеровано!');
                
                // Відкриваємо згенерований кошторис
                downloadReport(result.filename);
                
                reportXlsBtn.disabled = false;
                reportXlsBtn.textContent = 'Згенерувати кошторис (XLS)';
            } catch (error) {
                console.error('Error generating XLS estimate:', error);
                alert(`Помилка при генерації кошторису: ${error.message}`);
                
                reportXlsBtn.disabled = false;
                reportXlsBtn.textContent = 'Згенерувати кошторис (XLS)';
            }
        };
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Закрити';
        closeButton.className = 'cancel-button';
        closeButton.onclick = () => { modal.style.display = 'none'; };
        
        reportsSection.appendChild(reportDocBtn);
        reportsSection.appendChild(reportXlsBtn);
        reportsSection.appendChild(closeButton);
        
        modalContent.appendChild(reportsSection);
        
        // Очищаємо та додаємо новий контент
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Показуємо модальне вікно
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing program details modal:', error);
        alert(`Помилка при відкритті деталей програми: ${error.message}`);
    }
}

/**
 * Показує модальне вікно для створення нової програми
 */
async function showCreateNewProgramModal() {
    let modal = document.getElementById('createNewProgramModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createNewProgramModal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    try {
        // Завантажуємо дані про заходи
        const allMeasures = await fetchMeasures();
        
        // Завантажуємо всі доступні об'єкти
        const allFactories = await fetch(`${API_BASE_URL}/all-factories-data`).then(res => res.json());
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Створення нової регіональної програми';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // Форма для створення програми
        const form = document.createElement('form');
        form.id = 'createNewProgramForm';
        form.className = 'create-program-form';
        
        // Назва програми
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        
        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'program-name';
        nameLabel.textContent = 'Назва програми:';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'program-name';
        nameInput.name = 'programName';
        nameInput.required = true;
        
        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);
        form.appendChild(nameGroup);
        
        // Опис програми
        const descGroup = document.createElement('div');
        descGroup.className = 'form-group';
        
        const descLabel = document.createElement('label');
        descLabel.htmlFor = 'program-description';
        descLabel.textContent = 'Опис програми:';
        
        const descTextarea = document.createElement('textarea');
        descTextarea.id = 'program-description';
        descTextarea.name = 'description';
        descTextarea.rows = 4;
        
        descGroup.appendChild(descLabel);
        descGroup.appendChild(descTextarea);
        form.appendChild(descGroup);
        
        // Дати програми
        const datesGroup = document.createElement('div');
        datesGroup.className = 'form-group dates-group';
        
        // Дата початку
        const startDateLabel = document.createElement('label');
        startDateLabel.htmlFor = 'program-start-date';
        startDateLabel.textContent = 'Дата початку:';
        
        const startDateInput = document.createElement('input');
        startDateInput.type = 'date';
        startDateInput.id = 'program-start-date';
        startDateInput.name = 'startDate';
        startDateInput.required = true;
        
        // Дата завершення
        const endDateLabel = document.createElement('label');
        endDateLabel.htmlFor = 'program-end-date';
        endDateLabel.textContent = 'Планова дата завершення:';
        
        const endDateInput = document.createElement('input');
        endDateInput.type = 'date';
        endDateInput.id = 'program-end-date';
        endDateInput.name = 'endDate';
        endDateInput.required = true;
        
        datesGroup.appendChild(startDateLabel);
        datesGroup.appendChild(startDateInput);
        datesGroup.appendChild(endDateLabel);
        datesGroup.appendChild(endDateInput);
        form.appendChild(datesGroup);
        
        // Загальний бюджет
        const budgetGroup = document.createElement('div');
        budgetGroup.className = 'form-group';
        
        const budgetLabel = document.createElement('label');
        budgetLabel.htmlFor = 'program-budget';
        budgetLabel.textContent = 'Загальний бюджет (грн):';
        
        const budgetInput = document.createElement('input');
        budgetInput.type = 'number';
        budgetInput.id = 'program-budget';
        budgetInput.name = 'totalBudget';
        budgetInput.min = 0;
        budgetInput.step = 1000;
        budgetInput.required = true;
        
        budgetGroup.appendChild(budgetLabel);
        budgetGroup.appendChild(budgetInput);
        form.appendChild(budgetGroup);
        
        // Статус програми
        const statusGroup = document.createElement('div');
        statusGroup.className = 'form-group';
        
        const statusLabel = document.createElement('label');
        statusLabel.htmlFor = 'program-status';
        statusLabel.textContent = 'Статус програми:';
        
        const statusSelect = document.createElement('select');
        statusSelect.id = 'program-status';
        statusSelect.name = 'status';
        
        ['Планується', 'В процесі', 'Завершено', 'Призупинено'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
        
        statusGroup.appendChild(statusLabel);
        statusGroup.appendChild(statusSelect);
        form.appendChild(statusGroup);
        
        // Вибір об'єктів для програми
        const factoriesGroup = document.createElement('div');
        factoriesGroup.className = 'form-group factories-selection-group';
        
        const factoriesLabel = document.createElement('h3');
        factoriesLabel.textContent = 'Виберіть об\'єкти для програми:';
        factoriesGroup.appendChild(factoriesLabel);
        
        if (allFactories.length === 0) {
            const noFactories = document.createElement('p');
            noFactories.textContent = 'Немає доступних об\'єктів для вибору.';
            noFactories.className = 'no-factories-message';
            factoriesGroup.appendChild(noFactories);
        } else {
            // Створюємо чекбокси для об'єктів
            const factoriesContainer = document.createElement('div');
            factoriesContainer.className = 'factories-container';
            
            allFactories.forEach(factory => {
                const factoryDiv = document.createElement('div');
                factoryDiv.className = 'factory-checkbox';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `factory-${factory.id}`;
                checkbox.name = 'factories';
                checkbox.value = factory.id;
                
                const label = document.createElement('label');
                label.htmlFor = `factory-${factory.id}`;
                label.textContent = factory.factory_name;
                
                factoryDiv.appendChild(checkbox);
                factoryDiv.appendChild(label);
                factoriesContainer.appendChild(factoryDiv);
            });
            
            factoriesGroup.appendChild(factoriesContainer);
        }
        
        form.appendChild(factoriesGroup);
        
        // Вибір заходів для програми
        const measuresGroup = document.createElement('div');
        measuresGroup.className = 'form-group measures-selection-group';
        
        const measuresLabel = document.createElement('h3');
        measuresLabel.textContent = 'Виберіть заходи для програми:';
        measuresGroup.appendChild(measuresLabel);
        
        // Групуємо заходи за категоріями
        const categorizedMeasures = {};
        allMeasures.forEach(measure => {
            if (!categorizedMeasures[measure.category_name]) {
                categorizedMeasures[measure.category_name] = [];
            }
            categorizedMeasures[measure.category_name].push(measure);
        });
        
        // Створюємо вкладки для категорій
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'category-tabs';
        
        const tabButtons = document.createElement('div');
        tabButtons.className = 'tab-buttons';
        
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Додаємо вкладки для кожної категорії
        Object.keys(categorizedMeasures).forEach((category, index) => {
            // Кнопка вкладки
            const tabButton = document.createElement('button');
            tabButton.type = 'button'; // Важливо для форми
            tabButton.className = `tab-button ${index === 0 ? 'active' : ''}`;
            tabButton.textContent = category;
            tabButton.onclick = () => {
                // Деактивуємо всі вкладки
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Активуємо обрану вкладку
                tabButton.classList.add('active');
                document.getElementById(`new-tab-${category.replace(/\s+/g, '-')}`).classList.add('active');
            };
            
            tabButtons.appendChild(tabButton);
            
            // Вміст вкладки
            const tabPane = document.createElement('div');
            tabPane.id = `new-tab-${category.replace(/\s+/g, '-')}`;
            tabPane.className = `tab-pane ${index === 0 ? 'active' : ''}`;
            
            // Створюємо чекбокси для заходів
            categorizedMeasures[category].forEach(measure => {
                const measureDiv = document.createElement('div');
                measureDiv.className = 'measure-checkbox';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `new-measure-${measure.id}`;
                checkbox.name = 'measures';
                checkbox.value = measure.id;
                
                const label = document.createElement('label');
                label.htmlFor = `new-measure-${measure.id}`;
                label.textContent = measure.measure_name;
                
                // Додаємо опис заходу, якщо він є
                if (measure.description) {
                    const description = document.createElement('div');
                    description.className = 'measure-description';
                    description.textContent = measure.description;
                    label.appendChild(description);
                }
                
                // Додаємо інформацію про вартість
                const costInfo = document.createElement('div');
                costInfo.className = 'measure-cost';
                costInfo.textContent = `Вартість: ${measure.estimated_cost ? measure.estimated_cost.toLocaleString() : 'Не вказано'} грн`;
                
                measureDiv.appendChild(checkbox);
                measureDiv.appendChild(label);
                measureDiv.appendChild(costInfo);
                tabPane.appendChild(measureDiv);
            });
            
            tabContent.appendChild(tabPane);
        });
        
        tabsContainer.appendChild(tabButtons);
        tabsContainer.appendChild(tabContent);
        measuresGroup.appendChild(tabsContainer);
        
        form.appendChild(measuresGroup);
        
        // Кнопки форми
        const buttonsGroup = document.createElement('div');
        buttonsGroup.className = 'form-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Скасувати';
        cancelButton.className = 'cancel-button';
        cancelButton.onclick = () => { modal.style.display = 'none'; };
        
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Створити програму';
        submitButton.className = 'submit-button';
        
        buttonsGroup.appendChild(cancelButton);
        buttonsGroup.appendChild(submitButton);
        form.appendChild(buttonsGroup);
        
        // Обробник відправки форми
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            // Отримуємо вибрані заходи
            const selectedMeasures = Array.from(formData.getAll('measures')).map(id => parseInt(id));
            
            // Отримуємо вибрані об'єкти
            const selectedFactories = Array.from(formData.getAll('factories')).map(id => parseInt(id));
            
            if (selectedMeasures.length === 0) {
                alert('Будь ласка, виберіть хоча б один захід для програми.');
                return;
            }
            
            // Створюємо дані програми
            const programData = {
                programName: formData.get('programName'),
                description: formData.get('description'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                status: formData.get('status'),
                totalBudget: parseFloat(formData.get('totalBudget')),
                createdBy: 'System User' // Можна замінити на ім'я поточного користувача
            };
            
            try {
                // Створюємо програму
                const program = await createRegionalProgram(programData);
                
                // Додаємо вибрані заходи до програми
                for (const measureId of selectedMeasures) {
                    const measure = allMeasures.find(m => m.id === measureId);
                    
                    if (measure) {
                        await addProgramMeasure(program.id, {
                            measureId: measureId,
                            priority: 1, // За замовчуванням
                            budgetAllocation: measure.estimated_cost || 0,
                            plannedStartDate: programData.startDate,
                            plannedEndDate: programData.endDate,
                            notes: null
                        });
                    }
                }
                
                // Зв'язуємо програму з вибраними об'єктами
                if (selectedFactories.length > 0) {
                    await updateProgramFactories(program.id, selectedFactories);
                }
                
                alert(`Програму "${programData.programName}" успішно створено!`);
                
                // Запитуємо користувача, чи хоче він згенерувати звіт
                if (confirm('Бажаєте згенерувати звіт або кошторис для програми?')) {
                    showGenerateReportModal(program.id);
                } else {
                    // Закриваємо модальне вікно
                    modal.style.display = 'none';
                    
                    // Оновлюємо список програм
                    const programsContainer = document.querySelector('.programs-container');
                    if (programsContainer) {
                        const newProgramsView = await createProgramsView();
                        programsContainer.replaceWith(newProgramsView);
                    }
                }
                
            } catch (error) {
                console.error('Error creating program:', error);
                alert(`Помилка при створенні програми: ${error.message}`);
            }
        });
        
        modalContent.appendChild(form);
        
        // Очищаємо та додаємо новий контент
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Показуємо модальне вікно
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error showing create new program modal:', error);
        alert(`Помилка при відкритті форми створення програми: ${error.message}`);
    }
}

/**
 * Получает объекты, связанные с программой
 * @param {number} programId - ID программы
 * @returns {Promise<Array>} Массив объектов программы
 */
async function fetchProgramFactories(programId) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}/factories`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching factories for program ID ${programId}:`, error);
        throw error;
    }
}

/**
 * Обновляет связь программы с объектами
 * @param {number} programId - ID программы
 * @param {Array<number>} factoryIds - Массив ID объектов
 * @returns {Promise<Object>} Результат операции
 */
async function updateProgramFactories(programId, factoryIds) {
    try {
        const response = await fetch(`${API_BASE_URL}/regional-programs/${programId}/factories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ factoryIds })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error updating factories for program ID ${programId}:`, error);
        throw error;
    }
}

// Експортуємо функції для використання в інших модулях
export {
    fetchMeasureCategories,
    fetchMeasures,
    fetchMeasureDetails,
    fetchFactoryMeasures,
    addFactoryMeasure,
    removeFactoryMeasure,
    fetchRegionalPrograms,
    fetchProgramDetails,
    createRegionalProgram,
    addProgramMeasure,
    removeProgramMeasure,
    generateProgramReport,
    downloadReport,
    createMeasuresView,
    createProgramsView
};