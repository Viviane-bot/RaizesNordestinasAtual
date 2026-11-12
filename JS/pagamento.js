
document.addEventListener("DOMContentLoaded", () => {
    const CHAVE_PEDIDOS = "raizesPedidosDemo";

    const parametros = new URLSearchParams(window.location.search);
    const pedidoId = parametros.get("pedido");

    const resumo = document.querySelector("#resumo-pagamento");
    const formulario = document.querySelector("#form-pagamento");
    const retorno = document.querySelector("#retorno-pagamento");

    function lerPedidos() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_PEDIDOS) || "[]"
            );
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    }

    function formatarValor(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    const pedidos = lerPedidos();
    const pedido = pedidos.find(item => item.id === pedidoId);

    if (!pedido) {
        resumo.textContent =
            "Pedido não encontrado. Volte para Meus Pedidos.";
        return;
    }

    const titulo = document.createElement("h2");
    titulo.textContent = "Pedido " + pedido.id;

    // Exibe todos os itens do pedido em um único resumo de pagamento.
    const listaItens = document.createElement("ul");
    listaItens.className = "pagamento-itens";
    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
    itens.forEach(item => {
        const linha = document.createElement("li");
        const quantidade = Number(item.quantity) || 0;
        const preco = Number(item.price) || 0;
        const nome = document.createElement("span");
        nome.textContent = `${quantidade}x ${item.name || "Produto"}`;
        const valorItem = document.createElement("strong");
        valorItem.textContent = formatarValor(quantidade * preco);
        linha.append(nome, valorItem);
        listaItens.appendChild(linha);
    });

    const subtotalCalculado = itens.reduce(
        (soma, item) => soma + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0
    );
    const subtotal = Number.isFinite(Number(pedido.subtotal))
        ? Number(pedido.subtotal) : subtotalCalculado;
    const desconto = Number(pedido.desconto) || 0;
    const totalPedido = Number(pedido.total) || 0;

    const resumoValores = document.createElement("div");
    resumoValores.className = "pagamento-valores";
    const subtotalLinha = document.createElement("p");
    subtotalLinha.textContent = "Subtotal: " + formatarValor(subtotal);
    resumoValores.appendChild(subtotalLinha);
    if (desconto > 0) {
        const descontoLinha = document.createElement("p");
        descontoLinha.textContent = "Desconto" + (pedido.cupom ? ` (${pedido.cupom})` : "") +
            ": -" + formatarValor(desconto);
        resumoValores.appendChild(descontoLinha);
    }
    const valor = document.createElement("p");
    valor.className = "pagamento-total";
    valor.textContent = "Total a pagar: " + formatarValor(totalPedido);
    resumoValores.appendChild(valor);

    const estado = document.createElement("p");
    estado.textContent =
        "Pagamento atual: " +
        (pedido.pagamento?.status || "Não iniciado");

    resumo.append(titulo, listaItens, resumoValores, estado);
    formulario.hidden = false;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const metodo = document.querySelector("#metodo").value;
        const resultado = document.querySelector("#resultado").value;

        if (!metodo || !resultado) return;

        const todos = lerPedidos();
        const indice = todos.findIndex(
            item => item.id === pedidoId
        );

        if (indice === -1) {
            retorno.textContent = "Pedido não encontrado.";
            return;
        }

        // Simula o envio e a resposta de um provedor externo.
        todos[indice].pagamento = {
            metodo: metodo,
            status: resultado,
            data: new Date().toISOString(),
            provedor: "Gateway demonstrativo"
        };

        localStorage.setItem(
            CHAVE_PEDIDOS,
            JSON.stringify(todos)
        );

        const mensagens = {
            Aprovado: "Pagamento aprovado com sucesso!",
            Pendente: "Pagamento pendente de confirmação.",
            Recusado: "Pagamento recusado. Tente novamente."
        };

        retorno.replaceChildren();

        const mensagem = document.createElement("p");
        mensagem.className =
            "resultado-pagamento " + resultado.toLowerCase();
        mensagem.textContent = mensagens[resultado];

        const detalhes = document.createElement("p");
        detalhes.textContent =
            "Forma de pagamento: " + metodo;

        const voltar = document.createElement("a");
        voltar.href = "meus-pedidos.html";
        voltar.className = "button button-primary";
        voltar.textContent = "Ver meus pedidos";

        retorno.append(mensagem, detalhes, voltar);

        estado.textContent = "Pagamento atual: " + resultado;
        formulario.hidden = true;
    });
});