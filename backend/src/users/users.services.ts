import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTPayload, JWTTokenType } from 'src/utils/types';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class UsersServices {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}
  /**
   * @desc  Register
   * @param {CreateUserDto} body
   * @returns Promise<{ token: JWTTokenType }>
   */
  async register(body: CreateUserDto) {
    // Check the user email
    const user = await this.usersRepo.findOne({ where: { email: body.email } });
    // if user exists throw error
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    // Hash password
    const hashedPassword = await this.hashPassword(body.password);
    // Create user
    let newUser = this.usersRepo.create({
      ...body,
      password: hashedPassword,
    });
    newUser = await this.usersRepo.save(newUser);

    // Generate Token
    const token = this.generateToken({
      id: newUser.id,
      role: newUser.role,
    });

    return {
      user: newUser,
      token,
    };
  }
  /**
   * @desc  Login
   * @param {LoginUserDto} body
   * @returns Promise<{ token: JWTTokenType }>
   */
  async login(body: LoginUserDto) {
    // Check the user email is exist or not
    const user = await this.usersRepo.findOne({ where: { email: body.email } });
    // if user is not found throw error
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Check the password
    if (!bcrypt.compare(body.password, user.password)) {
      throw new BadRequestException('Invalid password');
    }
    // Generate token
    const token = this.generateToken({
      id: user.id,
      role: user.role,
    });
    return {
      user,
      token,
    };
  }
  /**
   * @desc  Find One User
   * @param {number} id
   * @returns Promise<User | null>
   */
  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  /**
   * @desc  Find All Users
   * @returns Promise<User[]>
   */
  async findAll() {
    return this.usersRepo.find({
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });
  }
  /**
   * @desc  Delete User
   * @param {number} id
   */
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepo.remove(user);
  }
  // Generate token
  private generateToken(payload: JWTPayload) {
    const token = this.jwt.sign(payload);
    return token;
  }
  // Hash Password
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}
