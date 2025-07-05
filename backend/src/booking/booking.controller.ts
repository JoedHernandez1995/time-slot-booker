import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body,
  Param, 
  Query,
  UseGuards, 
  UsePipes, 
  ValidationPipe,
  ParseUUIDPipe,
  Request,
  HttpStatus,
  HttpCode,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';

@Controller('booking')
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true, 
  forbidNonWhitelisted: true 
}))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBookings(
    @Request() req,
    @Query() queryDto: QueryBookingDto,
  ) {
    const user = req.user;
    const bookings = await this.bookingService.getBookings(user.id, queryDto);
    return {
      status: 'success',
      data: bookings,
      count: bookings.length
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBooking(
    @Param('id', ParseUUIDPipe) id: string, 
    @Request() req
  ) {
    const user = req.user;
    
    const booking = await this.bookingService.getBooking(id, user.id);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    return {
      status: 'success',
      data: booking
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req
  ) {
    const user = req.user;
    const newBooking = await this.bookingService.createBooking({
      ...createBookingDto,
      userId: user.id,
    });
    return {
      status: 'success',
      message: 'Booking created successfully',
      data: newBooking
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req
  ) {
    const user = req.user;
    const updatedBooking = await this.bookingService.updateBooking(id, updateBookingDto, user.id);
    return {
      status: 'success',
      message: 'Booking updated successfully',
      data: updatedBooking
    };
  }
  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBooking(
    @Param('id', ParseUUIDPipe) id: string, 
    @Request() req
  ) {
    const user = req.user;
    await this.bookingService.deleteBooking(id, user.id);
  }
}