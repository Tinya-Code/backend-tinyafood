import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalServiceException } from '../../common/errors/exceptions';
import { v2 as cloudinary } from 'cloudinary';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('Cloudinary configuration is missing. Image upload functionality will not work.');
      this.isConfigured = false;
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.isConfigured = true;
    this.logger.log('Cloudinary configured successfully');
  }

  private checkConfiguration(): void {
    if (!this.isConfigured) {
      throw new ExternalServiceException('Cloudinary', 'Cloudinary is not configured');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    this.checkConfiguration();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `Cloudinary ${operationName} attempt ${attempt}/${this.maxRetries} failed`,
          error,
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          this.logger.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new ExternalServiceException(
      'Cloudinary',
      `${operationName} failed after multiple attempts: ${lastError?.message}`,
    );
  }

  async uploadImage(
    file: MulterFile,
    folder: string = 'tinyafood',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new ExternalServiceException('Cloudinary', 'No file provided');
    }

    return this.executeWithRetry(async () => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });

        this.logger.log(`Image uploaded successfully: ${result.public_id}`);
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (error) {
        this.logger.error('Cloudinary upload error:', error);
        throw error;
      }
    }, 'upload image');
  }

  async uploadImageFromBase64(
    base64String: string,
    folder: string = 'tinyafood',
  ): Promise<{ url: string; publicId: string }> {
    if (!base64String) {
      throw new ExternalServiceException('Cloudinary', 'No base64 string provided');
    }

    return this.executeWithRetry(async () => {
      try {
        const result = await cloudinary.uploader.upload(base64String, {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });

        this.logger.log(`Image uploaded successfully from base64: ${result.public_id}`);
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (error) {
        this.logger.error('Cloudinary upload error:', error);
        throw error;
      }
    }, 'upload image from base64');
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new ExternalServiceException('Cloudinary', 'No public ID provided');
    }

    return this.executeWithRetry(async () => {
      try {
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`Image deleted successfully: ${publicId}`);
      } catch (error) {
        this.logger.error('Cloudinary delete error:', error);
        throw error;
      }
    }, 'delete image');
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    return this.executeWithRetry(async () => {
      try {
        await cloudinary.api.delete_resources(publicIds);
        this.logger.log(`Images deleted successfully: ${publicIds.join(', ')}`);
      } catch (error) {
        this.logger.error('Cloudinary batch delete error:', error);
        throw error;
      }
    }, 'delete images');
  }

  async deleteFolder(folder: string): Promise<void> {
    if (!folder) {
      throw new ExternalServiceException('Cloudinary', 'No folder provided');
    }

    return this.executeWithRetry(async () => {
      try {
        await cloudinary.api.delete_folder(folder);
        this.logger.log(`Folder deleted successfully: ${folder}`);
      } catch (error) {
        this.logger.error('Cloudinary folder delete error:', error);
        throw error;
      }
    }, 'delete folder');
  }

  getUrl(publicId: string, transformation?: any): string {
    if (!publicId) {
      throw new ExternalServiceException('Cloudinary', 'No public ID provided');
    }

    return cloudinary.url(publicId, transformation);
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.isConfigured) {
      return {
        healthy: false,
        message: 'Cloudinary is not configured',
      };
    }

    try {
      // Simple ping to check if Cloudinary is accessible
      await cloudinary.api.ping();
      return { healthy: true, message: 'Cloudinary service healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: `Cloudinary service unhealthy: ${(error as Error).message}`,
      };
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}
