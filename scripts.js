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
    },
    showError() {
        document
            .querySelector(".modal-error")
            .classList
            .add("active");
    },
    hideError() {
        setTimeout(() => {
            document
            .querySelector(".modal-error")
            .classList
            .remove("active");
        }
        ,3500)
    }
} 

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction);
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
    formatAmount(value, isEntrada) {
        value = value * 100;       
        value = Math.round(value);
        console.log(isEntrada);
        value = isEntrada ? value : value*-1;

        return value;
    },

    formatDate(value) {       
        const splitedDate = value.split("-");       
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
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
    check(signal){
        if (signal === "positive") {
            document.getElementById("positive").checked = true;
            document.getElementById("negative").checked = false;           
        } else {
            document.getElementById("negative").checked = true;
            document.getElementById("positive").checked = false;           
        }
    },
    
    containerTransaction: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index); 
        tr.dataset.index = index;
        
        DOM.containerTransaction.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"; //if reduzido

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `       
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="remove-transaction" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
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
    isEntrada: document.getElementById("positive"),  

    getValues() {
        return {
            description : Form.description.value,
            amount : Form.amount.value,
            date: Form.date.value,
            isEntrada: Form.isEntrada.checked
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
        let {description, amount, date, isEntrada} = Form.getValues();

        amount = Utils.formatAmount(amount, isEntrada);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        };
    },

    saveTransaction(transaction) {
        Transaction.add(transaction);
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues(); 

            Form.saveTransaction(transaction);
            Form.clearFields();

            Modal.close();
            
        } catch (error) {
            Modal.showError();
            Modal.hideError();
        }
    }
}

const App = {
    init() {       
        Transaction.all.forEach(DOM.addTransaction); //forEach vai percorrer cada elemento do array        

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        this.init();
    }
}

App.init();


