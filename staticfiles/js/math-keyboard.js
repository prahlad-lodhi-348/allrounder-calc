// Math Keyboard Overlay Functionality (production-ready)
document.addEventListener('DOMContentLoaded', () => {
    const keyboardContainer = document.getElementById('math-keyboard-container');
    const keyboardToggleBtn = document.getElementById('keyboard-btn');
    const expressionInput = document.getElementById('adv-expression');

    if (!keyboardContainer || !keyboardToggleBtn || !expressionInput) {
        console.warn('Math keyboard: required elements not found – keyboard disabled');
        return;
    }

    keyboardContainer.style.display = 'block';
    keyboardContainer.innerHTML = `
        <div id="math-keyboard" class="math-keyboard-overlay" style="display:none;">
            <div class="math-keyboard-panel">
                <div class="math-keyboard-header">
                    <h4>Math Keyboard</h4>
                    <button type="button" class="math-keyboard-close" id="math-keyboard-close">✕</button>
                </div>
                <div class="math-keyboard-content">
                    <div class="keyboard-row">
                        <button class="math-key" data-symbol="sin(">sin</button>
                        <button class="math-key" data-symbol="cos(">cos</button>
                        <button class="math-key" data-symbol="tan(">tan</button>
                        <button class="math-key" data-symbol="log(">log</button>
                        <button class="math-key" data-symbol="ln(">ln</button>
                        <button class="math-key" data-symbol="sqrt(">&#8730;</button>
                    </div>
                    <div class="keyboard-row">
                        <button class="math-key" data-symbol="^">^</button>
                        <button class="math-key" data-symbol="pi">&#960;</button>
                        <button class="math-key" data-symbol="e">e</button>
                        <button class="math-key" data-symbol="(">(</button>
                        <button class="math-key" data-symbol=")">)</button>
                        <button class="math-key" data-symbol=",">,</button>
                    </div>
                    <div class="keyboard-row">
                        <button class="math-key" data-symbol="+">+</button>
                        <button class="math-key" data-symbol="-">−</button>
                        <button class="math-key" data-symbol="*">×</button>
                        <button class="math-key" data-symbol="/">÷</button>
                        <button class="math-key" data-symbol="=">=</button>
                    </div>
                    <div class="keyboard-row">
                        <button class="math-key" data-symbol="x">x</button>
                        <button class="math-key" data-symbol="y">y</button>
                        <button class="math-key" data-symbol="z">z</button>
                        <button class="math-key" data-symbol="t">t</button>
                    </div>
                    <div class="keyboard-row keyboard-row-special">
                        <button class="math-key special" id="keyboard-backspace">⌫</button>
                        <button class="math-key special" id="keyboard-clear">Clear</button>
                        <button class="math-key special" id="keyboard-space">Space</button>
                        <button class="math-key special" id="keyboard-enter">Enter</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const overlay = document.getElementById('math-keyboard');
    const closeBtn = document.getElementById('math-keyboard-close');

    if (!overlay || !closeBtn) {
        console.warn('Math keyboard overlay could not be initialized');
        return;
    }

    const openKeyboard = () => {
        overlay.style.display = 'flex';
    };

    const closeKeyboard = () => {
        overlay.style.display = 'none';
    };

    keyboardToggleBtn.addEventListener('click', () => {
        if (overlay.style.display === 'none' || overlay.style.display === '') {
            openKeyboard();
        } else {
            closeKeyboard();
        }
    });

    closeBtn.addEventListener('click', closeKeyboard);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeKeyboard();
        }
    });

    overlay.querySelectorAll('.math-key').forEach((btn) => {
        btn.addEventListener('click', () => {
            const symbol = btn.getAttribute('data-symbol');
            if (!symbol || !expressionInput) return;

            const start = expressionInput.selectionStart ?? expressionInput.value.length;
            const end = expressionInput.selectionEnd ?? expressionInput.value.length;
            const value = expressionInput.value;

            expressionInput.value = value.slice(0, start) + symbol + value.slice(end);
            const caret = start + symbol.length;
            expressionInput.focus();
            expressionInput.setSelectionRange(caret, caret);
        });
    });

    const backspaceBtn = document.getElementById('keyboard-backspace');
    const clearBtn = document.getElementById('keyboard-clear');
    const spaceBtn = document.getElementById('keyboard-space');
    const enterBtn = document.getElementById('keyboard-enter');

    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!expressionInput) return;
            const start = expressionInput.selectionStart ?? expressionInput.value.length;
            const end = expressionInput.selectionEnd ?? expressionInput.value.length;
            const value = expressionInput.value;

            if (start === end && start > 0) {
                expressionInput.value = value.slice(0, start - 1) + value.slice(end);
                const caret = start - 1;
                expressionInput.setSelectionRange(caret, caret);
            } else if (start !== end) {
                expressionInput.value = value.slice(0, start) + value.slice(end);
                expressionInput.setSelectionRange(start, start);
            }
            expressionInput.focus();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!expressionInput) return;
            expressionInput.value = '';
            expressionInput.focus();
        });
    }

    if (spaceBtn) {
        spaceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!expressionInput) return;
            const start = expressionInput.selectionStart ?? expressionInput.value.length;
            const end = expressionInput.selectionEnd ?? expressionInput.value.length;
            const value = expressionInput.value;
            expressionInput.value = value.slice(0, start) + ' ' + value.slice(end);
            const caret = start + 1;
            expressionInput.setSelectionRange(caret, caret);
            expressionInput.focus();
        });
    }

    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const executeBtn = document.getElementById('execute-btn');
            if (executeBtn) {
                executeBtn.click();
            }
        });
    }
});
