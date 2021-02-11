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
    incomes() {
        // Somar as Entradas
    },

    expenses() {
        // Somar as saídas
    },

    totals() {
        //Entradas - Saídas
    }
}

const Utils = {
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
        
    }
}

const transactions = [
    {
        id: 1,
        description: "Luz",
        amount: -50000,
        date: '23/01/2021'
    },
    {
        id: 2,
        description: "WebSite",
        amount: 500000,
        date: '27/01/2021'        
    },
    {
        id: 3,
        description: "Internet",
        amount: -20000,
        date: '10/02/2021'
    }
]

transactions.forEach( function(transaction) {
    DOM.addTransaction(transaction);
}) //forEach vai percorrer cada elemento do array