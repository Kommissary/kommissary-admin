const domain = process.env.NODE_ENV == 'development'
    ? process.env.FRONTEND_URL_DEV ?? "http://localhost:3000"
    : process.env.FRONTEND_URL_PROD ?? "https://kommissary.co";

export type Email = {
    to?: string;
    from?: string;
    cc?: string;
    bcc?: string;
    replyTo?: string;
    subject?: string;
    text?: string;
    html?: string;
}

export type Update = {
    info: string;
    timestamp: string;
    by: string;
}[];

export type Updates = Update[];

export type Event = {
    params: {
        where?: { id: string | number; };
        data: {
            slug: string;
            userId: string;
            state: string;
            messages: [] | null;
            update: Update | null;
            updates: Updates | null;
            PONumber: string;
            site: string;
            items: { name: string; quantity: number; }[];
            metaData: { noEmail?: boolean } | undefined;
        };
    };
    result?: {
        id?: string | number;
        slug?: string;
        items?: { name: string, quantity: number }[];
        site?: string;
    };
}

export type User = {
    email: string;
    fullName: string;
}

export type Vars = {event?: Event, user?: User};

export type Template = 'CREATE_USER' | 'UPDATE_USER' | 'CREATE_ORDER' | 'UPDATE_ORDER';

export const Template = {
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    CREATE_ORDER: 'CREATE_ORDER',
    UPDATE_ORDER: 'UPDATE_ORDER',
    UPDATE_ORDER_APPROVED: 'UPDATE_ORDER_APPROVED',
    UPDATE_ORDER_ISSUED: 'UPDATE_ORDER_ISSUED',
}

/* const fieldDisplay = (field: string) => {
    switch (field) {
        case 'fullName':
            return '"Full Name"';
        case 'email':
            return '"Email"';
        case 'password':
            return '"Password"';
        default:
            return `"${field.charAt(0).toUpperCase() + field.slice(1)}"`;
    }
} */

const replace = (str: string, tokens: {[key: string]: string | number}) => {
    return str.replace(/\{\{[^\}]{1,}\}\}/g, (_, field) => {
        const value = tokens[field];
        if (value) return value as string;
        return '';
    });
}
const logoDoE = `<img src="${domain}/images/Kommissary-DoE.png" alt="Kommissary DoE" style="width: 200px; height: auto;" />`;
/* const downloadSalesOrderBtn = `<a style="text-decoration: none; color: #666; border-radius: 8px; border: 1px solid #dddddd; background: white; padding: 8px 16px; display: inline-flex;" href="${domain}/{{site}}/order/{{slug}}/kommissary-doe-order-{{id}}-{{state}}.xlsx">
    <img style="margin-right: 6px; display: inline-block;" src="${domain}/images/file.png" alt="" height="36" width="30" /> <span style="display: inline-block; line-height: 36px;">Download Sales Order</span>
</a>` */
const signatureDoE = `<p style="margin-bottom: 16px;">
    Thanks, <br> The Kommissary Team
</p>`

export const EmailTemplate = {
    CREATE_USER: (vars: Vars) => ({
        subject: `Welcome to the Kommissary DoE Shop!`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br />
            welcome to the Kommissary DoE Shop!<br>
            Your account has been created, you can create and edit orders, download receipts, and view your order history.</p>
            <p>If you need help, please contact us by replying to this email.</p>
            <p>Thanks, <br>
            The Kommissary Team</p>
        `,
    }),
    UPDATE_USER: (vars: Vars) => ({
        subject: `You updated your Kommissary account`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br />
            Looks like your profile information was changed.<br>
            <p>You can see your profile <a href="${domain}/doe/user">here</a>.</p>
            <p>Thanks, <br>
            The Kommissary Team</p>
        `,
    }),
    CREATE_ORDER: (vars: Vars) => ({
        subject: `Thank you for your order request!`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br /> 
            We will be in-touch soon to confirm your order.</p>
            <p>View / update your order <a style="color: #f66;" href="${domain}/${vars.event.result.site}/order/${vars.event.result.slug}">here</a>.</p>
            <p><strong>Order details</strong>: <br />
            ${vars.event.result.items?.map(item => ` • ${item.name} &times; ${item.quantity}`).join('<br />\n')}
            </p>
            ${signatureDoE}
            <p>
                <a style="text-decoration: none; color: #666; border-radius: 8px; border: 1px solid #dddddd; background: white; padding: 8px 16px; display: inline-flex;" href="${domain}/${vars.event.result.site}/order/${vars.event.params.data.slug}/kommissary-doe-order-${vars.event.result.id}-${vars.event.params.data.state.toLowerCase()}.xlsx">
                    <img style="margin-right: 6px; display: inline-block;" src="${domain}/images/file.png" alt="" height="36" width="30" /> <span style="display: inline-block; line-height: 36px;">Download Sales Order</span>
                </a>
            </p>
        `,
    }),
    UPDATE_ORDER: (vars: Vars) => ({
        subject: `(${vars.event.params.data.state}) Your order has been updated`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br />
            Your order has been updated.</p>
            <p>View / edit your order <a href="${domain}/${vars.event.result.site}/order/${vars.event.result.slug}">here</a>.</p>
            <p><strong>Order details</strong>: <br />
            ${vars.event.result.items?.map(item => ` • ${item.name} &times; ${item.quantity}`).join('<br />\n')}
            </p>
            ${signatureDoE}
            <p>
                <a style="text-decoration: none; color: #666; border-radius: 8px; border: 1px solid #dddddd; background: white; padding: 8px 16px; display: inline-flex;" href="${domain}/${vars.event.result.site}/order/${vars.event.params.data.slug}/kommissary-doe-order-${vars.event.result.id}-${vars.event.params.data.state.toLowerCase().replace(' ', '-')}.xlsx">
                    <img style="margin-right: 6px; display: inline-block;" src="${domain}/images/file.png" alt="" height="36" width="30" /> <span style="display: inline-block; line-height: 36px;">Download Sales Order</span>
                </a>
            </p>
        `,
    }),
    UPDATE_ORDER_APPROVED: (vars: Vars) => ({
        subject: `(${vars.event.params.data.state}) Your order is being processed!`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br />
            Your order has been approved!<br />
            You can view/edit it <a href="${domain}/doe/order/${vars.event.result.slug}">here</a>.<br />
            Important: If you need to make any changes, make them soon, once we <strong>issue</strong> the order, it won't be editable.</p>
            <p><strong>Order details</strong>: <br />
                ${vars.event.params.data.items?.map(item => ` • ${item.name} &times; ${item.quantity}`).join('<br />\n')}
            </p>
            ${signatureDoE}
            <p>
                <a style="text-decoration: none; color: #666; border-radius: 8px; border: 1px solid #dddddd; background: white; padding: 8px 16px; display: inline-flex;" href="${domain}/doe/order/${vars.event.result.slug}/kommissary-doe-order-${vars.event.result.id}-${vars.event.params.data.state.toLowerCase().replace(' ', '-')}.xlsx">
                    <img style="margin-right: 6px; display: inline-block;" src="${domain}/images/file.png" alt="" height="36" width="30" /> <span style="display: inline-block; line-height: 36px;">Download Sales Order</span>
                </a>
            </p>
        `,
    }),
    UPDATE_ORDER_ISSUED: (vars: Vars) => ({
        subject: `(${vars.event.params.data.state}) Your order has been issued!`,
        html: `
            ${logoDoE}
            <p>Hi ${vars.user.fullName}, <br />
            Your order has been issued!<br />
            You can view it <a href="${domain}/doe/order/${vars.event.result.slug}">here</a>,<br />
            but it's no longer editable.</p>
            </p>
            <p><strong>Order details</strong>: <br />
                ${vars.event.params.data.items?.map(item => ` • ${item.name} &times; ${item.quantity}`).join('<br />\n')}
            </p>
            ${signatureDoE}
            <p>
                <a style="text-decoration: none; color: #666; border-radius: 8px; border: 1px solid #dddddd; background: white; padding: 8px 16px; display: inline-flex;" href="${domain}/doe/order/${vars.event.result.slug}/kommissary-doe-order-${vars.event.result.id}-${vars.event.params.data.state.toLowerCase().replace(' ', '-')}.xlsx">
                    <img style="margin-right: 6px; display: inline-block;" src="${domain}/images/file.png" alt="" height="36" width="30" /> <span style="display: inline-block; line-height: 36px;">Download Sales Order</span>
                </a>
            </p>
        `,
    }),
}

export function cleanEmail(email: string): string {
    email = email || '';
    if (email.includes('<') && email.includes('>'))
        email = email.split('<')[1].split('>')[0];
    return email.trim().toLowerCase();
}

export function stripTags(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, '');
}

export function stripLineIndent(str: string): string {
    return str.replace(/^[^\<\n\ra-z0-9]{1,}/mig, '')
}

export async function email(template: Template, email: Email, vars: Vars, ccAdmins: boolean = true) {
    const adminEmail = '"Kommissary" <it@kommissary.com>'
    const cc = ccAdmins ? { bcc: adminEmail } : {};
    email = {
        ...cc,
        from: adminEmail,
        replyTo: adminEmail,
        ...emailTemplate(template, vars),
        ...email,
    } as Email;
    if (!email.to || !email.subject) return;
    if (email?.bcc && cleanEmail(email.bcc) == cleanEmail(email.to)) delete email.bcc;
    if (email?.cc && cleanEmail(email.cc) == cleanEmail(email.to)) delete email.cc;
    if (email?.bcc && email?.cc && cleanEmail(email.bcc) == cleanEmail(email.cc)) delete email.cc;
    email.to = email.to.trim();
    // console.log(email)
    if (!email.html && !email.text) return;
    if (email.html) email.html = stripLineIndent(email.html);
    email.text = email.text || stripTags(email.html);
    email.text = stripLineIndent(email.text);
    await strapi.plugins['email'].services.email.send(email);
}

export function emailTemplate(template: string, vars: Vars) {
    return EmailTemplate[template](vars);
} 