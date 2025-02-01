import { email, Template, Event, Update, Updates } from "../../../../custom/email";

const domain = process.env.NODE_ENV == 'development'
    ? process.env.FRONTEND_URL_DEV ?? "http://localhost:3000"
    : process.env.FRONTEND_URL_PROD ?? "https://kommissary.co";

function generateBeforeDynamicFields(event) {
    const { data } = event.params;
    event.params.data.slug = crypto.randomUUID();
    event.params.data.name = `${data.state}: (user: ${data.userId}) - ${data.organization}`;
    event.params.data.id = data.id;
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
    async beforeUpdate(event: Event) {
        const customer = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: event.params.data.userId }
        });
        const prevOrder = await strapi.db.query('api::order.order').findOne({
            where: event.params.where,
        });
        const newOrder = event.params.data;
        /**
            Estimate, Issued, In Progress
            Fulfilled, 
            Closed Short, Void, Expired
        **/
        
        // Clear the noEmail flag if it exists
        if (event.params.data?.metaData && typeof event.params.data.metaData === 'object' && !Array.isArray(event.params.data.metaData)) {
            const metaData = event.params.data.metaData || {};
            if (metaData?.noEmail) {
                delete metaData.noEmail;
                event.params.data.metaData = metaData;
            }
        }

        if ( // If the order is in progress and the PONumber is added, then set the order to Issued
            prevOrder.state == 'In Progress' && newOrder.state != 'Issued' && 
            prevOrder.PONumber == '' && newOrder.PONumber != ''
        ) {
            event.params.data.state = 'Issued';
        }

        if ( // If the order is in progress and the PONumber is empty, then send an email to the customer
            (prevOrder.state == 'Estimate' && newOrder.state == 'In Progress') &&
            (!newOrder.PONumber || (typeof newOrder.PONumber === 'string' && newOrder.PONumber == ''))
        ) {
            const metaData = event.params.data.metaData || {};
            metaData.noEmail = true;
            event.params.data.metaData = metaData;
            email(Template.UPDATE_ORDER_READY as Template, { to: customer.email }, { event, user: customer });
        }
    },
    async afterUpdate(event: Event) {
        const customer = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: event.params.data.userId }
        });
        // If metaData.noEmail is set to true, then do not send an email
        let sendEmail = true;
        if (event.params.data?.metaData) {
            const metaData = event.params.data.metaData;
            if (metaData?.noEmail) sendEmail = false;
        }
       if (sendEmail) email(Template.UPDATE_ORDER as Template, { to: customer.email }, { event, user: customer });
    }
};