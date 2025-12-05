import { IsBoolean } from 'class-validator';

export class ToggleOwnedDto {
  @IsBoolean()
  owned: boolean;
}

export class ToggleWishlistDto {
  @IsBoolean()
  wishlist: boolean;
}
