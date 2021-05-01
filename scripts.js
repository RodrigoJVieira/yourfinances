const Modal = {
    open(){
        //Abrir modal
        //Adicionar a class active ao modal
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close(){
        //Fechar modal
        //Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')        
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set (transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        // pegar todas as transações e pra cada transação
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if( transaction.amount > 0) {
            // somar a uma variavel e retornar a variavel 
                income += transaction.amount
            }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        // pegar todas as transações e pra cada transação
        Transaction.all.forEach(transaction => {
            //se ela for menor que zero
            if( transaction.amount < 0) {
                // somar a uma variavel e retornar a variavel 
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}
        

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
            `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransections() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) <0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }        

    },
    //verificar se todos os dados foram preenchidos
    validateFields(){
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos.")
        }
    },

    formatValues(){
        let {description, amount, date } =Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

     submit(event) {
         event.preventDefault()

         try {
             Form.validateFields()
             //formatar os dados pra salvar
             const transaction = Form.formatValues()
             //salvar
             Transaction.add(transaction)
             //apagar dados do formulario
             Form.clearFields()
             //fechar o modal
             Modal.close()
             //atualizar a aplicação já tem app reload no add
         } catch (error) {
             alert(error.message)
         }

     }

}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
    
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransections()
        App.init()
    },
}

App.init()