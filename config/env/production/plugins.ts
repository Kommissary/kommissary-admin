export default ({ env }) => ({
    email: {
        config: {
            provider: 'sendgrid',
            providerOptions: {
                apiKey: env('SENDGRID_API_KEY'),
            },
            settings: {
                defaultFrom: 'orders@kommissary.com',
                defaultReplyTo: 'orders@kommissary.com',
            },
        },
    },
});