import { MailerService } from "@nestjs-modules/mailer";
import { OnQueueActive, OnQueueCompleted, OnQueueProgress, Process, Processor } from "@nestjs/bull";
import { DoneCallback, Job } from "bull";


@Processor('sendMailWelcomeQueue')
export class SendMailWelcomeConsumer {
  constructor(private mailService: MailerService) { }

  private static logo: string = 'https://www.condor.com.br/assets/images/logo.png';

  @Process('sendMailWelcomeJob')
  async sendRegister(job: Job, done: DoneCallback) {
    try {
      await this.mailService.sendMail({
        to: job.data.email,
        from: '"Plataforma Condor BI" <web@condor.com.br>',
        subject: "Seja Bem Vindo(a)!",
        html: await this.emailTemplateSac(job.data)
      })
      done()
    } catch (error) {
      done(error)
    }
  };
  @OnQueueCompleted()
  onCompleted(job: Job) {

  };
  @OnQueueProgress()
  onQueueProgress(job: Job) {

  };
  @OnQueueActive()
  onQueueActive(job: Job) {

  };
  async emailTemplateSac(data: any) {
    const html = `
${this.header()}
   <html>
    <body>
      <div style="margin:0 auto; max-width: 650px; height: auto; border-radius:10px; overflow:hidden">
              <div style="text-align: center; background:#0b479c; padding:40px 0">
            <img align-items="center" src="${SendMailWelcomeConsumer.logo}" alt="logo-condor" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; max-width: 100%;" />
              <div style="background-color:#fff">
              <h1 style="padding: 20px ; line-height: 100%; text-align: center; font-weight: normal; font-family: arial, helvetica, sans-serif; font-size: 22px;">
                Olá, ${data.name}!
              </h1>
              <div style="line-height: 100%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 100%;"></p>
              </div>
              <div style="line-height: 100%; text-align: center; word-wrap: break-word;">
                <p style="padding: 5px; font-size: 14px; line-height: 100%;"> Usuário: ${data.email}</p>
                <p style="padding: 5px; font-size: 14px; line-height: 100%;">Senha: ${data.password}</p>
              </div>
              <div style="text-align: center;padding: 20px;">
                <a href="https://bi.cndr.me" target="_blank" style="display: inline-block; font-family: arial, helvetica, sans-serif; text-decoration: none; -webkit-text-size-adjust: none; text-align: center; color: #ffffff; background-color: #df112c; border-radius:15px; width: 200px; height: 40px; line-height: 40px;">
                  <strong>Acessar o Sistema</strong>
                </a>
              </div>
              </div>
        <div style="text-align: center; background:#0b479c; padding:20px 0">      </div>
      </div>
    </body>
    </html>`;

    return html;
  }

  header = () => {
    return `
      <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
        <title></title>
        ${this.style()}
      </head>`;
  };

  style = () => {
    return `
    <style type="text/css">
      body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #e7e7e7; color: #000000; }
      table, tr, td { vertical-align: top; border-collapse: collapse; }
      p { margin: 0; }
      .ie-container table, .mso-container table { table-layout: fixed; }
      * { line-height: inherit; }
      a[x-apple-data-detectors='true'] { color: inherit !important; text-decoration: none !important; }
      table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
    </style>
    `;
  }
}