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
                    <button class="math-key" data-symbol="sin(">(</button>
                    <button class="math-key" data-symbol="cos(">(</button>
                    <button class="math-key" data-symbol="tan(">(</button>
                    <button class="math-key" data-symbol="log(">(</button>
                    <button class="math-key" data-symbol="ln(">(</button>
                    <button class="math-key" data-symbol="sqrt(">(</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="^">^</button>
                    <button class="math-key" data-symbol="pi">π</button>
                    <button class="math-key" data-symbol="e">e</button>
                    <button class="math-key" data-symbol="∞">∞</button>
                    <button class="math-key" data-symbol="∫">∫</button>
                    <button class="math-key" data-symbol="∑">∑</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="(">(</button>
                    <button class="math-key" data-symbol=")">)</button>
                    <button class="math-key" data-symbol="[">[</button>
                    <button class="math-key" data-symbol="]">]</button>
                    <button class="math-key" data-symbol="{">{</button>
                    <button class="math-key" data-symbol="}">}</button>
                </div>
                <div class="keyboard-row">
                    <button class="math-key" data-symbol="+">+</button>
                    <button class="math-key" data-symbol="-">-</button>
                    <button class="math-key" data-symbol="*">*</button>
                    <button class="math-key" data-symbol="/">/</button>
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
                    <button class="math-key special" id="keyboard-backspace">⌫</button>
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
        console.error('Required elements for math keyboard not found');
        return;
    }

    // Toggle keyboard visibility
    keyboardBtn.addEventListener('click', () => {
        keyboard.style.display = keyboard.style.display === 'none' ? 'block' : 'none';
    });

    // Close keyboard
    closeBtn.addEventListener('click', () => {
        keyboard.style.display = 'none';
    });

    // Add click handler for math keys
    document.querySelectorAll('.math-key').forEach(key => {
        key.addEventListener('click', () => {
            const symbol = key.getAttribute('data-symbol');
            if (expressionInput) {
                const start = expressionInput.selectionStart;
                const end = expressionInput.selectionEnd;
                const text = expressionInput.value;
                expressionInput.value = text.substring(0, start) + symbol + text.substring(end);
                expressionInput.focus();
                expressionInput.setSelectionRange(start + symbol.length, start + symbol.length);

                // Trigger input event for any listeners
                const event = new Event('input', { bubbles: true });
                expressionInput.dispatchEvent(event);
            }
        });
    });

    // Add special key handlers
    const backspaceBtn = document.getElementById('keyboard-backspace');
    const clearBtn = document.getElementById('keyboard-clear');
    const spaceBtn = document.getElementById('keyboard-space');
    const enterBtn = document.getElementById('keyboard-enter');

    // Backspace button handler
    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', () => {
            if (expressionInput) {
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
            });
        }
    }, 20);
});

