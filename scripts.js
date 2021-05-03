const Modal = {
    toggle(){
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active');
    }
}

const Storage = {
    get(){
        return JSON.parse(
            localStorage.getItem("@devfinances:transactions")) || []
    },
    
    set(transactions){
        localStorage.setItem("@devfinances:transactions", 
        JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)
        App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },
    
    incomes(){
        // Somar as entradas        
        let sumIncomes = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0)
                sumIncomes+=transaction.amount
        })

        return sumIncomes;
    },
    
    expenses(){
        //Somar as saidas
        let sumExpenses = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0)
                sumExpenses+=transaction.amount;
        })
    
        return sumExpenses;
    },
    
    balance(){
        //Balanço entre entradas e saídas

        return Transaction.incomes() + Transaction.expenses()

    },

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index){
        //Adicionar uma transação
        const tr = document.createElement('tr');        
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index){
        const typeTransaction = transaction.amount < 0 ? 'expense' : 'income';
        
        const amount = Utils.formatCurrency(transaction.amount);
        
        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${typeTransaction}"> ${amount}</td>
        <td class="date">${transaction.date}</td> 
        <td class="remove-item">
            <a href="">
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
            </a>
        </td>
        `;

        return html;
    },    
    
    updateBalance(){
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.balance());
        
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    },
    
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        
        value = Number(value)/100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal+value;
    },

    formatAmount(value){
        value = Number(value) * 100;

        return value;
    },

    formatDate(value){
        const splittedDate = value.split("-")
        value = splittedDate.reverse().join("/")

        return value;
    },

    clearForm(){

    }


}

const Form = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues();
        
        if(description.trim() === "" 
            || amount.trim() === "" 
            || date.trim() === ""){
                throw new Error("Por favor preencha todos os campos")
            }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },  

    submit(event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.toggle();
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init(); 