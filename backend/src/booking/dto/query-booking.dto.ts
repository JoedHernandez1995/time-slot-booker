import { IsOptional, IsDateString, Matches } from 'class-validator';

export class QueryBookingDto {
  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid date in YYYY-MM-DD format' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid date in YYYY-MM-DD format' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid date in YYYY-MM-DD format' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be in YYYY-MM-DD format' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid date in YYYY-MM-DD format' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be in YYYY-MM-DD format' })
  dateTo?: string;
} 