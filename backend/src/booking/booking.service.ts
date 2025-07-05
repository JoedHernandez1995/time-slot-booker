import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkForOverlappingBookings(
    startTime: Date,
    endTime: Date,
    userId: string,
    excludeBookingId?: string
  ) {
    const where: any = {
      userId,
      AND: [
        {
          startTime: { lt: endTime }, // existing booking starts before new booking ends
        },
        {
          endTime: { gt: startTime }, // existing booking ends after new booking starts
        },
      ],
    };

    // Exclude the booking being updated
    if (excludeBookingId) {
      where.NOT = { id: excludeBookingId };
    }

    const existingBookings = await this.prisma.booking.findMany({
      where,
    });

    if (existingBookings.length > 0) {
      throw new BadRequestException(
        'You already have a booking during this time slot. Please choose a different time.'
      );
    }
  }

  async createBooking(createBookingDto: CreateBookingDto & { userId: string }) {
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    // Validate that end time is after start time
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping bookings for this specific user
    await this.checkForOverlappingBookings(startTime, endTime, createBookingDto.userId);

    const newBooking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        startTime,
        endTime,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return newBooking;
  }

  async getBookings(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = { userId };

    // Filter by specific start date
    if (filters?.startDate) {
      const startOfDay = new Date(filters.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.startDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter by specific end date
    if (filters?.endDate) {
      const startOfDay = new Date(filters.endDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.endTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter by date range
    if (filters?.dateFrom || filters?.dateTo) {
      where.startTime = {};
      
      if (filters.dateFrom) {
        where.startTime.gte = new Date(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.startTime.lte = endDate;
      }
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
  
  async getBooking(id: string, userId: string) {
    return this.prisma.booking.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId: string) {
    const updateData: any = { ...updateBookingDto };
    
    // Convert date strings to Date objects if provided
    if (updateBookingDto.startTime) {
      updateData.startTime = new Date(updateBookingDto.startTime);
    }
    if (updateBookingDto.endTime) {
      updateData.endTime = new Date(updateBookingDto.endTime);
    }

    // If updating time slots, validate for overlaps
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      // Get the current booking to use existing values if not updating both start and end
      const currentBooking = await this.prisma.booking.findUnique({
        where: { id, userId },
      });

      if (!currentBooking) {
        throw new BadRequestException('Booking not found');
      }

      const startTime = updateData.startTime || currentBooking.startTime;
      const endTime = updateData.endTime || currentBooking.endTime;

      // Validate that end time is after start time
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check for overlapping bookings for this user (excluding the current booking)
      await this.checkForOverlappingBookings(startTime, endTime, userId, id);
    }

    return this.prisma.booking.update({
      where: { id, userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteBooking(id: string, userId: string) {
    return this.prisma.booking.delete({
      where: { id, userId },
    });
  }
}