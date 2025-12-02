// Math Keyboard Overlay Functionality
const initMathKeyboard = () => {
    // Check if keyboard container exists
    const keyboardContainer = document.getElementById('math-keyboard-container');
    if (!keyboardContainer) {
        console.warn('Math keyboard container not found - keyboard disabled');
        return;
    }

    // Create keyboard overlay HTML
    const keyboardHTML = `
        <div id="math-keyboard" class="math-keyboard-overlay" style="display: none;">
            <div class="math-keyboard-header">
                <h4>Math Keyboard</h4>
                <button class="keyboard-close-btn" id="keyboard-close-btn">×</button>
            </div>
            <div class="math-keyboard-content">
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="sin(">sin( )</button>
                    <button class="math-key" data-symbol="cos(">cos( )</button>
                    <button class="math-key" data-symbol="tan(">tan( )</button>
                    <button class="math-key" data-symbol="log(">log( )</button>
                    <button class="math-key" data-symbol="ln(">ln( )</button>
                    <button class="math-key" data-symbol="sqrt(">√( )</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="^">x^y</button>
                    <button class="math-key" data-symbol="pi">π</button>
                    <button class="math-key" data-symbol="e">e</button>
                    <button class="math-key" data-symbol="∞">∞</button>
                    <button class="math-key" data-symbol="∫">∫</button>
                    <button class="math-key" data-symbol="∑">∑</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="(">( )</button>
                    <button class="math-key" data-symbol=")"></button>
                    <button class="math-key" data-symbol="[">[ ]</button>
                    <button class="math-key" data-symbol="]"></button>
                    <button class="math-key" data-symbol="{">{ }</button>
                    <button class="math-key" data-symbol="}"></button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="+">+</button>
                    <button class="math-key" data-symbol="-">-</button>
                    <button class="math-key" data-symbol="*">×</button>
                    <button class="math-key" data-symbol="/">÷</button>
                    <button class="math-key" data-symbol="=">=</button>
                    <button class="math-key" data-symbol=",">,</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="x">x</button>
                    <button class="math-key" data-symbol="y">y</button>
                    <button class="math-key" data-symbol="z">z</button>
                    <button class="math-key" data-symbol="n">n</button>
                    <button class="math-key" data-symbol="i">i</button>
                    <button class="math-key" data-symbol="j">j</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="α">α</button>
                    <button class="math-key" data-symbol="β">β</button>
                    <button class="math-key" data-symbol="γ">γ</button>
                    <button class="math-key" data-symbol="δ">δ</button>
                    <button class="math-key" data-symbol="ε">ε</button>
                    <button class="math-key" data-symbol="θ">θ</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key special" id="keyboard-backspace">⌫ Backspace</button>
                    <button class="math-key special" id="keyboard-clear">Clear</button>
                    <button class="math-key special" id="keyboard-space">Space</button>
                    <button class="math-key special" id="keyboard-enter">Enter</button>
                </div>
            </div>
        </div>
    `;

    // Add keyboard to the container
    keyboardContainer.innerHTML = keyboardHTML;

    // Get references after adding to DOM
    const keyboard = document.getElementById('math-keyboard');
    const keyboardBtn = document.getElementById('keyboard-btn');
    const closeBtn = document.getElementById('keyboard-close-btn');
    const expressionInput = document.getElementById('adv-expression');

    if (!keyboard || !keyboardBtn || !closeBtn || !expressionInput) {
        console.warn('Required elements for math keyboard not found');
        return;
    }

    // Toggle keyboard visibility
    keyboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        keyboard.style.display = keyboard.style.display === 'none' ? 'block' : 'none';
        if (keyboard.style.display === 'block') {
            expressionInput.focus();
        }
    });

    // Close keyboard
    closeBtn.addEventListener('click', () => {
        keyboard.style.display = 'none';
        expressionInput.focus();
    });

    // Helper function to insert text at cursor position
    const insertAtCursor = (text) => {
        const start = expressionInput.selectionStart;
        const end = expressionInput.selectionEnd;
        const currentText = expressionInput.value;
        
        // Insert the text
        expressionInput.value = currentText.substring(0, start) + text + currentText.substring(end);
        
        // Set cursor position after the inserted text
        const newPos = start + text.length;
        expressionInput.setSelectionRange(newPos, newPos);
        
        // Trigger input event for any listeners
        const event = new Event('input', { bubbles: true });
        expressionInput.dispatchEvent(event);
        
        // Keep focus on the input
        expressionInput.focus();
    };

    // Add click handler for math keys
    document.querySelectorAll('.math-key').forEach(key => {
        if (key.id) return; // Skip special buttons with IDs
        
        key.addEventListener('click', (e) => {
            e.preventDefault();
            const symbol = key.getAttribute('data-symbol');
            insertAtCursor(symbol);
        });
    });

    // Special key handlers
    const backspaceBtn = document.getElementById('keyboard-backspace');
    const clearBtn = document.getElementById('keyboard-clear');
    const spaceBtn = document.getElementById('keyboard-space');
    const enterBtn = document.getElementById('keyboard-enter');

    // Backspace button handler
    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const start = expressionInput.selectionStart;
            const end = expressionInput.selectionEnd;
            const text = expressionInput.value;
            
            if (start === end && start > 0) {
                // Delete one character before cursor
                expressionInput.value = text.substring(0, start - 1) + text.substring(end);
                expressionInput.setSelectionRange(start - 1, start - 1);
            } else if (start !== end) {
                // Delete selected text
                expressionInput.value = text.substring(0, start) + text.substring(end);
                expressionInput.setSelectionRange(start, start);
            }
            
            // Trigger input event
            const event = new Event('input', { bubbles: true });
            expressionInput.dispatchEvent(event);
            expressionInput.focus();
        });
    }

    // Clear button handler
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            expressionInput.value = '';
            const event = new Event('input', { bubbles: true });
            expressionInput.dispatchEvent(event);
            expressionInput.focus();
        });
    }

    // Space button handler
    if (spaceBtn) {
        spaceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            insertAtCursor(' ');
        });
    }

    // Enter button handler
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            insertAtCursor('\n');
        });
    }

    // Close keyboard when clicking outside
    document.addEventListener('click', (e) => {
        if (keyboard.style.display === 'block' && 
            !keyboard.contains(e.target) && 
            e.target !== keyboardBtn) {
            keyboard.style.display = 'none';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && keyboard.style.display === 'block') {
            keyboard.style.display = 'none';
            e.preventDefault();
        }
    });

    // Handle tab key in keyboard
    keyboard.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertAtCursor('    '); // Insert 4 spaces for tab
        }
    });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMathKeyboard);
} else {
    // In case the document is already loaded
    initMathKeyboard();
}
