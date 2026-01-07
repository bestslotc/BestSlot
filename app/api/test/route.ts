import { NextResponse } from 'next/server';
import { sendUserNotification } from '@/lib/ably';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Find the admin to notify
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      take: 1, // Good practice to limit if you only need one
    });

    if (admins.length === 0) {
      return NextResponse.json(
        { error: 'No admin found to notify' },
        { status: 404 },
      );
    }

    const admin = admins[0];

    // 2. Create the notification in the database
    // Store the result in a variable so we can pass it to Ably
    const newNotification = await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Test Notification ✅',
        message: `System test successful at ${new Date().toLocaleTimeString()}`,
        isRead: false,
        // Optional: add metadata
        data: { test: true },
      },
    });

    // 3. Trigger the real-time update via Ably
    // We pass the admin's ID and the exact object we just saved
    await sendUserNotification(admin.id, newNotification);

    return NextResponse.json({
      success: true,
      message: 'Notification created and published!',
      recipient: admin.email,
    });
  } catch (error) {
    console.error('Test Route Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
