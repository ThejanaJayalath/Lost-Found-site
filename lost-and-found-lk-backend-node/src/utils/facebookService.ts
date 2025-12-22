import { IPost } from "../models/Post";
import { generatePostCaption } from "./facebookContent";

const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
// Graph API Version
const GRAPH_API_VERSION = "v22.0";

export const postToFacebook = async (post: IPost): Promise<string> => {
    if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
        throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN is not configured");
    }

    const caption = generatePostCaption(post);
    let url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/feed`;
    let body: any = {
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        message: caption
    };

    // If images exist, use the first image and the /photos endpoint
    if (post.images && post.images.length > 0) {
        url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/photos`;
        body = {
            access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
            url: post.images[0], // Use the first image
            caption: caption,
            // 'published': true is default, but good to be explicit if needed
        };
    }

    // Prepare form data or JSON. 
    // Graph API accepts JSON for these endpoints usually, or form-data. 
    // fetch with Content-Type: application/json works for simple args.

    // NOTE: 'message' is used for /feed, 'caption' is used for /photos

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data: any = await response.json();

    if (!response.ok) {
        console.error("Facebook API Error:", data);
        throw new Error(data?.error?.message || "Failed to post to Facebook");
    }

    // Returns the Post ID (or Photo ID)
    return data.id;
};
