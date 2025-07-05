import { IsString, IsDateString, IsOptional, IsEnum, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
}

export class CreateBookingDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim()) // Sanitize: trim whitespace
  title: string;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  startTime: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid ISO date string' })
  endTime: string;

  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Status must be either CONFIRMED or CANCELED' })
  status?: BookingStatus;
} 