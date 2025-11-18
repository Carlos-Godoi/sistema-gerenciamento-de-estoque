import { Console } from 'console';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventorydb';

// Middleware básico para processar JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Estoque Rodando!');
});

// Conexão com o MongoDB
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Conexão com MongoDB estabelecido com sucesso!');

    // Inicia o servidor Express somente após a conexão com o DB
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
})
.catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo em caso de erro no DB
});