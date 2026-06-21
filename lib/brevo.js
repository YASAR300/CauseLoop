import { createAdminClient } from "@/lib/supabase/server";

/**
 * Sends a transactional email using Brevo's REST API and logs the attempt.
 * Guarantees to never throw an error that disrupts the calling code.
 * 
 * @param {string} userId - The target user's UUID
 * @param {object} params
 * @param {string} params.type - The notification type ('welcome', 'subscription_activated', 'payment_failed_warning', 'subscription_cancelled_lapsed', 'draw_results', 'winner_alert')
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.toName - Recipient name
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - Email HTML body
 * @param {object} [params.metadata] - Optional key-value metadata to store in notifications_log
 * @returns {Promise<{ success: boolean, logId?: string, error?: string }>}
 */
export async function sendTransactionalEmail(userId, { type, toEmail, toName, subject, htmlContent, metadata = {} }) {
  const adminClient = createAdminClient();
  let logId = null;

  try {
    // 1. Insert initial PENDING log entry
    const { data: logRow, error: logError } = await adminClient
      .from("notifications_log")
      .insert({
        user_id: userId,
        type,
        status: "pending",
        metadata: {
          toEmail,
          toName,
          subject,
          ...metadata
        }
      })
      .select("id")
      .single();

    if (logError) {
      console.error("[Brevo Helper] Failed to insert initial pending log in database:", logError);
    } else if (logRow) {
      logId = logRow.id;
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "sypher916@gmail.com";

    // 2. Validate API credentials
    if (!apiKey || apiKey === "placeholder_api_key_replace_me") {
      const errorMsg = "Brevo API Key is not configured in environment variables (.env)";
      console.warn(`[Brevo Helper] Mocking email send due to missing credentials. Type: ${type}, To: ${toEmail}`);
      
      if (logId) {
        await adminClient
          .from("notifications_log")
          .update({
            status: "failed",
            metadata: {
              toEmail,
              toName,
              subject,
              error: errorMsg,
              mocked: true,
              ...metadata
            }
          })
          .eq("id", logId);
      }
      return { success: false, logId, error: errorMsg };
    }

    // 3. Make HTTP request to Brevo REST API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: "CauseLoop"
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split("@")[0]
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorDetail = responseBody.message || `HTTP ${response.status} Error`;
      console.error(`[Brevo Helper] API call failed: ${errorDetail}`);
      
      if (logId) {
        await adminClient
          .from("notifications_log")
          .update({
            status: "failed",
            metadata: {
              toEmail,
              toName,
              subject,
              error: errorDetail,
              responseCode: response.status,
              ...metadata
            }
          })
          .eq("id", logId);
      }
      return { success: false, logId, error: errorDetail };
    }

    // 4. Update log to SENT on success
    const messageId = responseBody.messageId || "unknown-message-id";
    if (logId) {
      await adminClient
        .from("notifications_log")
        .update({
          status: "sent",
          metadata: {
            toEmail,
            toName,
            subject,
            messageId,
            ...metadata
          }
        })
        .eq("id", logId);
    }

    console.log(`[Brevo Helper] Successfully sent email. Type: ${type}, To: ${toEmail}, MessageId: ${messageId}`);
    return { success: true, logId };

  } catch (err) {
    console.error("[Brevo Helper] Unhandled exception occurred during email sending:", err);
    if (logId) {
      try {
        await adminClient
          .from("notifications_log")
          .update({
            status: "failed",
            metadata: {
              toEmail,
              toName,
              subject,
              error: err.message || "Unhandled exception",
              stack: err.stack,
              ...metadata
            }
          })
          .eq("id", logId);
      } catch (dbErr) {
        console.error("[Brevo Helper] Failed to record error details to database log:", dbErr);
      }
    }
    return { success: false, logId, error: err.message };
  }
}

// ── HTML EMAIL TEMPLATE GENERATORS ──

const getBaseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0c0c0c;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0c0c0c;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #121212;
      border: 1px solid #222222;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      padding: 30px 40px;
      background: linear-gradient(135deg, #18113c 0%, #0e0e0e 100%);
      border-bottom: 1px solid #222222;
      text-align: center;
    }
    .header-logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .header-logo-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-decoration: none;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      color: #a1a1aa;
      font-size: 14.5px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .btn-container {
      margin: 30px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background-color: #ffffff;
      color: #000000 !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .footer {
      padding: 30px 40px;
      background-color: #0e0e0e;
      border-top: 1px solid #222222;
      text-align: center;
    }
    .footer-text {
      color: #52525b;
      font-size: 12px;
      margin: 0;
    }
    .footer-link {
      color: #a1a1aa;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-logo">
          <span class="header-logo-text">CauseLoop</span>
        </div>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} CauseLoop. All rights reserved.<br>
          You are receiving this transactional email because of your account activity.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getWelcomeEmailHtml(name) {
  const body = `
    <h1>Welcome to CauseLoop, ${name}!</h1>
    <p>We are absolutely thrilled to welcome you to the CauseLoop community. By joining, you've taken a powerful step toward turning your passion for golf into real-world impact.</p>
    <p>Our platform tracks your golf scores using the official WHS handicap engine, matches your performance with active charity prize draws, and contributes a slice of your monthly subscription directly to your chosen charity partner.</p>
    <p>Get started by logging in, configuring your monthly donation share, and entering your latest golf scores to participate in the upcoming draws.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">Go to Dashboard</a>
    </div>
    <p>If you have any questions or need help setting up, please feel free to reach out to our support team.</p>
  `;
  return getBaseTemplate("Welcome to CauseLoop!", body);
}

export function getSubscriptionActivatedHtml(name) {
  const body = `
    <h1>Your Subscription is Active!</h1>
    <p>Hello ${name},</p>
    <p>Success! Your monthly subscription is now active, and you have been fully enrolled in the current month's charity prize draws.</p>
    <p>Remember that <strong>40% of all subscription revenue</strong> is pooled directly into our charity prize draw, and your configured percentage is routed directly to support your chosen charity partner.</p>
    <p>Log in to your dashboard to enter your latest rounds and handicap details. Good luck with the draws!</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">Enter Golf Scores</a>
    </div>
  `;
  return getBaseTemplate("Subscription Activated!", body);
}

export function getPaymentFailedWarningHtml(name) {
  const body = `
    <h1>Action Required: Payment Attempt Failed</h1>
    <p>Hello ${name},</p>
    <p>We wanted to let you know that our recent attempt to process your monthly subscription payment for CauseLoop did not go through.</p>
    <p><strong>Do not worry:</strong> your subscription is still temporarily active as Stripe automatically retries failed payments over the next few days. However, to ensure uninterrupted participation in our monthly prize draws and to keep supporting your charity partner, please take a moment to update your billing details.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">Update Card Details</a>
    </div>
    <p>Thank you for being a vital part of CauseLoop!</p>
  `;
  return getBaseTemplate("Payment Failed Warning", body);
}

export function getSubscriptionCancelledLapsedHtml(name) {
  const body = `
    <h1>Your CauseLoop Subscription Has Ended</h1>
    <p>Hello ${name},</p>
    <p>This email confirms that your subscription to CauseLoop has ended. As a result, your account has been transitioned back to visitor status, and you will no longer be entered into our monthly charity prize draws.</p>
    <p>We are incredibly grateful for the support you've provided to your charity partner during your time with us. If you ever wish to return and resume supporting your cause (and playing for prize draws!), you can easily reactivate your subscription at any time.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">Reactivate Subscription</a>
    </div>
    <p>Thank you once again, and we hope to see you back on the leaderboard soon!</p>
  `;
  return getBaseTemplate("Subscription Ended", body);
}

export function getDrawResultsHtml(name, month, year, winningNumbers) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = months[month - 1] || "Unknown";
  
  const numbersFormatted = Array.isArray(winningNumbers) ? winningNumbers.join(" - ") : "N/A";

  const body = `
    <h1>CauseLoop Draw Results: ${monthName} ${year}</h1>
    <p>Hello ${name},</p>
    <p>The official draw results for <strong>${monthName} ${year}</strong> have been finalized and published by the administrator!</p>
    <div style="background-color: #1a1a1a; border: 1px solid #2e2e2e; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
      <span style="color: #8644FF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Winning Numbers</span>
      <div style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 8px; font-family: monospace;">${numbersFormatted}</div>
    </div>
    <p>Head over to the dashboard to see if your logged golf scores matched the winning numbers and check your match counts and prizes.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">View My Results</a>
    </div>
  `;
  return getBaseTemplate(`Draw Results: ${monthName} ${year}`, body);
}

export function getWinnerAlertHtml(name, month, year, matchCount, prizeAmount) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = months[month - 1] || "Unknown";
  const prizeFormatted = parseFloat(prizeAmount || 0).toFixed(2);

  const body = `
    <h1>Congratulations! You've Won!</h1>
    <p>Hello ${name},</p>
    <p>We are thrilled to inform you that you matched <strong>${matchCount} numbers</strong> in the official <strong>${monthName} ${year}</strong> draw, winning a prize of <strong>£${prizeFormatted}</strong>!</p>
    <p>To claim your winnings, we require you to verify your scores. Please navigate to the <strong>Draws & Winnings</strong> tab on your dashboard and upload a screenshot of your score submission from your golf tracking app.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="btn" target="_blank">Upload Proof of Scores</a>
    </div>
    <p>Once our administrators review your proof, your payment status will be updated to paid. Fantastic job, and thank you for supporting charity draws!</p>
  `;
  return getBaseTemplate("You Won a Prize!", body);
}
