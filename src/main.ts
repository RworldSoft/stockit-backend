import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import * as dotenv from 'dotenv';

dotenv.config();

const SWAGGER_ENVS = ['local', 'dev', 'staging'];

async function bootstrap() {
  const isProd = process.env.ENV === 'PROD';
  const port = isProd ? process.env.PROD_PORT : process.env.DEV_PORT;

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
      whitelist: false,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle(
      'StockIt Backend APIs' + (isProd ? ' (PROD)' : ' ' + process.env.ENV),
    )
    .setDescription('StockIt  APIs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'StockIt Backend APIs  API Docs',
  });

  await app.listen(port || 5000, () => {
    console.log(`Application is running on port ${port}`);
  });
}

bootstrap();
