import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Importa tus módulos (UsersModule, AuthModule, etc.)
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Conexión a MongoDB (cambia la URI por la de tu base de datos)
    MongooseModule.forRoot('mongodb://localhost/nest-auth-db'),

    // Módulos de tu aplicación
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
