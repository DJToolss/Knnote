import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { TURNSTILE_ENABLED } from '@/lib/turnstile-config';
import { clientIpFromHeaders, verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, turnstileToken } = await request.json();

    if (TURNSTILE_ENABLED) {
      const turnstileOk = await verifyTurnstileToken(
        turnstileToken,
        clientIpFromHeaders(request.headers)
      );
      if (!turnstileOk) {
        return NextResponse.json(
          { error: 'Bot check failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    await connectDB();
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Return user without password
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 