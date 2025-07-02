import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
  }

  async validateGoogleUser(profile: any) {
    const { id: googleId, displayName, emails } = profile;
    const email = emails[0].value;
  
    // Try to find existing user by googleId
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });
  
    // If user doesn't exist, create a new one
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId,
          name: displayName,
          email,
          photo_url: profile.photos[0]?.value,
        },
      });
    }
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
  
}