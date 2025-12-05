import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleOwnedDto {
  @ApiProperty({ example: true, description: 'Whether the user owns this paint' })
  @IsBoolean()
  owned: boolean;
}

export class ToggleWishlistDto {
  @ApiProperty({ example: true, description: 'Whether the paint is on the wishlist' })
  @IsBoolean()
  wishlist: boolean;
}
