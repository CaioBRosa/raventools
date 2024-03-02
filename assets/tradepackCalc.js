const distancias = [
    [0, 586, 814, 1528, 517, 535, 1135, 881, 414, 361],
    [586, 0, 437, 943, 626, 811, 979, 508, 233, 946],
    [814, 437, 0, 713, 298, 888, 541, 945, 402, 1175],
    [1528, 943, 713, 0, 1011, 1600, 699, 787, 1115, 1888],
    [517, 626, 298, 1011, 0, 589, 617, 1133, 392, 877],
    [535, 811, 888, 1600, 589, 0, 1207, 1318, 577, 485],
    [1135, 979, 541, 699, 617, 1207, 0, 1486, 745, 1494],
    [881, 508, 945, 787, 1133, 1318, 1486, 0, 741, 1242],
    [414, 233, 402, 1115, 392, 577, 745, 741, 0, 774],
    [361, 946, 1175, 1888, 877, 485, 1494, 1242, 774, 0],
  ];
  
  const jsonUrl = "data/tradepacks.json";
  
  // Função para consumir o JSON
  async function fetchJson() {
    try {
      const response = await fetch(jsonUrl);
  
      if (!response.ok) {
        throw new Error(`Erro de resposta do servidor: ${response.status}`);
      }
  
      const tradepacks = await response.json()
      updateTable(tradepacks);
      populateSelect(tradepacks);
    } catch (error) {
      console.error("Erro ao carregar o JSON:", error.message)
    }
  }
  
  function populateSelect(tradepacks) {
    var select = document.getElementById("tradepackSelect");
    let tradepacksJson = tradepacks;
  
    for (var key in tradepacksJson) {
      if (tradepacksJson.hasOwnProperty(key)) {
        var option = document.createElement("option");
        option.value = key;
        option.text = tradepacksJson[key].nome;
        select.appendChild(option)
      }
    }
  
    updateTable(tradepacks);
  }
  
  function updateTable(tradepacks) {
    clearResultTableFields();
    const table = document.getElementById("ingredientTable");
    const select = document.getElementById("tradepackSelect");
  
    if (!select) {
      console.error("Select element not found.")
      return;
    }
  
    const selectedTradepack = select.value
  
    // Limpar a tabela
    table.innerHTML = "<tr><th>Ingredientes</th><th>Quantidade</th><th>Preço Unitário</th><th>Custo Total Un.</th></tr>"
  
    // Verificar se o tradepack selecionado existe
    if (tradepacks[selectedTradepack]) {
      createTable(tradepacks[selectedTradepack])
    } else {
      console.error(`Tradepack "${tradepacks[selectedTradepack]}" not found.`)
    }
  
    if (select) {
      select.onchange = function () {
        updateTable(tradepacks)
      };
    }
  }
  
  function createTable(tradepack) {
    const table = document.getElementById("ingredientTable")
  
    // Verificar se tradepack é um objeto válido
    if (!tradepack || typeof tradepack !== "object") {
      console.error("Invalid tradepack object.")
      return
    }
  
    // Verificar se as propriedades esperadas existem no objeto tradepack
    if (!tradepack.ingredientes || !tradepack.quantidades) {
      console.error(
        "Missing 'ingredientes' or 'quantidades' properties in tradepack."
      )
      return
    }
    const rows = tradepack.ingredientes.map((ingredient, index) => {
      return `
        <tr>
          <td>${ingredient}</td>
          <td>${tradepack.quantidades[index]}</td>
          <td>
            <input class="preco-unidade" type="number" onchange="updateCost(this, '${tradepack.quantidades[index]}')">
          </td>
          <td></td>
        </tr>
      `
    })
  
    table.innerHTML += rows.join("")
  }
  
  function updateCost(input, quantidade) {
    const precoUnidade = parseFloat(input.value)
  
    // Validar o valor do preço unitário
    if (isNaN(precoUnidade)) {
      console.error("Invalid input for preço unidade.")
      return
    }
  
    const custoTotalUnidade = quantidade * precoUnidade
  
    // Atualizar o valor na célula correspondente
    const row = input.closest("tr")
    row.querySelector("td:last-child").innerText = custoTotalUnidade
  
    // Calcular o custo total de produção
    let custoProducaoTotal = 0;
    const precoInputs = document.querySelectorAll(".preco-unidade")
    precoInputs.forEach((precoInput) => {
      const preco = parseFloat(precoInput.value)
      const quantidade = parseFloat(
        precoInput.closest("tr").querySelector("td:nth-child(2)").textContent
      )
      if (!isNaN(preco)) {
        custoProducaoTotal += preco * quantidade
      }
    })
  
    // Atualizar o custo total de produção na página
    document.getElementById("totalCost").innerText = custoProducaoTotal
  
    distanceCalc("startLocation", "sellLocation")
  }
  
  function generateDropdown(id) {
    var locations = [
      "Riverend",
      "Margrove",
      "Orca Bay",
      "Seabreeze",
      "Tarmire",
      "Darzuac",
      "Gilead",
      "Glaceforde",
      "Ravencrest",
      "Defiance",
    ]
  
    var dropdown = document.createElement("select")
    dropdown.id = id
    dropdown.name = id
  
    locations.forEach(function (value, key) {
      var option = document.createElement("option")
      option.value = key
      option.text = value
      dropdown.appendChild(option)
    });
  
    var targetCell = document.getElementById(id + "Cell")
    targetCell.appendChild(dropdown)
  
    // Adicione um ouvinte de evento 'change' ao elemento select
    dropdown.addEventListener("change", function () {
      distanceCalc("startLocation", "sellLocation")
    })
  }
  
  const percentInputElement = document.getElementById("percentInput")
  
  percentInputElement.addEventListener("input", function () {
    distanceCalc("startLocation", "sellLocation");
  })
  
  function distanceCalc(startLocation, sellLocation) {
  
    const start = document.getElementById(startLocation).value
    const sell = document.getElementById(sellLocation).value
    const percentInputValue = parseFloat(percentInputElement.value / 100) || 0
    const custoProducaoTotal = document.getElementById("totalCost").innerText
  
    let silverPerTile = 6
    let baseValueTradepack = 10000
  
    // Validate selected locations
    if (start < 0 || start >= distancias.length ||
      sell < 0 || sell >= distancias.length) {
      console.error("Invalid start or sell location. Please choose from the available options.")
    } else {
        // Access distance directly using values as indexes
        const distanciaEmTiles = distancias[start][sell]
        let tradepackValue = ((baseValueTradepack + (silverPerTile * distanciaEmTiles)) * percentInputValue)
        let profit = (tradepackValue - custoProducaoTotal)
        let formattedProfit = profit.toFixed(2)
        let formattedTrackpackValue = tradepackValue.toFixed(2)
        document.getElementById("venda").innerHTML = formattedTrackpackValue
        document.getElementById("profit").innerHTML = formattedProfit
    }
  
  }
  
  generateDropdown("startLocation");
  generateDropdown("sellLocation");
  
  function clearResultTableFields() {
    const startLocationSelect = document.getElementById("startLocation");
    const sellLocationSelect = document.getElementById("sellLocation");
    const totalCostCell = document.getElementById("totalCost");
    const percentInput = document.getElementById("percentInput");
    const vendaCell = document.getElementById("venda");
    const profitCell = document.getElementById("profit");
  
    // Verificar se os elementos são válidos antes de atualizar
    if (totalCostCell && startLocationCell && sellLocationCell && percentInput && vendaCell && profitCell) {
      startLocationSelect.selectedIndex = 0;
      sellLocationSelect.selectedIndex = 0;
      totalCostCell.innerText = "0.00";
      percentInput.value = "";
      vendaCell.innerText = "0.00";
      profitCell.innerText = "0.00";
    } else {
      console.error("Invalid element(s) for resultTable fields.");
    }
  }
  
  // Chama a função para consumir o JSON ao carregar a página
  window.onload = fetchJson;