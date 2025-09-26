document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('transaction-form');
    const tableBody = document.getElementById('transaction-table-body');
    
    const monthlyRevenueEl = document.getElementById('monthly-revenue');
    const monthlyExpensesEl = document.getElementById('monthly-expenses');
    const monthlyProfitEl = document.getElementById('monthly-profit');
    const annualRevenueEl = document.getElementById('annual-revenue');
    const annualAvgExpensesEl = document.getElementById('annual-avg-expenses'); 

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const parseCurrency = (valueString) => {
        if (!valueString) return 0;
        const stringWithoutDots = valueString.replace(/\./g, '');
        const stringWithDot = stringWithoutDots.replace(',', '.');
        return parseFloat(stringWithDot);
    };

    const renderTransaction = (transaction) => {
        const tr = document.createElement('tr');
        const amountClass = transaction.type === 'revenue' ? 'cell-revenue' : 'cell-expense';
        tr.innerHTML = `
            <td>${transaction.description}</td>
            <td class="${amountClass}">${formatCurrency(transaction.amount)}</td>
            <td>${new Date(transaction.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
            <td>${transaction.type === 'revenue' ? 'Receita' : 'Despesa'}</td>
            <td><button class="delete-btn" data-id="${transaction.id}">Excluir</button></td>
        `;
        tableBody.appendChild(tr);
    };

    const updateSummary = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        });

        const annualTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() === currentYear;
        });

        const monthlyRevenue = monthlyTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const monthlyProfit = monthlyRevenue - monthlyExpenses;

        const annualRevenue = annualTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        
        const annualExpensesTransactions = annualTransactions.filter(t => t.type === 'expense');
        const annualTotalExpenses = annualExpensesTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        const monthsWithExpenses = new Set(
            annualExpensesTransactions.map(t => new Date(t.date).getMonth())
        );
        const numberOfMonthsWithExpenses = monthsWithExpenses.size;

        const annualAvgExpenses = numberOfMonthsWithExpenses > 0 ? annualTotalExpenses / numberOfMonthsWithExpenses : 0;

        monthlyRevenueEl.textContent = formatCurrency(monthlyRevenue);
        monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses);
        annualRevenueEl.textContent = formatCurrency(annualRevenue);
        monthlyProfitEl.textContent = formatCurrency(monthlyProfit);
        annualAvgExpensesEl.textContent = formatCurrency(annualAvgExpenses); // ATUALIZA O NOVO ELEMENTO

        monthlyProfitEl.classList.remove('negative');
        if (monthlyProfit < 0) {
            monthlyProfitEl.classList.add('negative');
        }
    };
    
    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    const addTransaction = (e) => {
        e.preventDefault(); 
        const description = document.getElementById('description').value;
        const amountString = document.getElementById('amount').value;
        const amount = parseCurrency(amountString); 
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        if (description.trim() === '' || isNaN(amount) || amount <= 0 || date === '') {
            alert('Por favor, preencha todos os campos corretamente. O valor deve ser um número válido e maior que zero.');
            return;
        }
        const transaction = { id: Date.now(), description, amount, date, type };
        transactions.push(transaction);
        saveTransactions();
        renderTransaction(transaction);
        updateSummary();
        form.reset();
    };
    
    const deleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        init();
    };

    const init = () => {
        tableBody.innerHTML = ''; 
        transactions.forEach(renderTransaction); 
        updateSummary(); 
    };
    
    form.addEventListener('submit', addTransaction);
    
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            if(confirm('Tem certeza que deseja excluir este lançamento?')) {
                deleteTransaction(id);
            }
        }
    });

    init();

});
