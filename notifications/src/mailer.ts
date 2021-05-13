import hbs from 'nodemailer-express-handlebars';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';

export interface Mail {
  from: string;
  to: string;
  subject: string;
  template: string;
  context: any;
}

class Mailer {
  private transporter: Transporter;
  hbsOptions: hbs.NodemailerExpressHandlebarsOptions;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: '7372da48597711',
        pass: '5915ab00d5ceb9',
      },
    });
    this.hbsOptions = {
      viewEngine: {
        extname: '.hbs',
        defaultLayout: '',
      },
      viewPath: path.resolve('./src/templates'),
      extName: '.hbs',
    };
    this.transporter.use('compile', hbs(this.hbsOptions));
  }

  async sendEmail(mail: Mail) {
    await this.transporter.sendMail(mail);
  }
}
export const mailer = new Mailer();
