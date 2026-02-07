import nodemailer from 'nodemailer';

export async function sendOTPEmail(email, otp) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: `"JustScan Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'JustScan Verification – OTP Code',

    html: `
  <div style="
    font-family: Arial, sans-serif; 
    max-width: 600px; 
    margin: 0 auto; 
    background: #0f172a; 
    padding: 28px; 
    border-radius: 14px; 
    border: 1px solid #1e293b;
    color: #e5e7eb;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 18px 18px;
  ">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 12px;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 30px; font-weight: bold;">
        JustScan
      </h1>
      <p style="color: #94a3b8; margin-top: 6px; font-size: 14px;">
        Secure Account Verification
      </p>
    </div>

    <hr style="border: 0; border-top: 1px solid #1e293b; margin: 22px 0;">

    <!-- Main Body -->
    <p style="font-size: 16px; color: #e5e7eb;">
      You are creating a new account on JustScan.
      Please use the following One-Time Password (OTP) to verify your email address:
    </p>

    <div style="
      background: #020617; 
      padding: 22px; 
      text-align: center; 
      border-radius: 12px; 
      margin: 28px 0; 
      border: 1px solid #334155;
    ">
      <h1 style="
        margin: 0; 
        font-size: 38px; 
        letter-spacing: 8px; 
        color: #38bdf8;
      ">
        ${otp}
      </h1>
    </div>

    <p style="font-size: 15px; color: #e5e7eb;">
      This OTP is valid for <strong>10 minutes</strong>.  
      For security reasons, do not share this code with anyone.
    </p>

    <p style="font-size: 14px; color: #94a3b8;">
      If you did not attempt to create an account on JustScan, please ignore this email.
    </p>

    <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;">

    <p style="color: #64748b; font-size: 12px; text-align: center;">
      This is an automated security email from <strong>JustScan</strong>.<br>
      Please do not reply to this message.
    </p>
  </div>
  `,
  };


  // Send email
  await transporter.sendMail(mailOptions);
}

export async function sendAttendanceReminderEmail(studentEmail, studentName, organizationName, leavingTime) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${organizationName} - JustScan" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `[${organizationName}] Attendance Reminder`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 28px; border-radius: 14px;">
                <!-- Organization Header -->
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 28px;">${organizationName}</h1>
                    <p style="color: #6b7280; margin-top: 8px;">Attendance Alert System</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 24px 0;">
                    <h2 style="color: #dc2626; font-size: 20px;">⚠️ Attendance Reminder</h2>
                    
                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                        Our records show that you left the premises at <strong>${new Date(leavingTime).toLocaleTimeString()}</strong> 
                        on <strong>${new Date(leavingTime).toLocaleDateString()}</strong> but have not returned yet.
                    </p>

                    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #991b1b; font-weight: 600;">
                            Please report to ${organizationName} immediately or contact the administration office.
                        </p>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        If you have already returned and this is an error, please contact the administration office to update your attendance status.
                    </p>
                </div>

                <!-- Footer -->
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    This is an automated alert from <strong>JustScan</strong> on behalf of ${organizationName}.<br>
                    Please do not reply to this email.
                </p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendFeedbackEmail(userName, userEmail, message) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long'
  });

  const mailOptions = {
    from: `"JustScan Feedback System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to admin email
    replyTo: userEmail, // Allow admin to reply directly to user
    subject: `New Feedback from ${userName}`,
    html: `
      <div style="
        font-family: Arial, sans-serif; 
        max-width: 600px; 
        margin: 0 auto; 
        background: #0f172a; 
        padding: 28px; 
        border-radius: 14px; 
        border: 1px solid #1e293b;
        color: #e5e7eb;
      ">
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 28px; font-weight: bold;">
            JustScan Feedback
          </h1>
          <p style="color: #94a3b8; margin-top: 6px; font-size: 14px;">
            New user feedback received
          </p>
        </div>

        <!-- User Info -->
        <div style="margin: 24px 0; padding: 16px; background: #020617; border-radius: 8px; border: 1px solid #334155;">
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">FROM:</p>
          <p style="margin: 0; font-size: 16px; color: #e5e7eb;">
            <strong>${userName}</strong>
          </p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #38bdf8;">
            ${userEmail}
          </p>
        </div>

        <!-- Timestamp -->
        <p style="font-size: 13px; color: #64748b; margin: 12px 0;">
          Received: ${timestamp}
        </p>

        <!-- Message -->
        <div style="margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
            Message:
          </p>
          <div style="
            background: #020617; 
            padding: 18px; 
            border-radius: 8px; 
            border-left: 4px solid #38bdf8;
            border: 1px solid #334155;
          ">
            <p style="margin: 0; color: #e5e7eb; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          This is an automated message from <strong>JustScan</strong> Feedback System.<br>
          Reply to this email to respond directly to the user.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
