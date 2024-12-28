document.getElementById("payment-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const cpf = document.getElementById("cpf");
    const cardNumber = document.getElementById("card-number");
    const expiryDate = document.getElementById("expiry-date");
    const cvv = document.getElementById("cvv");
    const payButton = document.getElementById("pay-button");
  
    // Exibe spinner e desabilita botão
    toggleSpinner(payButton, true);
  
    // Validações
    setTimeout(() => {
      let isValid = true;
  
      // Valida nome
      if (!name.value.trim()) {
        setFeedback(name, false, "Por favor, preencha seu nome.");
        isValid = false;
      } else {
        setFeedback(name, true);
      }
  
      // Valida e-mail
      if (!validateEmail(email.value)) {
        setFeedback(email, false, "Por favor, insira um e-mail válido.");
        isValid = false;
      } else {
        setFeedback(email, true);
      }
  
      // Valida CPF
      if (!validateCPF(cpf.value)) {
        setFeedback(cpf, false, "CPF inválido.");
        isValid = false;
      } else {
        setFeedback(cpf, true);
      }
  
      // Valida número do cartão
      if (!validateCardNumber(cardNumber.value)) {
        setFeedback(cardNumber, false, "Número do cartão inválido.");
        isValid = false;
      } else {
        setFeedback(cardNumber, true);
      }
  
      // Valida data de validade
      if (!validateExpiryDate(expiryDate.value)) {
        setFeedback(expiryDate, false, "Data de validade inválida ou vencida.");
        isValid = false;
      } else {
        setFeedback(expiryDate, true);
      }
  
      // Valida CVV
      if (cvv.value.length !== 3 || !/^\d{3}$/.test(cvv.value)) {
        setFeedback(cvv, false, "CVV inválido.");
        isValid = false;
      } else {
        setFeedback(cvv, true);
      }
  
      toggleSpinner(payButton, false); // Remove o spinner após validação
  
      if (isValid) {
        sendPaymentData({
          name: name.value,
          email: email.value,
          cpf: cpf.value,
          cardNumber: cardNumber.value,
          expiryDate: expiryDate.value,
          cvv: cvv.value,
          installments: document.getElementById("installments").value,
        });
      } else {
        displayStatus("Por favor, corrija os campos destacados.", "error");
      }
    }, 3000); // Espera 3 segundos antes de realizar as validações
  });
  
  // Envia os dados para o backend
  function sendPaymentData(data) {
    fetch("http://localhost:3000/send-email", {
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
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona o primeiro ponto
      .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona o segundo ponto
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Adiciona o traço
  }
  
  // Máscara para número do cartão de crédito (0000 0000 0000 0000)
  function maskCardNumber(value) {
    return value
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .substring(0, 16) // Limita a 16 números
      .replace(/(\d{4})(?=\d)/g, "$1 ") // Adiciona espaços a cada 4 dígitos
      .trim(); // Remove espaços extras no final
  }
  
  // Máscara para data de validade (MM/AA)
  function maskExpiryDate(value) {
    return value
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .substring(0, 4) // Limita a 4 números antes de aplicar a barra
      .replace(/(\d{2})(\d)/, "$1/$2"); // Adiciona a barra após o mês
  }
  
  // Máscara para CVV (123)
  function maskCVV(value) {
    return value
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .substring(0, 3); // Limita a entrada a 3 dígitos
  }
  
  // Valida CPF
  function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
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
    const digits = cardNumber.replace(/\D/g, ""); // Remove espaços e caracteres não numéricos
    if (digits.length !== 16) return false; // Verifica se tem exatamente 16 dígitos
  
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
    const currentYear = parseInt(now.getFullYear().toString().slice(-2)); // Últimos 2 dígitos do ano
    const currentMonth = now.getMonth() + 1;
  
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }
  
  // Valida e-mail
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  