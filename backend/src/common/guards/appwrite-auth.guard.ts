import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AppwriteService } from 'src/modules/appwrite/appwrite.service';

@Injectable()
export class AppwriteAuthGuard implements CanActivate {
    constructor(private readonly appwriteService: AppwriteService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }

        try {
            request.appwriteClient = this.appwriteService.getClient(token);
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
