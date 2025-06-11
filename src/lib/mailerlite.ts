import axios from "axios";

const MAILERLITE_API_KEY = import.meta.env.VITE_MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = import.meta.env.VITE_MAILERLITE_GROUP_ID;

interface MailerLiteFields {
  name?: string;
  last_name?: string;
  [key: string]: string | undefined;
}

interface MailerLiteSubscriber {
  email: string;
  fields?: MailerLiteFields;
  groups?: string[];
}

export async function addSubscriberToMailerLite(
  subscriber: MailerLiteSubscriber
): Promise<boolean> {
  try {
    const response = await axios.post(
      "https://connect.mailerlite.com/api/subscribers",
      {
        ...subscriber,
        groups: [...(subscriber.groups || []), MAILERLITE_GROUP_ID],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${MAILERLITE_API_KEY}`,
        },
      }
    );

    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error adding subscriber to MailerLite:", error);
    return false;
  }
}
