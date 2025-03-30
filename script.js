// Debugging logs for dropdown population
async function populateTransactionCurrencyDropdown() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) {
            console.error('Failed to fetch currency data:', response.statusText);
            return;
        }
        const data = await response.json();
        console.log('Currency data fetched successfully:', data);

        const transactionCurrencyDropdown = document.getElementById('transaction-currency');
        transactionCurrencyDropdown.innerHTML = '<option value="" disabled selected hidden>Select Currency</option>'; // Add placeholder
        Object.keys(data.rates).forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            transactionCurrencyDropdown.appendChild(option);
        });

        const preferredCurrencyDropdown = document.getElementById('preferred-currency');
        if (preferredCurrencyDropdown) {
            preferredCurrencyDropdown.innerHTML = '<option value="" disabled selected hidden>Select Currency</option>'; // Add placeholder
            Object.keys(data.rates).forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                preferredCurrencyDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching currency data:', error);
    }
}

populateTransactionCurrencyDropdown();

// Add functionality to dynamically add new categories
const addCategoryForm = document.getElementById('add-category-form');
const categoryDropdown = document.getElementById('category');
const categoryStatus = document.getElementById('category-status');

addCategoryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newCategory = document.getElementById('new-category').value.trim();

    if (newCategory) {
        const option = document.createElement('option');
        option.value = newCategory.toLowerCase();
        option.textContent = newCategory;
        categoryDropdown.appendChild(option);

        categoryStatus.textContent = `Category '${newCategory}' added successfully!`;
        categoryStatus.style.color = 'green';
        document.getElementById('new-category').value = '';
    } else {
        categoryStatus.textContent = 'Please enter a valid category.';
        categoryStatus.style.color = 'red';
    }
});

// Calculate statistics
function calculateStatistics() {
    const tableBody = document.querySelector('#transactions-table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const amounts = rows.map(row => {
        const amount = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace(/[^0-9.-]+/g, ''));
        return amount;
    });

    if (amounts.length === 0) return;

    const mean = (amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2);
    const max = Math.max(...amounts).toFixed(2);
    const min = Math.min(...amounts).toFixed(2);
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length).toFixed(2);

    document.getElementById('mean').textContent = `$${mean}`;
    document.getElementById('max').textContent = `$${max}`;
    document.getElementById('min').textContent = `$${min}`;
    document.getElementById('std-dev').textContent = `$${stdDev}`;
}

// Update statistics after each transaction
function updateStatistics() {
    calculateStatistics();
}

// Simulate OpenAI API functionality
async function generateFinancialTip() {
    const tableBody = document.querySelector('#transactions-table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const transactionData = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
            date: cells[0].textContent,
            description: cells[1].textContent,
            type: cells[2].textContent,
            amount: parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, '')),
            currency: cells[4].textContent,
            category: cells[5].textContent
        };
    });

    if (transactionData.length === 0) {
        document.getElementById('ai-tips').textContent = 'Add some transactions to get personalized financial advice!';
        return;
    }

    // API Key is replaced with a placeholder
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key during runtime

    try {
        // Analyze transaction data to provide sound advice
        const totalIncome = transactionData
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactionData
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const mostSpentCategory = transactionData
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const highestCategory = Object.keys(mostSpentCategory).reduce((a, b) => mostSpentCategory[a] > mostSpentCategory[b] ? a : b, '');

        let advice = '';

        if (totalExpenses > totalIncome) {
            advice += `Your expenses exceed your income. Consider reducing spending in the ${highestCategory} category.`;
        } else {
            advice += `You are maintaining a balanced budget. Keep up the good work!`;
        }

        if (highestCategory) {
            advice += ` You are spending the most in the ${highestCategory} category.`;
        }

        document.getElementById('ai-tips').textContent = advice;
    } catch (error) {
        console.error('Error generating financial tip:', error);
        document.getElementById('ai-tips').textContent = 'An error occurred while generating financial advice. Please try again later.';
    }
}

// Setup cookie functionality
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function checkUserSession() {
    const user = getCookie('user');
    if (user) {
        console.log(`Welcome back, ${user}!`);
    } else {
        console.log('No user session found.');
    }
}

checkUserSession();

// Handle user account creation
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            // Store user data in localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);

            document.getElementById('signup-status').textContent = 'Account created successfully!';
            document.getElementById('signup-status').style.color = 'green';

            // Clear the form
            signupForm.reset();
        } else {
            document.getElementById('signup-status').textContent = 'Please fill in all fields.';
            document.getElementById('signup-status').style.color = 'red';
        }
    });
}

// Add edit functionality for transactions
function addEditButton(row) {
    const editCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        const cells = row.querySelectorAll('td');
        const date = cells[0].textContent;
        const description = cells[1].textContent;
        const type = cells[2].textContent;
        const amount = parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, ''));
        const currency = cells[4].textContent;
        const category = cells[5].textContent;

        // Populate form with existing data
        document.getElementById('date').value = date;
        document.getElementById('description').value = description;
        document.getElementById('type').value = type;
        document.getElementById('amount').value = amount;
        document.getElementById('transaction-currency').value = currency;
        document.getElementById('category').value = category;

        // Remove the row being edited
        row.remove();
        updateSummary(type === 'income' ? 'expense' : 'income', -amount);
    });
    editCell.appendChild(editButton);
    row.appendChild(editCell);
}

// Update transaction table to include converted amounts
function updateTransactionAmounts() {
    const tableBody = document.querySelector('#transactions-table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    rows.forEach(row => {
        const amountCell = row.querySelector('td:nth-child(4)');
        const currencyCell = row.querySelector('td:nth-child(5)');
        const convertedAmountCell = row.querySelector('td:nth-child(6)');

        const originalAmount = parseFloat(amountCell.getAttribute('data-original-amount')) || parseFloat(amountCell.textContent.replace(/[^0-9.-]+/g, ''));
        const currency = currencyCell.textContent;

        fetch(`https://open.er-api.com/v6/latest/${currency}`)
            .then(response => response.json())
            .then(data => {
                const preferredCurrency = document.getElementById('preferred-currency').value;
                const rate = data.rates[preferredCurrency];
                const convertedAmount = (originalAmount * rate).toFixed(2);
                convertedAmountCell.textContent = `${convertedAmount} ${preferredCurrency}`;
            })
            .catch(error => console.error('Error fetching conversion rate:', error));
    });
}

// Call updateTransactionAmounts whenever a new transaction is added
document.getElementById('finance-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const currency = document.getElementById('transaction-currency').value;
    const category = document.getElementById('category').value;

    const tableBody = document.querySelector('#transactions-table tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${date}</td>
        <td>${description}</td>
        <td>${type}</td>
        <td data-original-amount="${amount}">${amount.toFixed(2)}</td>
        <td>${currency}</td>
        <td></td>
        <td>${category}</td>
        <td>
            <button class="delete-button">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);

    updateTransactionAmounts();
    document.getElementById('finance-form').reset();

    generateFinancialTip();
});
