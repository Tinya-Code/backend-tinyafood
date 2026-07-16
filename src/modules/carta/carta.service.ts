import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../../services/database/database.service';
import { Product } from '../products/entities/product.entity';

export interface Category {
  id: string;
  restaurant_id: string;
  block_id: string;
  name: string;
  description: string | null;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

export interface FormattedCategory extends Category {
  products: Product[];
}

export interface FormattedBlock {
  id: string;
  categories: FormattedCategory[];
}

export interface CartaResponse {
  restaurant_id: string;
  restaurant_name: string;
  blocks: FormattedBlock[];
}

@Injectable()
export class CartaService {
  constructor(
    private readonly db: DatabaseService,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getCartaByRestaurant(restaurantId: string): Promise<CartaResponse> {
    // Verificar que el restaurante existe
    const restaurants = await this.db.query<any[]>(
      `SELECT id, name FROM restaurants WHERE id = ? AND is_active = 1`,
      [restaurantId],
    );

    if (restaurants.length === 0) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const restaurant = restaurants[0];

    // Obtener todos los bloques únicos de las categorías del restaurante
    const blocks = await this.db.query<any[]>(
      `SELECT DISTINCT block_id FROM categories 
       WHERE restaurant_id = ? AND is_active = 1 
       ORDER BY block_id`,
      [restaurantId],
    );

    // Formatear los bloques con sus categorías y productos
    const formattedBlocks: FormattedBlock[] = await Promise.all(
      blocks.map(async (block) => this.formatBlock(block.block_id, restaurantId)),
    );

    return {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      blocks: formattedBlocks,
    };
  }

  private async formatBlock(blockId: string, restaurantId: string): Promise<FormattedBlock> {
    // Obtener categorías del bloque
    const categories = await this.db.query<Category[]>(
      `SELECT * FROM categories 
       WHERE restaurant_id = ? AND block_id = ? AND is_active = 1 
       ORDER BY name`,
      [restaurantId, blockId],
    );

    // Formatear cada categoría con sus productos
    const formattedCategories: FormattedCategory[] = await Promise.all(
      categories.map(async (category) => this.formatCategory(category)),
    );

    return {
      id: blockId,
      categories: formattedCategories,
    };
  }

  private async formatCategory(category: Category): Promise<FormattedCategory> {
    // Obtener productos de la categoría usando el repositorio de TypeORM con relaciones
    const products = await this.productRepo.find({
      where: { categoryId: category.id, isActive: true },
      relations: { prices: true, priceRanges: true },
      order: { name: 'ASC' },
    });

    const cleanProducts = products.map(product => {
      const { createdAt, updatedAt, restaurantId, ...restProduct } = product;
      if (restProduct.priceRanges) {
        restProduct.priceRanges = restProduct.priceRanges.map(range => {
          const { createdAt: rCa, updatedAt: rUa, ...restRange } = range;
          return restRange as any;
        });
      }
      return restProduct as any;
    });

    const { created_at, updated_at, restaurant_id, ...cleanCategory } = category;

    return {
      ...cleanCategory,
      products: cleanProducts,
    } as any;
  }

  async getCartaSimple(restaurantId: string): Promise<any> {
    // Versión simplificada para endpoints que no necesitan toda la estructura
    const carta = await this.getCartaByRestaurant(restaurantId);
    
    // Aplanar la estructura para un formato más simple
    const allProducts: any[] = [];
    
    carta.blocks.forEach(block => {
      block.categories.forEach(category => {
        category.products.forEach(product => {
          allProducts.push({
            ...product,
            categoryId: category.id,
            category_id: category.id,
            categoryName: category.name,
            category_name: category.name,
            blockId: block.id,
            block_id: block.id,
          });
        });
      });
    });

    return {
      restaurant_id: carta.restaurant_id,
      restaurant_name: carta.restaurant_name,
      products: allProducts,
    };
  }
}