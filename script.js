// ==================== Authentication Functions ====================

// Switch between login and signup tabs
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (tab === 'login') {
        loginForm?.classList.add('active');
        signupForm?.classList.remove('active');
        tabs[0]?.classList.add('active');
        tabs[1]?.classList.remove('active');
    } else {
        loginForm?.classList.remove('active');
        signupForm?.classList.add('active');
        tabs[0]?.classList.remove('active');
        tabs[1]?.classList.add('active');
    }
    
    // Clear error messages
    clearMessages();
}

// Clear all error and success messages
function clearMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.textContent = '');
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('signupError');
    const successElement = document.getElementById('signupSuccess');
    
    // Clear previous messages
    errorElement.textContent = '';
    successElement.textContent = '';
    
    // Validation
    if (username.length < 3) {
        errorElement.textContent = 'Username must be at least 3 characters long';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if username already exists
    if (users[username]) {
        errorElement.textContent = 'Username already exists';
        return;
    }
    
    // Create new user
    users[username] = {
        password: btoa(password), // Simple encoding (not secure for production)
        history: []
    };
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    successElement.textContent = 'Account created successfully! Please login.';
    
    // Clear form
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Switch to login tab after 2 seconds
    setTimeout(() => {
        switchTab('login');
    }, 2000);
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');
    
    // Clear previous error
    errorElement.textContent = '';
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if user exists
    if (!users[username]) {
        errorElement.textContent = 'Invalid username or password';
        return;
    }
    
    // Check password
    if (users[username].password !== btoa(password)) {
        errorElement.textContent = 'Invalid username or password';
        return;
    }
    
    // Set current user in session
    sessionStorage.setItem('currentUser', username);
    
    // Redirect to calculator
    window.location.href = 'calculator.html';
}

// Check if user is authenticated
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = currentUser;
    }
    
    // Load user's history
    loadHistory();
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ==================== Calculator Functions ====================

let expression = '';
let lastResult = '0';
let historyVisible = false;

// Update display
function updateDisplay() {
    const expressionElement = document.getElementById('expression');
    const resultElement = document.getElementById('result');
    
    if (expressionElement) {
        expressionElement.textContent = expression || '';
    }
    if (resultElement) {
        resultElement.textContent = lastResult;
    }
}

// Append value to expression
function appendValue(value) {
    if (value === 'π') {
        expression += 'Math.PI';
    } else if (value === 'e') {
        expression += 'Math.E';
    } else {
        expression += value;
    }
    updateDisplay();
}

// Append operator to expression
function appendOperator(operator) {
    if (expression === '' && lastResult !== '0') {
        expression = lastResult;
    }
    
    if (operator === '^') {
        expression += '**';
    } else {
        expression += operator;
    }
    updateDisplay();
}

// Append function to expression
function appendFunction(func) {
    if (func === 'sin(') {
        expression += 'Math.sin(';
    } else if (func === 'cos(') {
        expression += 'Math.cos(';
    } else if (func === 'tan(') {
        expression += 'Math.tan(';
    } else if (func === 'log(') {
        expression += 'Math.log10(';
    } else if (func === 'ln(') {
        expression += 'Math.log(';
    } else if (func === '√(') {
        expression += 'Math.sqrt(';
    }
    updateDisplay();
}

// Calculate factorial
function factorial() {
    if (expression === '' && lastResult !== '0') {
        expression = lastResult;
    }
    expression += '!';
    updateDisplay();
}

// Toggle sign
function toggleSign() {
    if (expression === '' && lastResult !== '0') {
        expression = '(-' + lastResult + ')';
    } else if (expression !== '') {
        expression = '(-(' + expression + '))';
    }
    updateDisplay();
}

// Scientific notation
function scientific() {
    if (lastResult !== '0' && lastResult !== 'Error') {
        const num = parseFloat(lastResult);
        lastResult = num.toExponential();
        updateDisplay();
    }
}

// Clear all
function clearAll() {
    expression = '';
    lastResult = '0';
    updateDisplay();
    clearHistory(); // Also clear the calculation history
}

// Delete last character
function deleteLast() {
    if (expression.endsWith('Math.PI')) {
        expression = expression.slice(0, -7);
    } else if (expression.endsWith('Math.E')) {
        expression = expression.slice(0, -6);
    } else if (expression.endsWith('Math.sin(') || expression.endsWith('Math.cos(') || expression.endsWith('Math.tan(')) {
        expression = expression.slice(0, -9);
    } else if (expression.endsWith('Math.log10(')) {
        expression = expression.slice(0, -11);
    } else if (expression.endsWith('Math.log(') || expression.endsWith('Math.sqrt(')) {
        expression = expression.slice(0, -10);
    } else {
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

// Calculate factorial helper
function calcFactorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Main calculate function
function calculate() {
    if (expression === '') return;
    
    try {
        // Create display expression for history
        let displayExpression = expression
            .replace(/Math\.PI/g, 'π')
            .replace(/Math\.E/g, 'e')
            .replace(/Math\.sin\(/g, 'sin(')
            .replace(/Math\.cos\(/g, 'cos(')
            .replace(/Math\.tan\(/g, 'tan(')
            .replace(/Math\.log10\(/g, 'log(')
            .replace(/Math\.log\(/g, 'ln(')
            .replace(/Math\.sqrt\(/g, '√(')
            .replace(/\*\*/g, '^')
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');
        
        // Handle factorial
        let evalExpression = expression;
        if (evalExpression.includes('!')) {
            evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => {
                return calcFactorial(parseInt(num));
            });
        }
        
        // Evaluate expression
        const result = Function('"use strict"; return (' + evalExpression + ')')();
        
        if (isNaN(result) || !isFinite(result)) {
            lastResult = 'Error';
        } else {
            lastResult = result.toString();
            
            // Save to history
            saveToHistory(displayExpression, lastResult);
        }
    } catch (error) {
        lastResult = 'Error';
    }
    
    expression = '';
    updateDisplay();
}

// ==================== History Functions ====================

// Toggle history panel
function toggleHistory() {
    const historyPanel = document.getElementById('historyPanel');
    historyVisible = !historyVisible;
    
    if (historyVisible) {
        historyPanel.classList.add('active');
        loadHistory();
    } else {
        historyPanel.classList.remove('active');
    }
}

// Save calculation to history
function saveToHistory(expression, result) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users[currentUser]) return;
    
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of history array
    users[currentUser].history.unshift(historyItem);
    
    // Keep only last 50 calculations
    if (users[currentUser].history.length > 50) {
        users[currentUser].history = users[currentUser].history.slice(0, 50);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update history display if visible
    if (historyVisible) {
        loadHistory();
    }
}

// Load user's history
function loadHistory() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    if (!users[currentUser] || users[currentUser].history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
        return;
    }
    
    let historyHTML = '';
    users[currentUser].history.forEach(item => {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleString();
        
        historyHTML += `
            <div class="history-item" onclick="useHistoryItem('${item.result}')">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
                <div class="history-timestamp">${timeString}</div>
            </div>
        `;
    });
    historyList.innerHTML = historyHTML;
}

// Use a history item result
function useHistoryItem(result) {
    expression = '';
    lastResult = result;
    updateDisplay();
    toggleHistory(); // Close history panel after using an item
}

// Clear all history for the current user
function clearHistory() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[currentUser]) {
        users[currentUser].history = [];
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Refresh the history panel display to show it's empty
    loadHistory();
}

// ==================== Event Listeners ====================

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Authentication forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Check authentication on pages that require it (e.g., calculator.html)
    if (window.location.pathname.includes('calculator.html')) {
        checkAuth();
        updateDisplay(); // Initialize calculator display
    }

    // Calculator buttons
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            const type = button.dataset.type;

            if (type === 'number' || type === 'constant') {
                appendValue(value);
            } else if (type === 'operator') {
                appendOperator(value);
            } else if (type === 'function') {
                appendFunction(value);
            } else if (type === 'action') {
                if (value === 'clear') {
                    clearAll();
                } else if (value === 'delete') {
                    deleteLast();
                } else if (value === 'equals') {
                    calculate();
                } else if (value === 'factorial') {
                    factorial();
                } else if (value === 'toggleSign') {
                    toggleSign();
                } else if (value === 'scientific') {
                    scientific();
                } else if (value === 'history') {
                    toggleHistory();
                } else if (value === 'logout') {
                    logout();
                }
            }
        });
    });

    // Keyboard support for calculator
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (window.location.pathname.includes('calculator.html')) {
            if (/[0-9\.]/.test(key)) {
                appendValue(key);
            } else if (/[+\-*/%]/.test(key)) {
                appendOperator(key);
            } else if (key === 'Enter') {
                calculate();
            } else if (key === 'Backspace') {
                deleteLast();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === '^') {
                appendOperator('^');
            }
        }
    });
});