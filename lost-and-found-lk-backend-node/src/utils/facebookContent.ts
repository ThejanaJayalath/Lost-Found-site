import { IPost } from "../models/Post";

const CLIENT_URL = process.env.CLIENT_URL || "https://lost-found-site.vercel.app";

/**
 * Generates the Facebook post caption based on the post type (LOST/FOUND).
 */
export const generatePostCaption = (post: IPost): string => {
    const publicReportUrl = `${CLIENT_URL}/post/${post._id}`;
    const dateStr = new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (post.status === "LOST") {
        return `🔴 LOST ITEM ALERT

📦 Item: ${post.title}
📍 Location: ${post.location}
📅 Date: ${dateStr}

📝 Description:
${post.description}

If found, please contact via Lost & Found LK.
🔗 ${publicReportUrl}

#LostAndFoundLK #SriLanka`;
    } else {
        // FOUND or RESOLVED (though usually we only post active FOUND items)
        return `🟢 FOUND ITEM NOTICE

📦 Item: ${post.title}
📍 Found at: ${post.location}
📅 Date: ${dateStr}

📝 Details:
${post.description}

Claim here:
🔗 ${publicReportUrl}

#FoundItem #LostAndFoundLK`;
    }
};
