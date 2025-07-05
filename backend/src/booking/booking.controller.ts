import { Controller, Get, Post, Put, Delete, Req, Res, UseGuards, Param, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getBookings(
    @Req() req, 
    @Res() res,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const user = req.user;
    const filters = { startDate, endDate, dateFrom, dateTo };
    const bookings = await this.bookingService.getBookings(user.id, filters);
    return res.status(200).json(bookings);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getBooking(@Param('id') id: string, @Req() req, @Res() res) {
    const user = req.user;
    const booking = await this.bookingService.getBooking(id, user.id);
    return res.status(200).json(booking);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createBooking(@Req() req, @Res() res) {
    const user = req.user;
    const booking = req.body;
    const newBooking = await this.bookingService.createBooking({
      ...booking,
      userId: user.id,
    });
    return res.status(201).json(newBooking);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateBooking(@Param('id') id: string, @Req() req, @Res() res) {
    const user = req.user;
    const booking = req.body;
    const updatedBooking = await this.bookingService.updateBooking(id, booking, user.id);
    return res.status(200).json(updatedBooking);
  }
  
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteBooking(@Param('id') id: string, @Req() req, @Res() res) {
    const user = req.user;
    await this.bookingService.deleteBooking(id, user.id);
    return res.status(204).send();
  }
}