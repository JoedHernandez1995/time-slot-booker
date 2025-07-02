import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
  ) {
  }

  async validateGoogleUser(profile: any) {
    const { id: googleId, displayName, emails } = profile;
    const email = emails[0].value;
  
    const userResult = await this.databaseService.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId],
    );
  
    let user = userResult.rows[0];
    if (!user) {
      const insertResult = await this.databaseService.query(
        'INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *',
        [googleId, displayName, email],
      );
      user = insertResult.rows[0];
    }
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
  
}