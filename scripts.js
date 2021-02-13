/* Objeto com duas funções, como se fossem properties. São chamadas métodos */
const Modal = { // esses objetos funcionan como as units com funcoes do delphi
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active");
    },
    close() {               
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active");
    }
} 

const Transaction = {
    all: [
        {       
            description: "Luz",
            amount: -50000,
            date: '23/01/2021'
        },
        {
            description: "WebSite",
            amount: 500000,
            date: '27/01/2021'        
        },
        {
            description: "Internet",
            amount: -20000,
            date: '10/02/2021'
        },
        {
            description: "Salário",
            amount: 180000,
            date: '10/02/2021'
        }
    ],

    add(transaction) {
        this.all.push(transaction);
        console.log(this.all);
        App.reload();
    },

    remove(index) {
        this.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        // Somar as Entradas
        let income = 0;

        this.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income;
    },

    expenses() {
        // Somar as saídas
        let expenses = 0;

        this.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expenses += transaction.amount;
            }
        })

        return expenses;
    },

    totals() {
        //Entradas - Saídas
        return Transaction.incomes() + Transaction.expenses();
    }
}

const Utils = {
    formatAmount(value) {

    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""; //Number() -> força o valor a ser numero

        value = String(value).replace(/\D/g, ""); //Tira os sinais. /coteudo/ expressão regular o \D pega so numero e o g significa na string toda. sem ele, substitui só o primeiro

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    }
}
// Trabalha-se muito com objetos e nele podem conter properties e metodos, separados por virgulas.
const DOM = {
    containerTransaction: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction); 
        
        DOM.containerTransaction.appendChild(tr);
    },
    innerHTMLTransaction(transaction) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"; //if reduzido

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `       
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="./assets/minus.svg" alt="Remover Transação">
            </td>`;

        return html;
    },
    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.totals());       
    },
    clearTransactions() {
        this.containerTransaction.innerHTML = ""    ;
    }
}

const Form = {
    description : document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date"),

    getValues() {
        return {
            description : Form.description.value,
            amount : Form.amount.value,
            date: Form.date.value 
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues(); // Extrai os campos em chaves do objeto

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);

    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            Form.formatValues*();
            
        } catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach( transaction => {
            DOM.addTransaction(transaction);
        }); //forEach vai percorrer cada elemento do array        

        DOM.updateBalance();
    },
    reload() {
        DOM.clearTransactions();
        this.init();
    }
}

App.init();


