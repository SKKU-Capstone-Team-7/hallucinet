import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  async createToken(): Promise<{ token: string }> {
    const secret = this.configService.get<string>('JWT_SECRET');
    const payload = {
      userId: '68105fc7001dc555c6fa',
      teamId: '67f9f12c0015b7f72fd2',
    };
    const token = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: '1 year',
    });
    return { token: token };
  }
}
