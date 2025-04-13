import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);
    try {
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    try {
      const users = await this.userRepository.find();
      this.logger.log(`Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        this.logger.warn(`User with ID: ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Retrieved user with ID: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      // First check if user exists
      const existingUser = await this.findOne(id);

      // Update the user
      await this.userRepository.update(id, updateUserDto);

      // Get the updated user
      const updatedUser = await this.userRepository.findOne({ where: { id } });
      this.logger.log(`User with ID: ${id} updated successfully`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user with ID: ${id}`);
    try {
      // First check if user exists
      await this.findOne(id);

      // Delete the user
      await this.userRepository.delete(id);
      this.logger.log(`User with ID: ${id} removed successfully`);
    } catch (error) {
      this.logger.error(`Failed to remove user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Fetching user with email: ${email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`User with email: ${email} not found`);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      this.logger.log(`Retrieved user with email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user by email: ${error.message}`, error.stack);
      throw error;
    }
  }
}