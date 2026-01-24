#!/usr/bin/env node

/**
 * NestJS Module Scaffolding Tool
 * Usage: node scaffold-module.ts <module-name>
 * Example: node scaffold-module.ts user
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Error: Module name is required');
  console.log('Usage: node scaffold-module.ts <module-name>');
  process.exit(1);
}

const capitalizedName = moduleName
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');
const modulesPath = path.join(process.cwd(), 'src', 'modules');

console.log(`Scaffolding NestJS module: ${moduleName}`);

try {
  // Ensure we're in the right directory
  if (!fs.existsSync(modulesPath)) {
    console.error('Error: src/modules directory not found');
    process.exit(1);
  }

  // Navigate to src/modules
  process.chdir(modulesPath);

  // Generate module, controller, and service using Nest CLI
  console.log('Generating module...');
  execSync(`nest g module ${moduleName} `, { stdio: 'inherit' });

  console.log('Generating controller...');
  execSync(`nest g controller ${moduleName} `, { stdio: 'inherit' });

  console.log('Generating service...');
  execSync(`nest g service ${moduleName} `, { stdio: 'inherit' });

  // Navigate into the module directory
  const moduleDir = path.join(modulesPath, moduleName);
  process.chdir(moduleDir);

  // Create dtos directory
  console.log('Creating dtos directory...');
  fs.mkdirSync('dtos', { recursive: true });

  // Create exceptions directory
  console.log('Creating exceptions directory...');
  fs.mkdirSync('exceptions', { recursive: true });

  // Create repository file
  console.log('Creating repository file...');
  const repositoryContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalizedName}Repository {
  // Add your repository methods here
}
`;
  fs.writeFileSync(`${moduleName}.repository.ts`, repositoryContent);

  // Create entity file
  console.log('Creating entity file...');
  const entityContent = `export class ${capitalizedName}Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Add your entity properties here
}
`;
  fs.writeFileSync(`${moduleName}.entity.ts`, entityContent);

  // Create DTOs
  console.log('Creating DTO files...');

  const createDtoContent = `import { IsNotEmpty, IsString } from 'class-validator';

export class Create${capitalizedName}Dto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
`;
  fs.writeFileSync(
    path.join('dtos', `create-${moduleName}.dto.ts`),
    createDtoContent,
  );

  const updateDtoContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${capitalizedName}Dto } from './create-${moduleName}.dto';

export class Update${capitalizedName}Dto extends PartialType(Create${capitalizedName}Dto) {}
`;
  fs.writeFileSync(
    path.join('dtos', `update-${moduleName}.dto.ts`),
    updateDtoContent,
  );

  const filterDtoContent = `import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Filter${capitalizedName}QueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
`;
  fs.writeFileSync(
    path.join('dtos', `filter-${moduleName}-query.dto.ts`),
    filterDtoContent,
  );

  // Create exceptions file
  console.log('Creating exceptions file...');
  const exceptionsContent = `import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ${capitalizedName}NotFoundException extends NotFoundException {
  constructor(id: string) {
    super(\`${capitalizedName} with ID "\${id}" not found\`);
  }
}

export class ${capitalizedName}AlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(\`${capitalizedName} with identifier "\${identifier}" already exists\`);
  }
}

export class Invalid${capitalizedName}Exception extends BadRequestException {
  constructor(message: string) {
    super(\`Invalid ${moduleName}: \${message}\`);
  }
}
`;
  fs.writeFileSync(
    path.join('exceptions', `${moduleName}-exceptions.exception.ts`),
    exceptionsContent,
  );

  console.log('\nModule scaffolding completed successfully!');
  console.log(`\nStructure created at: src/modules/${moduleName}/`);
  console.log(`
Generated files:
  ├── ${moduleName}.module.ts
  ├── ${moduleName}.controller.ts
  ├── ${moduleName}.service.ts
  ├── ${moduleName}.repository.ts
  ├── ${moduleName}.entity.ts
  ├── dtos/
  │   ├── create-${moduleName}.dto.ts
  │   ├── update-${moduleName}.dto.ts
  │   └── filter-${moduleName}-query.dto.ts
  └── exceptions/
      └── ${moduleName}-exceptions.exception.ts
  `);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
