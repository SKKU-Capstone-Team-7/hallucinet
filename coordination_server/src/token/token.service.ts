import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenDto } from './create-token.dto';
import { TokenPayloadDto } from './token-payload.dto';

@Injectable()
export class TokenService {
  secret: string;
  constructor(
    private jwtService: JwtService,

    private configService: ConfigService,
  ) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
  }

  async createToken(form: CreateTokenDto): Promise<{ token: string }> {
    const payload = new TokenPayloadDto({
      deviceId: form.deviceId,
    });
    const token = this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: '1 year',
    });
    return { token: token };
  }

  decodeToken(token: string): TokenPayloadDto {
    return this.jwtService.decode(token);
  }
}
