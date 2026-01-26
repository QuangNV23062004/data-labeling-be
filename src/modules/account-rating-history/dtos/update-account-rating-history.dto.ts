import { PartialType } from '@nestjs/swagger';
import { CreateAccountRatingHistoryDto } from './create-account-rating-history.dto';

export class UpdateAccountRatingHistoryDto extends PartialType(CreateAccountRatingHistoryDto) {}
