const EmailTemplates = require('email-templates')
const path = require('path')
const { sendMail } = require('~/utils/mailer')
const { templateList } = require('~/emails')

const {
  gmailCredentials: { user }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')
const { TEMPLATE_NOT_FOUND } = require('~/consts/errors')

const emailTemplates = new EmailTemplates({
  views: {
    root: path.join(__dirname, '../emails'),
    options: {
      extension: 'pug'
    }
  }
})
const emailService = {
  sendEmail: async (email, subject, language, text = {}) => {
    console.log('Sending email to:', email) // test
    console.log('Email subject:', subject) // test
    console.log('Email text:', text) // test
    const templateToSend = templateList[subject]

    if (!templateToSend) {
      console.error(`Template for subject ${subject} not found`) // test
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    const langTemplate = templateToSend[language]

    if (!langTemplate) {
      console.error(`Template for language ${language} not found`) // test
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    try {
      console.log(`Rendering template ${langTemplate.template} with text`, text) // test
      const html = await emailTemplates.render(langTemplate.template, text)
      console.log('HTML content generated') // test

      await sendMail({
        from: `Space2Study <${user}>`,
        to: email,
        subject: langTemplate.subject,
        html
      })
      console.log(`Email sent successfully to ${email}`) // test
    } catch (error) {
      console.error('Error sending email:', error) // test
      throw createError(500, 'Failed to send email')
    }
  }
}

module.exports = emailService
