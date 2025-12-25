// src/actions/sendEmail.server.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import transporter from '@/lib/nodemailer';

// Define the input schema (Zod works directly here)
const sendEmailSchema = z.object({
	to: z.string().email(),
	subject: z.string().min(1),
	meta: z.object({
		description: z.string().min(1),
		link: z.string().url(),
		callToActionText: z.string().optional(),
		greeting: z.string().optional(),
	}),
});

export const sendEmailAction = createServerFn({ method: 'POST' })
	// <-- This is the correct method name
	.inputValidator(sendEmailSchema)
	.handler(async ({ data }) => {
		// `data` is now fully typed and validated (Zod-safe)
		const { to, subject, meta } = data;

		console.log('[sendEmailAction] called with:', { to, subject });

		const mailOptions = {
			from: process.env.NODEMAILER_USER,
			to,
			subject: `BestSlot - ${subject}`,
			html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        .body-wrapper { font-family: 'Arial', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .main-card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e9ecef; padding: 30px; }
        .cta-button {
            display: inline-block;
            padding: 12px 25px;
            margin-top: 20px;
            background-color: #007bff;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa;">
    <center class="body-wrapper" style="width: 100%; table-layout: fixed; padding: 40px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <tr>
                <td align="center" style="padding-bottom: 20px;">
                    <h2 style="margin:0; color:#343a40;">BestSlot</h2>
                </td>
            </tr>
            <tr>
                <td align="center" class="main-card">
                    <h1 style="font-size:24px; color:#343a40; margin:0 0 20px; font-weight:600;">${subject}</h1>
                    ${meta.greeting ? `<p style="font-size:16px; color:#495057; margin-bottom:15px;">Hi ${meta.greeting},</p>` : ''}
                    <p style="font-size:16px; color:#495057; line-height:1.5; margin-bottom:25px;">${meta.description}</p>
                    <div style="text-align:center;">
                        <a href="${meta.link}" class="cta-button">
                            ${meta.callToActionText || 'Complete Action'}
                        </a>
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-top:30px; font-size:12px; color:#adb5bd;">
                    <p>© ${new Date().getFullYear()} BestSlot. All rights reserved.</p>
                    <p style="margin-top:5px;">This is an automated message, please do not reply.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
      `,
		};

		try {
			console.log('[sendEmailAction] sending...');
			await transporter.sendMail(mailOptions);
			console.log('[sendEmailAction] sent successfully');
			return { success: true };
		} catch (err: any) {
			console.error('[sendEmailAction] error:', err);
			return { success: false, error: err.message };
		}
	});
