
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { policyGateway } from './middleware/policy.middleware';
import { authMiddleware } from './middleware/auth.middleware'; // Assumed exists
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Authentication Layer
app.use(authMiddleware);

// 2. Policy Enforcement Layer (Radius-style)
app.use(policyGateway);

// 3. Routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🛡️ API Gateway & Policy Engine running on port ${PORT}`);
});
