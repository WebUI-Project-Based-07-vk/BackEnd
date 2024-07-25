const emailService = require('~/services/email')
const EmailTemplates = require('email-templates')
const { sendMail } = require('~/utils/mailer')
const { templateList } = require('~/emails')
const { TEMPLATE_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const {
  gmailCredentials: { user }
} = require('~/configs/config')

jest.mock('email-templates')
jest.mock('~/utils/mailer')


describe('email service', () => {

  describe('sendEmail method', () => {
    const mockParams = {
      email: 'test@gmail.com',
      subject: 'testSubject',
      lang: 'en',
      text: {
        confirmToken: 'confirmToken',
        email: 'test@gmail.com',
        firstName: 'testName'
      }
    }
    const mockTemplateList = {
      [mockParams.subject]: {
        [mockParams.lang]: {
          subject: 'Test Subject',
          template: 'en/test-subject'
        }
      }
    }
    const mockHtml = '<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>'

    beforeEach(() => {
      jest.resetAllMocks()
      templateList[mockParams.subject] = mockTemplateList[mockParams.subject]
      // EmailTemplates.mockImplementation(() => {
      //   return {
      //     render: jest.fn().mockResolvedValue(mockHtml)
      //   }
      // })
    })

    afterEach(() => {
      jest.resetAllMocks()
      delete templateList[mockParams.subject]
    })

    it('Should return TEMPLATE_NOT_FOUND error if templateList not found', async () => {
      const response = emailService.sendEmail(mockParams.email, null, mockParams.lang, mockParams.text)

      await expect(response).rejects.toThrowError(createError(404, TEMPLATE_NOT_FOUND))
    })

    it('Should send an email with the correct params', async () => {
      await emailService.sendEmail(mockParams.email, mockParams.subject, mockParams.lang, mockParams.text)

      const mockTemplate = mockTemplateList[mockParams.subject][mockParams.lang]

      const emailTemplatesMock = jest.spyOn(EmailTemplates.prototype, 'render').mockImplementation(jest.fn().mockResolvedValue(mockHtml))

      // const emailTemplates = new EmailTemplates()
      // const result = await emailTemplates.render('en/test-subject', mockParams.text)
      // console.log(result)
      // expect(result).toBe(mockHtml)

      expect(emailTemplatesMock).toHaveBeenCalledWith(mockTemplate.template, mockParams.text)
      expect(sendMail).toHaveBeenCalledWith({
        from: `Space2Study <${user}>`,
        to: mockParams.email,
        subject: mockTemplate.subject,
        html: mockHtml
      })
    })

  })
})
