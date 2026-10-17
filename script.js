
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let justCalculated = false;

function clearDisplay() {
    display.value = "0";
    justCalculated = false;
}

function addValue(value) {
    if (display.value === "Error") {
        clearDisplay();
    }

    if (justCalculated) {
        if ("+-*/".includes(value)) {
            justCalculated = false;
        } else {
            display.value = "0";
            justCalculated = false;
        }
    }

    let current = display.value;

    if ("+-*/".includes(value)) {
        if (current === "0" && value !== "-") return;

        if (/[+\-*/]$/.test(current)) {
            display.value = current.slice(0, -1) + value;
        } else {
            display.value += value;
        }

        return;
    }

    if (value === ".") {
        const lastNumber = current.split(/[+\-*/]/).pop();

        if (lastNumber.includes(".")) return;

        if (/[+\-*/]$/.test(current)) {
            display.value += "0.";
        } else {
            display.value += ".";
        }

        return;
    }

    if (current === "0") {
        display.value = value;
    } else if (/[+\-*/]$/.test(current)) {
        display.value += value;
    } else {
        display.value += value;
    }
}

function backspace() {
    if (display.value === "Error" || justCalculated) {
        clearDisplay();
        return;
    }

    display.value = display.value.slice(0, -1) || "0";
}

function toggleSign() {
    if (display.value === "Error") return;

    if (justCalculated) {
        justCalculated = false;
    }

    const expression = display.value;
    const match = expression.match(/(\d*\.?\d+|\d+\.)$/);

    if (!match) {
        if (expression === "0") {
            display.value = "-0";
        }
        return;
    }

    const number = match[0];
    const start = expression.length - number.length;
    const before = expression.slice(0, start);

    if (before.endsWith("-") &&
        (before.length === 1 ||
         "+-*/".includes(before[before.length - 2]))) {
        display.value = before.slice(0, -1) + number;
    } else {
        display.value = before + "-" + number;
    }
}

// Safely calculate an expression without eval()
function calculateExpression(expression) {
    const input = expression.replace(/\s/g, "");
    let position = 0;

    function parseNumber() {
        const remaining = input.slice(position);
        const match = remaining.match(/^(?:\d+\.?\d*|\.\d+)/);

        if (!match) {
            throw new Error("Invalid number");
        }

        position += match[0].length;
        return Number(match[0]);
    }

    function parseFactor() {
        if (input[position] === "+") {
            position++;
            return parseFactor();
        }

        if (input[position] === "-") {
            position++;
            return -parseFactor();
        }

        return parseNumber();
    }

    function parseTerm() {
        let result = parseFactor();

        while (input[position] === "*" ||
               input[position] === "/") {
            const operator = input[position++];
            const next = parseFactor();

            if (operator === "*") {
                result *= next;
            } else {
                if (next === 0) {
                    throw new Error("Cannot divide by zero");
                }
                result /= next;
            }
        }

        return result;
    }

    function parseExpression() {
        let result = parseTerm();

        while (input[position] === "+" ||
               input[position] === "-") {
            const operator = input[position++];
            const next = parseTerm();

            if (operator === "+") {
                result += next;
            } else {
                result -= next;
            }
        }

        return result;
    }

    if (!input) throw new Error("Empty expression");

    const result = parseExpression();

    if (position !== input.length || !Number.isFinite(result)) {
        throw new Error("Invalid expression");
    }

    return Number(result.toPrecision(12));
}

function calculate() {
    if (display.value === "Error") return;

    try {
        const result = calculateExpression(display.value);
        display.value = String(result);
        justCalculated = true;
    } catch (error) {
        display.value = "Error";
        justCalculated = true;
    }
}

// Button click events
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearDisplay();
        } else if (action === "backspace") {
            backspace();
        } else if (action === "calculate") {
            calculate();
        } else if (action === "sign") {
            toggleSign();
        } else if (value !== undefined) {
            addValue(value);
        }
    });
});

// Keyboard events
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Escape") {
        clearDisplay();
    } else if (key === "Backspace") {
        backspace();
    }
});
