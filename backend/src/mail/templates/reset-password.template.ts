export function generateResetPasswordEmailHtml(token: string): string {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">Reset your password</h2>
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Click the button below to set a new one.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank"
            style="background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          If you didn’t request a password reset, you can ignore this email. This link is valid for 24 hours.
        </p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} Your App Name. All rights reserved.
        </p>
      </div>
    </div>
  `;
}
