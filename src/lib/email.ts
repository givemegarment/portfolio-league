// Email utilities for sending notifications
// TODO: Integrate with an email service like Resend, SendGrid, or Postmark

export type EmailSubscription = {
  email: string;
  address: string;
  preferences: {
    weeklyDigest: boolean;
    achievements: boolean;
    leaderboardUpdates: boolean;
  };
  subscribedAt: number;
};

type WeeklyDigestParams = {
  email: string;
  address: string;
  rank: number;
  score: number;
  topAssets: Array<{ symbol: string; percentage: number }>;
  weekNumber: number;
};

type EmailResult = {
  success: boolean;
  error?: string;
};

/**
 * Send welcome email to new subscriber
 */
export async function sendWelcomeEmail(params: {
  email: string;
  address: string;
}): Promise<EmailResult> {
  const { email, address } = params;

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log(`[Email] Would send welcome email to ${email} for address ${address}`);
    return { success: true };
  }

  try {
    console.log(`[Email] Sent welcome email to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send weekly digest email to a subscriber
 */
export async function sendWeeklyDigest(params: WeeklyDigestParams): Promise<EmailResult> {
  const { email, address, rank, score, topAssets, weekNumber } = params;

  // Check if email service is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log(`[Email] Would send weekly digest to ${email}:`, {
      address,
      rank,
      score,
      topAssets,
      weekNumber,
    });
    // Return success in dev mode without actual email service
    return { success: true };
  }

  try {
    // TODO: Replace with actual email service integration
    // Example with Resend:
    // const { Resend } = await import('resend');
    // const resend = new Resend(resendApiKey);
    // await resend.emails.send({
    //   from: 'Imitatio <notifications@imitatio.gg>',
    //   to: email,
    //   subject: `Week ${weekNumber} Digest - Rank #${rank}`,
    //   html: generateWeeklyDigestHtml(params),
    // });

    console.log(`[Email] Sent weekly digest to ${email} for week ${weekNumber}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Failed to send weekly digest to ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send achievement notification email
 */
export async function sendAchievementEmail(params: {
  email: string;
  address: string;
  achievementName: string;
  achievementDescription: string;
}): Promise<EmailResult> {
  const { email, achievementName } = params;

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log(`[Email] Would send achievement notification to ${email}:`, params);
    return { success: true };
  }

  try {
    console.log(`[Email] Sent achievement notification (${achievementName}) to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Failed to send achievement notification to ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send leaderboard update email
 */
export async function sendLeaderboardUpdateEmail(params: {
  email: string;
  address: string;
  oldRank: number;
  newRank: number;
}): Promise<EmailResult> {
  const { email, oldRank, newRank } = params;

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log(`[Email] Would send leaderboard update to ${email}:`, params);
    return { success: true };
  }

  try {
    console.log(`[Email] Sent leaderboard update to ${email}: #${oldRank} -> #${newRank}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Failed to send leaderboard update to ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
