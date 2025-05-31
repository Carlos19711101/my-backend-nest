import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Registro público
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  // Login público
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // Aquí idealmente deberías delegar la generación del JWT a AuthService
    // Pero si quieres devolver solo el usuario sin password, puedes hacerlo así:
    return user;
  }

  // Perfil protegido, requiere JWT válido
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId; // Asegúrate que el payload JWT tenga userId
    return this.usersService.findById(userId);
  }
 
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}
