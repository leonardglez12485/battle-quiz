import { Controller, Get, Inject, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ICategoryRepository } from 'src/domain/repositories/repositories';
import { CATEGORY_REPOSITORY } from 'src/domain/repositories/repository.tokens';

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

/**
 * Catálogo de categorías activas. Lectura pura, sin lógica: el controlador
 * proyecta la entidad a DTO. (Las categorías se administran por seed en v1.)
 */
@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository) {}

  @Get()
  async list(): Promise<CategoryDto[]> {
    const items = await this.categories.findActive();
    return items.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      iconUrl: c.iconUrl,
    }));
  }
}

@Module({
  controllers: [CategoriesController],
})
export class CategoriesModule {}
