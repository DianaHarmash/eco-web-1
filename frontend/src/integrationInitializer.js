// integrationInitializer.js
// Script to initialize the measures management functionality on page load

import { 
    addMeasuresTabToFactoryModal, 
    addProgramsButtonToNavigation, 
    enhanceInfoWindowContent, 
    showProgramsModal 
} from './interfaceIntegration.js';

import { calculateAllIndicators } from './integralIndicators.js';

/**
 * Initializes the measures management functionality
 */
function initializeMeasuresManagement() {
    console.log('Initializing measures management functionality...');
    
    // Add programs button to the main navigation
    addProgramsButtonToNavigation();
    
    // Set up event listeners for factory details
    setupEventListeners();
    
    console.log('Measures management functionality initialized successfully');
}

/**
 * Sets up event listeners for integration with existing code
 */
function setupEventListeners() {
    // Listen for factory detail modal opening
    window.addEventListener('showFactoryDetails', handleShowFactoryDetails);
    
    // Listen for factory measures modal opening
    window.addEventListener('showFactoryMeasures', handleShowFactoryMeasures);
    
    // Enhance the factory marker info windows
    enhanceInfoWindows();
}

/**
 * Handles the showFactoryDetails event
 * @param {CustomEvent} event - Event with factory details
 */
function handleShowFactoryDetails(event) {
    const factory = event.detail;
    
    // Wait for the modal to be created
    setTimeout(() => {
        const modal = document.getElementById('pieChartModal');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                addMeasuresTabToFactoryModal(modalContent, factory);
            }
        }
    }, 300);
}

/**
 * Handles the showFactoryMeasures event
 * @param {CustomEvent} event - Event with factory details
 */
function handleShowFactoryMeasures(event) {
    const factory = event.detail;
    
    // First trigger the details to be shown
    try {
        showFactoryDetails(factory);
        
        // Then wait for the modal to be created and switch to measures tab
        setTimeout(() => {
            const modal = document.getElementById('pieChartModal');
            if (modal) {
                const measuresTabButton = modal.querySelector('.tab-button[data-tab="measures"]');
                if (measuresTabButton) {
                    measuresTabButton.click();
                }
            }
        }, 500);
    } catch (error) {
        console.error('Error showing factory measures:', error);
    }
}

/**
 * Shows factory details modal
 * @param {Object} factory - Factory data
 */
function showFactoryDetails(factory) {
    // Check for existing showPieChartModal function
    if (typeof window.showPieChartModal === 'function') {
        window.showPieChartModal(factory);
    } else if (typeof showPieChartModal === 'function') {
        showPieChartModal(factory);
    } else {
        throw new Error('showPieChartModal function not found');
    }
}

/**
 * Enhances info windows by extending createInfoWindowContent function
 */
function enhanceInfoWindows() {
    // Store the original function
    const originalCreateInfoWindowContent = window.createInfoWindowContent || createInfoWindowContent;
    
    // Define the new function
    const newCreateInfoWindowContent = (factory) => {
        // Call the original function
        const originalContent = originalCreateInfoWindowContent(factory);
        
        // Enhance the content
        return enhanceInfoWindowContent(originalContent, factory);
    };
    
    // Replace the original function
    if (window.createInfoWindowContent) {
        window.createInfoWindowContent = newCreateInfoWindowContent;
    } else if (typeof createInfoWindowContent !== 'undefined') {
        // This pattern works for functions defined in modules
        window.createInfoWindowContent = newCreateInfoWindowContent;
        createInfoWindowContent = newCreateInfoWindowContent;
    }
}

/**
 * Initialize the functionality once the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing measures management...');
    initializeMeasuresManagement();
});

// If DOM is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already loaded, initializing measures management immediately...');
    setTimeout(initializeMeasuresManagement, 100);
}

/**
 * Export functions for direct use
 */
export {
    initializeMeasuresManagement,
    showProgramsModal
};