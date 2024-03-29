import hbs from "nodemailer-express-handlebars";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";

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
    console.log("[Notifications] mailer config", {
      auth: {
        user: process.env.NEW_EMAIL_USERNAME,
        pass: process.env.NEW_EMAIL_PASSWORD,
      },
    });
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NEW_EMAIL_USERNAME,
        pass: process.env.NEW_EMAIL_PASSWORD,
      },
    });
    this.hbsOptions = {
      viewEngine: {
        extname: ".hbs",
        defaultLayout: "",
      },
      viewPath: path.resolve("./src/templates"),
      extName: ".hbs",
    };
    this.transporter.use("compile", hbs(this.hbsOptions));
  }

  async sendEmail(mail: Mail) {
    await this.transporter.sendMail(mail);
  }
}
export const mailer = new Mailer();
