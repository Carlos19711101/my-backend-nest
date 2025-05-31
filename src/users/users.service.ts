import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService, // Solo si necesitas usar AuthService aquí
  ) { }

  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, name } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
    });

    const savedUser = await createdUser.save();

    const { password: _, ...result } = savedUser.toObject();
    return result;
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<Omit<User, 'password'>> {
  const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password').exec();
  if (!updatedUser) {
    throw new NotFoundException('Usuario no encontrado');
  }
  return updatedUser;
  }

  async remove(id: string): Promise<void> {
  const result = await this.userModel.findByIdAndDelete(id).exec();
  if (!result) {
    throw new NotFoundException('Usuario no encontrado');
  }
  }

}
