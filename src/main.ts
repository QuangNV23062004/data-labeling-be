import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './common/typed-config/typed-config.service';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(TypedConfigService);
  const logger = new Logger('Bootstrap');
  const uploadsDir = join(__dirname, '..', 'uploads');
  const templatesDir = join(__dirname, 'common', 'templates');

  // Configure static file serving for uploads
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  // Serve static assets (CSS, JS, images) from templates folder
  app.useStaticAssets(templatesDir, {
    prefix: '/templates/',
  });

  // Set base views directory for EJS templates
  app.setBaseViewsDir(templatesDir);

  //API Prefix and Version
  const apiPrefix = configService.server.prefix.trim();
  const apiVersion = configService.server.version.trim();
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  //Cookies from header
  app.use(cookieParser());

  //Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.tailwindcss.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.tailwindcss.com',
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net',
          ],
          fontSrc: [
            "'self'",
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net',
            'data:',
          ],
        },
      },
    }),
  );

  //CORS
  app.enableCors({
    origin: [configService.client.url1, configService.client.url2],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //set view engine
  app.setViewEngine('ejs');

  //Validation Pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  //Serialization Interceptor for class-transformer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //Swagger API Docs
  const config = new DocumentBuilder()
    .setTitle('Scaffolding Backend API')
    .setDescription('API documentation for Scaffolding Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  logger.log(`Starting server on port ${configService.server.port}...`);
  await app.listen(configService.server.port);
  logger.log(
    `Swagger docs available at http://localhost:${configService.server.port}/docs`,
  );
}
bootstrap();
