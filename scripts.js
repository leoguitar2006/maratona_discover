/* Objeto com duas funções, como se fossem properties. São chamadas métodos */
const Modal = { // esses objetos funcionan como as units com funcoes do delphi
    open(idTransaction = "") {       
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active"); 
            
        if (idTransaction) {
            idTransaction = Number(idTransaction);
            const [transaction] = Transaction.all.filter(transaction => {
                return transaction.id === idTransaction;
            });
            Form.setValues(
                transaction.description,
                transaction.amount / 100,
                Utils.formatDateInverse(transaction.date),
                transaction.id,
                transaction.isEntrada,
                transaction.isSaida
            );
        }
    },
    close() {               
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active");
        Form.clearFields();
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
        const index = this.all.findIndex(item => {
            return item.id === transaction.id;
        });

        if (index > -1) {
            Transaction.all.splice(index, 1, transaction);
        } else {
            Transaction.all.push(transaction);
        };   
        App.reload();
    },

    remove(idTransaction) {
        const index = this.all.findIndex(transaction => {
            return transaction.id === idTransaction;
        });
      
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
        value = isEntrada ? value : value*-1;

        return value;
    },

    formatDate(value) {       
        const splitedDate = value.split("-");       
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    },

    formatDateInverse(value){
        const splitedDate = value.split("/");       
        return `${splitedDate[2]}-${splitedDate[1]}-${splitedDate[0]}`;
    },

    formatCurrency(value, tipoMoeda=true) {
        const signal = Number(value) < 0 ? "-" : ""; //Number() -> força o valor a ser numero

        value = String(value).replace(/\D/g, ""); //Tira os sinais. /coteudo/ expressão regular o \D pega so numero e o g significa na string toda. sem ele, substitui só o primeiro

        value = Number(value) / 100;

        if (tipoMoeda) {
            value = value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });    
        }        

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
                <img class="remove-transaction" onclick="Transaction.remove(${transaction.id})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
            <td>
                <img class="alter-transaction" onclick="Modal.open(${transaction.id})" src="./assets/edit.svg" alt="Alterar Transação">
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
    id: document.querySelector("input#id"),
    isEntrada: document.getElementById("positive"),
    isSaida: document.getElementById("negative"), 

    getValues() {
        return {
            id: Form.id.value,
            description : Form.description.value,
            amount : Form.amount.value,
            date: Form.date.value,
            isEntrada: Form.isEntrada.checked,
            isSaida: Form.isSaida.checked
        }
    },

    setValues(description, amount, date, id, isEntrada, isSaida) {
        Form.description.value = description;
        Form.amount.value = amount < 0 ? amount *-1 : amount;
        Form.date.value = date;
        Form.id.value = id;
        Form.isEntrada.checked = isEntrada,
        Form.isSaida.checked = isSaida;
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
        let {id, description, amount, date, isEntrada, isSaida} = Form.getValues();

        if (id) {
            id = Number(id);
        } else {
            id = Number(new Date().getTime());
        }

        amount = Utils.formatAmount(amount, isEntrada);

        date = Utils.formatDate(date);

        return {
            id,
            description,
            amount,
            date,
            isEntrada,
            isSaida
        };
    },

    saveTransaction(transaction) {
        Transaction.add(transaction);
    },

    clearFields() {
        Form.setValues("", "", new Date().toISOString().substr(0, 10), "",true,false);
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues(); 

            Transaction.add(transaction);
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


