import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const AppwriteClient = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.appwriteClient;
    },
);
