// interfaceIntegration.js
// UI integration code for adding the measures functionality to the existing interface

import { createMeasuresView, createProgramsView } from './measuresManager.js';
import { calculateAllIndicators, createIndicatorsDisplay } from './integralIndicators.js';

// Add CSS styles for the measures management UI
const styles = `
.factory-detail-tabs {
    margin-top: 20px;
    width: 100%;
}

.tab-buttons {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
}

.tab-button {
    padding: 8px 16px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.tab-button:hover {
    background-color: #e0e0e0;
}

.tab-button.active {
    background-color: #4682B4;
    color: white;
    border-color: #4682B4;
}

.tab-pane {
    display: none;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 0 4px 4px 4px;
    background-color: #fff;
}

.tab-pane.active {
    display: block;
}

.measures-container {
    padding: 15px;
}

.measures-title {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 18px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.measures-category-section {
    margin-bottom: 25px;
}

.measures-category-title {
    margin-top: 0;
    margin-bottom: 10px;
    color: #4682B4;
    font-size: 16px;
}

.measures-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
}

.measures-table th, .measures-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.measures-table th {
    background-color: #f5f5f5;
    font-weight: bold;
}

.measures-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.no-measures-message {
    color: #777;
    font-style: italic;
    text-align: center;
    padding: 20px;
}

.add-measure-section {
    margin-top: 20px;
    text-align: center;
}

.add-measure-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.add-measure-button:hover {
    background-color: #45a049;
}

.remove-measure-btn {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.remove-measure-btn:hover {
    background-color: #d32f2f;
}

.programs-container {
    padding: 15px;
}

.programs-title {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.programs-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.programs-table th, .programs-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

.programs-table th {
    background-color: #f5f5f5;
    font-weight: bold;
}

.programs-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.view-program-btn, .generate-report-btn {
    background-color: #4682B4;
    color: white;
    border: none;
    padding: 5px 10px;
    margin-right: 5px;
    border-radius: 4px;
    cursor: pointer;
}

.generate-report-btn {
    background-color: #FF9800;
}

.view-program-btn:hover {
    background-color: #3a6d96;
}

.generate-report-btn:hover {
    background-color: #e68a00;
}

.create-program-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 20px;
}

.create-program-btn:hover {
    background-color: #45a049;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.dates-group {
    display: flex;
    gap: 15px;
}

.dates-group label {
    flex: 1;
}

.dates-group input {
    flex: 1;
}

.form-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.cancel-button {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    flex: 1;
}

.submit-button {
    background-color: #4682B4;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    flex: 1;
}

.cancel-button:hover {
    background-color: #5a6268;
}

.submit-button:hover {
    background-color: #3a6d96;
}

.error-message {
    color: #f44336;
    font-weight: bold;
    margin: 20px 0;
}

.programs-button-container {
    margin: 20px 0;
    text-align: right;
}

.measure-checkbox {
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.measure-description {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.measure-cost {
    font-size: 12px;
    color: #4682B4;
    font-weight: bold;
    margin-top: 5px;
}

.info-window-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.measures-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    flex: 1;
}

.measures-button:hover {
    background-color: #45a049;
}
`;

/**
 * Initializes the styles for measures functionality
 */
function initializeStyles() {
    // Check if styles are already added
    if (document.getElementById('measures-management-styles')) {
        return;
    }
    
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.id = 'measures-management-styles';
    styleElement.textContent = styles;
    
    // Add to the document head
    document.head.appendChild(styleElement);
}

/**
 * Adds measures functionality to the factory detail modal
 * @param {HTMLElement} modalContent - The modal content element
 * @param {Object} factory - Factory data object
 */
export async function addMeasuresTabToFactoryModal(modalContent, factory) {
    // Initialize the styles
    initializeStyles();
    
    // Create a tab system if it doesn't exist
    let tabsContainer = modalContent.querySelector('.factory-detail-tabs');
    
    if (!tabsContainer) {
        tabsContainer = document.createElement('div');
        tabsContainer.className = 'factory-detail-tabs';
        
        // Create tab buttons container
        const tabButtons = document.createElement('div');
        tabButtons.className = 'tab-buttons';
        
        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        tabsContainer.appendChild(tabButtons);
        tabsContainer.appendChild(tabContent);
        
        // Insert the tabs container after the indicators container
        const indicatorsContainer = modalContent.querySelector('#airQualityContainer');
        if (indicatorsContainer) {
            indicatorsContainer.parentNode.insertBefore(tabsContainer, indicatorsContainer.nextSibling);
        } else {
            const factoryName = modalContent.querySelector('.factory-name');
            if (factoryName) {
                factoryName.parentNode.insertBefore(tabsContainer, factoryName.nextSibling);
            } else {
                modalContent.appendChild(tabsContainer);
            }
        }
    }
    
    // Get the tab buttons and content containers
    const tabButtons = tabsContainer.querySelector('.tab-buttons');
    const tabContent = tabsContainer.querySelector('.tab-content');
    
    // Check if measures tab already exists
    if (tabButtons.querySelector('[data-tab="measures"]')) {
        return; // Tab already exists
    }
    
    // Create the "Data" tab if it doesn't exist (for existing charts)
    if (!tabButtons.querySelector('[data-tab="data"]')) {
        // Create "Data" tab button
        const dataTabButton = document.createElement('button');
        dataTabButton.className = 'tab-button active';
        dataTabButton.setAttribute('data-tab', 'data');
        dataTabButton.textContent = 'Дані вимірів';
        tabButtons.appendChild(dataTabButton);
        
        // Create "Data" tab content
        const dataTabContent = document.createElement('div');
        dataTabContent.className = 'tab-pane active';
        dataTabContent.id = 'data-tab-content';
        tabContent.appendChild(dataTabContent);
        
        // Move existing charts to the data tab
        const chartsContainer = modalContent.querySelector('.charts-container');
        const tableContainer = modalContent.querySelector('.emissions-table-container');
        const categorySelect = modalContent.querySelector('.category-dropdown-container');
        
        if (categorySelect) {
            dataTabContent.appendChild(categorySelect);
        }
        
        if (chartsContainer) {
            dataTabContent.appendChild(chartsContainer);
        }
        
        if (tableContainer) {
            dataTabContent.appendChild(tableContainer);
        }
    }
    
    // Create the "Measures" tab button
    const measuresTabButton = document.createElement('button');
    measuresTabButton.className = 'tab-button';
    measuresTabButton.setAttribute('data-tab', 'measures');
    measuresTabButton.textContent = 'Заходи';
    tabButtons.appendChild(measuresTabButton);
    
    // Create the "Measures" tab content
    const measuresTabContent = document.createElement('div');
    measuresTabContent.className = 'tab-pane';
    measuresTabContent.id = 'measures-tab-content';
    
    // Loading state
    const loadingElement = document.createElement('p');
    loadingElement.textContent = 'Завантаження заходів...';
    loadingElement.style.textAlign = 'center';
    loadingElement.style.padding = '20px';
    measuresTabContent.appendChild(loadingElement);
    
    tabContent.appendChild(measuresTabContent);
    
    // Add event listeners to tab buttons
    tabButtons.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            // Deactivate all tabs
            tabButtons.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            tabContent.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Activate the clicked tab
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            const tabPane = tabContent.querySelector(`#${tabName}-tab-content`) || 
                           tabContent.querySelector(`[id$="${tabName}-tab-content"]`);
            
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
    
    // Async load the measures content
    try {
        const measuresView = await createMeasuresView(factory);
        
        // Replace loading element with measures content
        measuresTabContent.innerHTML = '';
        measuresTabContent.appendChild(measuresView);
    } catch (error) {
        console.error('Error loading measures view:', error);
        measuresTabContent.innerHTML = '';
        
        const errorElement = document.createElement('p');
        errorElement.textContent = `Помилка при завантаженні заходів: ${error.message}`;
        errorElement.style.color = '#FF0000';
        errorElement.style.textAlign = 'center';
        errorElement.style.padding = '20px';
        
        measuresTabContent.appendChild(errorElement);
    }
}

/**
 * Adds a programs button to the main navigation
 */
export function addProgramsButtonToNavigation() {
    // Initialize the styles
    initializeStyles();
    
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Check if the button already exists
    if (document.getElementById('show-programs-button')) {
        return;
    }
    
    // Create a button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'programs-button-container';
    buttonContainer.style.margin = '20px 0';
    buttonContainer.style.textAlign = 'right';
    
    // Create the button
    const programsButton = document.createElement('button');
    programsButton.id = 'show-programs-button';
    programsButton.className = 'action-button';
    programsButton.textContent = 'Регіональні програми';
    programsButton.style.backgroundColor = '#4682B4';
    programsButton.style.color = 'white';
    programsButton.style.padding = '10px 15px';
    programsButton.style.border = 'none';
    programsButton.style.borderRadius = '4px';
    programsButton.style.cursor = 'pointer';
    programsButton.style.fontWeight = 'bold';
    
    programsButton.addEventListener('click', showProgramsModal);
    
    buttonContainer.appendChild(programsButton);
    
    // Insert after the controls section
    const controls = container.querySelector('.controls');
    if (controls) {
        controls.parentNode.insertBefore(buttonContainer, controls.nextSibling);
    } else {
        // Insert as the first element in the container
        container.insertBefore(buttonContainer, container.firstChild);
    }
}

/**
 * Shows the regional programs modal
 */
export async function showProgramsModal() {
    // Initialize the styles
    initializeStyles();
    
    let modal = document.getElementById('programsModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'programsModal';
        modal.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '1200px';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Регіональні програми покращення стану довкілля';
        title.className = 'modal-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-modal';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // Create content area
        const contentArea = document.createElement('div');
        contentArea.id = 'programs-content-area';
        contentArea.className = 'programs-content-area';
        
        // Loading state
        const loadingElement = document.createElement('p');
        loadingElement.textContent = 'Завантаження програм...';
        loadingElement.style.textAlign = 'center';
        loadingElement.style.padding = '20px';
        contentArea.appendChild(loadingElement);
        
        modalContent.appendChild(contentArea);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    // Show the modal
    modal.style.display = 'block';
    
    // Load programs content
    const contentArea = document.getElementById('programs-content-area');
    try {
        const programsView = await createProgramsView();
        
        // Replace loading element with programs content
        contentArea.innerHTML = '';
        contentArea.appendChild(programsView);
    } catch (error) {
        console.error('Error loading programs view:', error);
        contentArea.innerHTML = '';
        
        const errorElement = document.createElement('p');
        errorElement.textContent = `Помилка при завантаженні програм: ${error.message}`;
        errorElement.style.color = '#FF0000';
        errorElement.style.textAlign = 'center';
        errorElement.style.padding = '20px';
        
        contentArea.appendChild(errorElement);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Extends the infoWindow content for factories on the map
 * @param {HTMLElement} infoContent - The current info window content
 * @param {Object} factory - Factory data object
 * @returns {HTMLElement} Enhanced info window content
 */
export function enhanceInfoWindowContent(infoContent, factory) {
    // Initialize the styles
    initializeStyles();
    
    // Check if factory has measurements
    if (!factory.measurements || factory.measurements.length === 0) {
        return infoContent;
    }
    
    // Calculate indicators
    const indicators = calculateAllIndicators(factory);
    
    // If we have indicators, add them to the info window
    if (indicators && Object.keys(indicators).length > 0) {
        // Find an appropriate place to insert the indicators
        const existingIndicators = infoContent.querySelector('.indicators-container');
        if (existingIndicators) {
            // Replace existing indicators
            const newIndicators = createIndicatorsDisplay(indicators);
            existingIndicators.parentNode.replaceChild(newIndicators, existingIndicators);
        } else {
            // Add new indicators after the title
            const title = infoContent.querySelector('h3');
            if (title) {
                const indicatorsDisplay = createIndicatorsDisplay(indicators);
                title.parentNode.insertBefore(indicatorsDisplay, title.nextSibling);
            } else {
                // Add to the beginning
                const indicatorsDisplay = createIndicatorsDisplay(indicators);
                infoContent.insertBefore(indicatorsDisplay, infoContent.firstChild);
            }
        }
    }
    
    // Add a button to open measures dialog
    const existingButton = infoContent.querySelector('.measures-button');
    if (!existingButton) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'info-window-buttons';
        
        // Details button (if one doesn't already exist)
        if (!infoContent.querySelector('.details-button')) {
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Переглянути дані';
            detailsButton.className = 'details-button';
            
            detailsButton.addEventListener('click', function() {
                try {
                    const event = new CustomEvent('showFactoryDetails', { detail: factory });
                    window.dispatchEvent(event);
                } catch (error) {
                    console.error('Error opening factory details:', error);
                }
            });
            
            buttonsContainer.appendChild(detailsButton);
        } else {
            // Add the existing details button to the container
            const existingDetailsButton = infoContent.querySelector('.details-button');
            buttonsContainer.appendChild(existingDetailsButton);
        }
        
        // Measures button
        const measuresButton = document.createElement('button');
        measuresButton.textContent = 'Заходи покращення';
        measuresButton.className = 'measures-button';
        
        measuresButton.addEventListener('click', function() {
            try {
                // This event will be handled to open the factory modal with measures tab
                const event = new CustomEvent('showFactoryMeasures', { detail: factory });
                window.dispatchEvent(event);
            } catch (error) {
                console.error('Error opening measures:', error);
            }
        });
        
        buttonsContainer.appendChild(measuresButton);
        
        // Find the best place to insert the buttons container
        const lastChild = infoContent.lastElementChild;
        if (lastChild && lastChild.classList.contains('details-button')) {
            // Replace the existing button with the container
            infoContent.replaceChild(buttonsContainer, lastChild);
        } else {
            // Append to the end
            infoContent.appendChild(buttonsContainer);
        }
    }
    
    return infoContent;
}

/**
 * Updates existing factory info window content
 * This is called when the info window needs to be refreshed
 */
export function updateFactoryInfoWindows() {
    // This function can be called to refresh all open info windows
    // with updated data if needed
    const openInfoWindow = document.querySelector('.gm-style-iw');
    if (openInfoWindow) {
        // Trigger a refresh event if needed
        console.log('Info window is open, refreshing content would go here');
    }
}