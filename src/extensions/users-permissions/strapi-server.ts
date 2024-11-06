import { email, Template } from "../../custom/email";

module.exports = (plugin) => {
    const userController = plugin.controllers.user;
    plugin.controllers.user = ({ strapi }) => {
        strapi.db.lifecycles.subscribe({
            models: ["plugin::users-permissions.user"],
            async afterCreate(event) {
                email(Template.CREATE_USER as Template, { to: event.result.email }, { event, user: event.result });
            },
            async beforeUpdate(event) {
                if (event.params.data?.resetPasswordToken) {
                    return;
                }
                // If metaData.noEmail is set to true, then do not send an email
                let sendEmail = true;
                if (event.params.data?.metaData) {
                    const metaData = typeof event.params.data.metaData === 'string'
                        ? JSON.parse(event.params.data.metaData)
                        : event.params.data.metaData;
                    if (metaData?.noEmail) {
                        sendEmail = false;
                        delete metaData.noEmail;
                        event.params.data.metaData = JSON.stringify(metaData);
                    }
                }
                if (sendEmail) email(Template.UPDATE_USER as Template, {
                    to: event.params.data.email
                }, { event, user: event.params.data }, false);
            },
        });
        const updateMe = async (ctx) => {
            if (!ctx.state.user || !ctx.state.user.id) {
                return ctx.unauthorized();
            }
            await strapi.query('plugin::users-permissions.user').update({
                where: { id: ctx.state.user.id },
                data: ctx.request.body
            }).then((res) => {
                ctx.send(res);
            }).catch((err) => {
                ctx.badRequest(null, [{ messages: [{ id: 'User.update.error', message: 'User update error:' + err.message, field: [] }] }]);
            });
        }
        return {
            ...userController,
            updateMe,
        };
    };
    plugin.routes['content-api'].routes.push({
        method: 'PUT',
        path: '/user/me',
        handler: 'user.updateMe',
        config: {
            prefix: '',
            policies: []
        }   
    });
    return plugin;
};