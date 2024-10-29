import { email, Template } from "../../../../custom/email";

const domain = process.env.NODE_ENV == 'development'
    ? process.env.FRONTEND_URL_DEV ?? "http://localhost:3000"
    : process.env.FRONTEND_URL_PROD ?? "https://kommissary.co";

type Update = {
    info: string;
    timestamp: string;
    by: string;
}[];

type Updates = Update[];

type Event = {
    params: {
        data: {
            userId: string;
            state: string;
            messages: [] | null;
            update: Update | null;
            updates: Updates | null;
        };
    };
    result: {
        slug: string;
        items: {}[];
    };
}

function generateBeforeDynamicFields(event) {
    const { data } = event.params;
    event.params.data.slug = crypto.randomUUID()
    event.params.data.name = `${data.state}: (user: ${data.userId}) - ${data.organization}`
}

export default {
    async beforeCreate(event: { params: { data: { slug: string; }; }; }) {
        generateBeforeDynamicFields(event);
    },
    async afterCreate(event: Event) {
        const customer = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: event.params.data.userId }
        });
        email(Template.CREATE_ORDER as Template, { to: customer.email }, { event, user: customer });
    },
    async afterUpdate(event: Event) {
        const customer = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: event.params.data.userId }
        });
        console.log(event.result?.items)
        email(Template.UPDATE_ORDER as Template, { to: customer.email }, { event, user: customer });
    }
};