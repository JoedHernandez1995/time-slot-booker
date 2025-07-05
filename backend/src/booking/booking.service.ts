import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(createBookingDto: CreateBookingDto & { userId: string }) {
    const newBooking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        startTime: new Date(createBookingDto.startTime),
        endTime: new Date(createBookingDto.endTime),
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