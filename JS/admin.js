
document.addEventListener("DOMContentLoaded", () => {
    const CHAVE_PEDIDOS = "raizesPedidosDemo";

    const lista = document.querySelector("#admin-lista-pedidos");
    const filtro = document.querySelector("#filtro-status");

    const etapas = [
        "Recebido",
        "Em preparo",
        "Pronto",
        "Entregue"
    ];

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

    function salvarPedidos(pedidos) {
        localStorage.setItem(
            CHAVE_PEDIDOS,
            JSON.stringify(pedidos)
        );
    }

    function moeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function criarTexto(tag, conteudo) {
        const elemento = document.createElement(tag);
        elemento.textContent = conteudo;
        return elemento;
    }

    function atualizarResumo(pedidos) {
        document.querySelector("#total-pedidos").textContent =
            pedidos.length;

        document.querySelector("#pedidos-preparo").textContent =
            pedidos.filter(p => p.status === "Em preparo").length;

        document.querySelector("#pedidos-entregues").textContent =
            pedidos.filter(p => p.status === "Entregue").length;

        document.querySelector("#pagamentos-aprovados").textContent =
            pedidos.filter(
                p => p.pagamento?.status === "Aprovado"
            ).length;
    }

    function atualizarStatus(id, novoStatus) {
        const pedidos = lerPedidos();
        const pedido = pedidos.find(p => p.id === id);

        if (!pedido || !etapas.includes(novoStatus)) {
            return;
        }

        pedido.status = novoStatus;
        salvarPedidos(pedidos);

        renderizar();
    }

    function criarCard(pedido) {
        const card = document.createElement("article");
        card.className = "admin-pedido";

        const titulo = criarTexto(
            "h3",
            "Pedido " + pedido.id
        );

        const cliente = criarTexto(
            "p",
            "Cliente: " + (pedido.cliente || "Não informado")
        );

        const produtos = criarTexto(
            "p",
            "Produtos: " + (pedido.itens || [])
                .map(item => `${item.quantity}x ${item.name}`)
                .join(", ")
        );

        const total = criarTexto(
            "p",
            "Total: " + moeda(pedido.total)
        );

        const pagamento = criarTexto(
            "p",
            "Pagamento: " +
            (pedido.pagamento?.status || "Não iniciado")
        );

        const status = criarTexto(
            "p",
            "Status atual: " + pedido.status
        );

        const label = criarTexto("label", "Alterar status");
        const select = document.createElement("select");

        const selectId = "status-" + pedido.id;
        select.id = selectId;
        label.htmlFor = selectId;

        etapas.forEach(etapa => {
            const opcao = document.createElement("option");
            opcao.value = etapa;
            opcao.textContent = etapa;
            select.appendChild(opcao);
        });

        select.value = etapas.includes(pedido.status)
            ? pedido.status
            : "Recebido";

        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = "Salvar status";

        botao.addEventListener("click", () => {
            atualizarStatus(pedido.id, select.value);
        });

        card.append(
            titulo,
            cliente,
            produtos,
            total,
            pagamento,
            status,
            label,
            select,
            botao
        );

        return card;
    }

    function renderizar() {
        const pedidos = lerPedidos();
        atualizarResumo(pedidos);

        lista.replaceChildren();

        const selecionado = filtro.value;

        const filtrados = pedidos.filter(pedido =>
            selecionado === "Todos" ||
            pedido.status === selecionado
        );

        if (filtrados.length === 0) {
            lista.appendChild(
                criarTexto(
                    "p",
                    "Nenhum pedido encontrado para este filtro."
                )
            );
            return;
        }

        filtrados.slice().reverse().forEach(pedido => {
            lista.appendChild(criarCard(pedido));
        });
    }

    filtro.addEventListener("change", renderizar);

    renderizar();
});
