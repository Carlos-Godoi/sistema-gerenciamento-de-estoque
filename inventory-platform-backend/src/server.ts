// import { Console } from 'console';
import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';
import supplierRoutes from './routes/supplier.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes'; 


console.log("ROUTES:", authRoutes);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventorydb';

// ➡️ CONFIGURAÇÃO DA ORIGEM PERMITIDA
// Define a origem do frontend (cliente). Use o valor de .env ou um fallback local.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const corsOptions = {
    origin: CLIENT_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware básico para processar JSON
app.use(cors(corsOptions));
app.use(express.json());

// Rotas da API

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);

// Rota de teste
// app.get('/', (req: Request, res: Response) => {
//     res.send('API de Gerenciamento de Estoque Rodando!');
// });

// Conexão com o MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('Conexão com MongoDB estabelecido com sucesso!');

    

    // Inicia o servidor Express somente após a conexão com o DB
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

        // Log para confirmar a origem permitida
        console.log(`CORS habilitado para o origem: ${CLIENT_ORIGIN}`);
    });
})
.catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo em caso de erro no DB
});