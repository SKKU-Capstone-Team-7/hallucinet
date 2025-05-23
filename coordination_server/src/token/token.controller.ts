import { Body, Controller, Get, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './create-token.dto';

@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post('')
  async createToken(@Body() form: CreateTokenDto): Promise<{ token: string }> {
    return this.tokenService.createToken(form);
  }
}
