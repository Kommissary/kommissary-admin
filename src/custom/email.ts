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
}

const fieldDisplay = (field: string) => {
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
}

export const EmailTemplate = {
    CREATE_USER: (vars: Vars) => ({
        subject: `Welcome to the Kommissary DoE Shop!`,
        html: `
            <img src="https://kommissary.com/images/logo.svg" alt="Kommissary Logo" style="width: 100px; height: auto;">
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
            <img src="https://kommissary.com/images/logo.svg" alt="Kommissary Logo" style="width: 100px; height: auto;">
            <p>Hi ${vars.user.fullName}, <br />
            Looks like your ${Object.keys(vars.event.params.data).map(k=>k=='updatedAt'?null:fieldDisplay(k)).join(', ')} was changed.<br>
            <p>You can see your profile <a href="${domain}/user">here</a>.</p>
            <p>Thanks, <br>
            The Kommissary Team</p>
        `,
    }),
    CREATE_ORDER: (vars: Vars) => ({
        subject: `Thank you for your order request!`,
        html: `
            <img src="https://kommissary.com/images/logo.svg" alt="Kommissary Logo" style="width: 100px; height: auto;" />
            <p>Hi ${vars.user.fullName}, <br /> 
            we will be in-touch soon to confirm your order.</p>
            <p>View / update your order here: ${domain}/order/${vars.event.result.slug}</p>
            <ul>
                
            </ul>
            <p>Order details: <br />
            TBD</p>
        `,
    }),
    UPDATE_ORDER: (vars: Vars) => ({
        subject: `(${vars.event.params.data.state}) Your order has been updated`,
        html: `
            <img src="https://kommissary.com/images/logo.svg" alt="Kommissary Logo" style="width: 100px; height: auto;" />
            <p>Hi ${vars.user.fullName}, <br />
            Your order has been updated. <br />
            View / edit your order <a href="${domain}/order/${vars.event.result.slug}">here</a>.</p>
            <p>Order details: <br />
            TBD</p>
        `,
    }),
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
    email.to = email.to.trim();
    if (!email.html && !email.text) return;
    if (email.html) email.html = stripLineIndent(email.html);
    email.text = email.text || stripTags(email.html);
    email.text = stripLineIndent(email.text);
    await strapi.plugins['email'].services.email.send(email);
}

export function emailTemplate(template: string, vars: Vars) {
    return EmailTemplate[template](vars);
}