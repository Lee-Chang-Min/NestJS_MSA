import { NestFactory } from '@nestjs/core';
import { GatewayServerModule } from './gateway-server.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayServerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
