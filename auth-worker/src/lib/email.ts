async function sendResendEmail(opts: {
  resendApiKey: string | undefined
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  if (!opts.resendApiKey) {
    console.warn('RESEND_API_KEY missing — email not sent to', opts.to, 'subject:', opts.subject)
    return false
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@coursing-stats.ru',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  })
  if (!response.ok) {
    const error = await response.text()
    console.error('Resend error:', error)
    throw new Error(`Failed to send email: ${error}`)
  }
  return true
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#faf8f4;color:#433a31;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px">
    <h1 style="margin:0 0 12px;font-size:22px">Coursing Stats</h1>
    <h2 style="margin:0 0 16px;font-size:18px">${title}</h2>
    ${body}
  </div>
</body></html>`
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  resendApiKey: string | undefined,
): Promise<boolean> {
  const url = `https://coursing-stats.ru/verify-email?token=${token}`
  return sendResendEmail({
    resendApiKey,
    to: email,
    subject: 'Подтверждение email — Coursing Stats',
    html: wrapHtml(
      'Подтверждение email',
      `<p>Нажмите кнопку, чтобы подтвердить аккаунт.</p>
       <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#9b6720;color:#fff;border-radius:8px;text-decoration:none">Подтвердить</a></p>
       <p style="font-size:13px;word-break:break-all">${url}</p>`,
    ),
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  resendApiKey: string | undefined,
  oauthOnly: boolean,
): Promise<boolean> {
  const url = `https://coursing-stats.ru/reset-password?token=${token}`
  const title = oauthOnly ? 'Задать пароль' : 'Сброс пароля'
  return sendResendEmail({
    resendApiKey,
    to: email,
    subject: `${title} — Coursing Stats`,
    html: wrapHtml(
      title,
      `<p>${oauthOnly ? 'Аккаунт создан через Яндекс. Задайте пароль для входа по email.' : 'Ссылка для сброса пароля:'}</p>
       <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#9b6720;color:#fff;border-radius:8px;text-decoration:none">${oauthOnly ? 'Задать пароль' : 'Сбросить пароль'}</a></p>
       <p style="font-size:13px;word-break:break-all">${url}</p>
       <p style="font-size:13px;color:#98836a">Ссылка действует 1 час.</p>`,
    ),
  })
}
