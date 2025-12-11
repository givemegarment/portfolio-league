/**
 * Email utilities for Imitatio using Resend
 */

import { Resend } from 'resend';

// Lazy initialize Resend client to avoid build-time errors
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const FROM_EMAIL = 'Imitatio <noreply@portfolioleague.xyz>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

export type EmailSubscription = {
  email: string;
  address: string;
  subscribedAt: number;
  preferences: {
    weeklyDigest: boolean;
    achievements: boolean;
    leaderboardUpdates: boolean;
  };
};

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(params: {
  email: string;
  address: string;
  rank: number;
  score: number;
  topAssets: Array<{ symbol: string; percentage: number }>;
  weekNumber: number;
}) {
  const { email, address, rank, score, topAssets, weekNumber } = params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const scoreDisplay = score >= 0 ? `+${score.toFixed(2)}%` : `${score.toFixed(2)}%`;
  
  const assetsText = topAssets.map(a => `${a.symbol} (${a.percentage}%)`).join(', ');

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Week ${weekNumber} Results - You ranked #${rank}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050507; color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0052FF; font-size: 28px; margin: 0;">Imitatio</h1>
              <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Week ${weekNumber} Results</p>
            </div>
            
            <!-- Main Card -->
            <div style="background-color: #121217; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
              <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0;">Hey ${shortAddress},</p>
              <h2 style="color: #f4f4f5; font-size: 24px; margin: 0 0 24px 0;">Your Week ${weekNumber} is complete!</h2>
              
              <!-- Stats Grid -->
              <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="flex: 1; background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Rank</p>
                  <p style="color: #f59e0b; font-size: 32px; font-weight: bold; margin: 0;">#${rank}</p>
                </div>
                <div style="flex: 1; background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Return</p>
                  <p style="color: ${score >= 0 ? '#10b981' : '#f43f5e'}; font-size: 32px; font-weight: bold; margin: 0;">${scoreDisplay}</p>
                </div>
              </div>
              
              <!-- Portfolio -->
              <div style="background-color: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Your Portfolio</p>
                <p style="color: #f4f4f5; font-size: 16px; margin: 0; font-family: monospace;">${assetsText}</p>
              </div>
              
              <!-- CTA -->
              <a href="${SITE_URL}" style="display: block; background: linear-gradient(135deg, #0052FF 0%, #7c3aed 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Set Your Picks for Week ${weekNumber + 1}
              </a>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; color: #71717a; font-size: 12px;">
              <p>You're receiving this because you subscribed to Imitatio updates.</p>
              <p>
                <a href="${SITE_URL}/api/notifications/email/unsubscribe?address=${address}" style="color: #0052FF; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send weekly digest:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send achievement notification email
 */
export async function sendAchievementEmail(params: {
  email: string;
  address: string;
  achievementName: string;
  achievementIcon: string;
  achievementDescription: string;
}) {
  const { email, address, achievementName, achievementIcon, achievementDescription } = params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${achievementIcon} Achievement Unlocked: ${achievementName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050507; color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0052FF; font-size: 28px; margin: 0;">Imitatio</h1>
            </div>
            
            <!-- Achievement Card -->
            <div style="background: linear-gradient(135deg, rgba(153, 69, 255, 0.2) 0%, rgba(0, 82, 255, 0.2) 100%); border: 1px solid rgba(153, 69, 255, 0.3); border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 24px;">
              <p style="font-size: 64px; margin: 0 0 16px 0;">${achievementIcon}</p>
              <h2 style="color: #f4f4f5; font-size: 24px; margin: 0 0 8px 0;">Achievement Unlocked!</h2>
              <p style="color: #9945FF; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">${achievementName}</p>
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">${achievementDescription}</p>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${SITE_URL}/profile/${address}" style="display: inline-block; background: linear-gradient(135deg, #0052FF 0%, #7c3aed 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
                View Your Profile
              </a>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; color: #71717a; font-size: 12px;">
              <p>Congrats ${shortAddress}! Keep playing to unlock more achievements.</p>
              <p>
                <a href="${SITE_URL}/api/notifications/email/unsubscribe?address=${address}" style="color: #0052FF; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send achievement email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome/confirmation email
 */
export async function sendWelcomeEmail(params: {
  email: string;
  address: string;
}) {
  const { email, address } = params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Imitatio! 🎯',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050507; color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0052FF; font-size: 28px; margin: 0;">Imitatio</h1>
            </div>
            
            <!-- Welcome Card -->
            <div style="background-color: #121217; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #f4f4f5; font-size: 24px; margin: 0 0 16px 0;">Welcome to Imitatio! 🎯</h2>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hey ${shortAddress}, you're now subscribed to email notifications! Here's what you'll receive:
              </p>
              
              <ul style="color: #a1a1aa; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0 0 24px 0;">
                <li><strong style="color: #f4f4f5;">Weekly Digest</strong> - Your rank, performance, and next week's picks reminder</li>
                <li><strong style="color: #f4f4f5;">Achievement Alerts</strong> - Get notified when you unlock new badges</li>
                <li><strong style="color: #f4f4f5;">Leaderboard Updates</strong> - When you move up in the rankings</li>
              </ul>
              
              <a href="${SITE_URL}" style="display: block; background: linear-gradient(135deg, #0052FF 0%, #7c3aed 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Start Playing
              </a>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; color: #71717a; font-size: 12px;">
              <p>
                <a href="${SITE_URL}/api/notifications/email/unsubscribe?address=${address}" style="color: #0052FF; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

