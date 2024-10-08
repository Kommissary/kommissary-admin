export default ({ env }) => ({
    email: {
        config: {
            provider: 'sendgrid',
            providerOptions: {
                apiKey: env('SENDGRID_API_KEY'),
            },
            settings: {
                defaultFrom: 'it@kommissary.com',
                defaultReplyTo: 'it@kommissary.com',
            },
        },
      },
});