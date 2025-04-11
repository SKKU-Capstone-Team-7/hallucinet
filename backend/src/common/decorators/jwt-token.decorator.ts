// not using in now

//import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

//decorator for extracting jwt token in http request
//export const JwtToken = createParamDecorator(
//    (data: unknown, ctx: ExecutionContext): string => {
//        const request = ctx.switchToHttp().getRequest();
//        const authHeader = request.headers.authorization;
//        if (!authHeader) {
//            throw new UnauthorizedException('Authorization header is required.');
//        }
//        const parts = authHeader.split(' ');
//        if (parts.length !== 2 || parts[0] !== 'Bearer') {
//            throw new UnauthorizedException('Invalid authorization header format.');
//        }
//        return parts[1];
//    },
//);