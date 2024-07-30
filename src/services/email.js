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
    const templateToSend = templateList[subject]

    if (!templateToSend) {
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    const langTemplate = templateToSend[language]

    if (!langTemplate) {
      throw createError(404, TEMPLATE_NOT_FOUND)
    }

    const html = await emailTemplates.render(langTemplate.template, text)

    await sendMail({
      from: `Space2Study <${user}>`,
      to: email,
      subject: langTemplate.subject,
      html
    })
  }
}

module.exports = emailService
