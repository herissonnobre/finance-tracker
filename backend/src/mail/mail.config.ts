export default () => ({
  mail: {
    host: 'smtp.gmail.com',
    port: 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: `"No Reply" <${process.env.MAIL_USER}>`,
  },
});
