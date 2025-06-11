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
    // Log configuration (without exposing the full API key)
    console.log("MailerLite Configuration:", {
      hasApiKey: !!MAILERLITE_API_KEY,
      apiKeyLength: MAILERLITE_API_KEY?.length || 0,
      groupId: MAILERLITE_GROUP_ID,
    });

    // Log the request payload (without sensitive data)
    console.log("MailerLite Request Payload:", {
      email: subscriber.email,
      fields: subscriber.fields,
      hasGroups: !!subscriber.groups,
      groupsCount: subscriber.groups?.length || 0,
    });

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

    console.log("MailerLite API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });

    return response.status === 200 || response.status === 201;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("MailerLite API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("Unknown error adding subscriber to MailerLite:", error);
    }
    return false;
  }
}
