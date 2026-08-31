// Email service using EmailJS (free tier available at emailjs.com)
// Installation: npm install @emailjs/browser

export const emailConfig = {
  // Get these from emailjs.com after creating a free account
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_swadhub',
  templateIdSignUp: import.meta.env.VITE_EMAILJS_TEMPLATE_SIGNUP || 'template_signup',
  templateIdLogin: import.meta.env.VITE_EMAILJS_TEMPLATE_LOGIN || 'template_login',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key',
}

// Mock email service for demonstration
// In production, replace with actual EmailJS or backend API
export const sendSignUpEmail = async (name, email) => {
  try {
    // Option 1: Using EmailJS (requires setup at emailjs.com)
    // await emailjs.send(
    //   emailConfig.serviceId,
    //   emailConfig.templateIdSignUp,
    //   {
    //     to_email: email,
    //     user_name: name,
    //     activation_link: `${window.location.origin}/verify?token=xxx`,
    //   },
    //   emailConfig.publicKey
    // )

    // Option 2: Using backend API (recommended for production)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'signup',
        email,
        name,
      }),
    })

    // For demo: simulate success
    console.log(`Welcome email would be sent to ${email}`)
    return { success: true, message: `Confirmation email sent to ${email}` }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, message: 'Could not send email, but account created' }
  }
}

export const sendLoginEmail = async (name, email) => {
  try {
    // Option 2: Using backend API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'login',
        email,
        name,
      }),
    })

    // For demo: simulate success
    console.log(`Login notification email would be sent to ${email}`)
    return { success: true, message: `Login confirmation sent to ${email}` }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, message: 'Could not send email, but login successful' }
  }
}

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'password_reset',
        email,
      }),
    })

    console.log(`Password reset email would be sent to ${email}`)
    return { success: true, message: `Password reset link sent to ${email}` }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, message: 'Could not send email' }
  }
}
