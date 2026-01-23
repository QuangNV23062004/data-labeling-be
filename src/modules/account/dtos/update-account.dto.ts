import { CreateAccountDto } from './create-account.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
