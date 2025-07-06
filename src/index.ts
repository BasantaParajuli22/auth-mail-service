import 'dotenv/config';
import express from 'express';
import { sendVerificationMail } from './services/mail.service';
import authRoutes from './routes/auth.route';
import connectToDB from './config/mongooseConfig';

const app = express();
app.use(express.json());

app.use('/api', authRoutes);

async function startServer() {
  try {
    await connectToDB();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error: any) {
    console.error(' Failed to start server: ', error);
    process.exit(1);
  }
}
startServer();
