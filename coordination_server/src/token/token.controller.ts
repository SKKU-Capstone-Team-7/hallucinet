import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get('')
  async createToken(): Promise<{ token: string }> {
    return this.tokenService.createToken();
  }
}
