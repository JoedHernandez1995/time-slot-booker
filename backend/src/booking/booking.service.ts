import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Booking } from 'generated/prisma';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(booking: Booking) {
    const newBooking = await this.prisma.booking.create({
      data: booking,
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
  async updateBooking(id: string, booking: Booking, userId: string) {
    return this.prisma.booking.update({
      where: { id, userId },
      data: booking,
    });
  }

  async deleteBooking(id: string, userId: string) {
    return this.prisma.booking.delete({
      where: { id, userId },
    });
  }
}