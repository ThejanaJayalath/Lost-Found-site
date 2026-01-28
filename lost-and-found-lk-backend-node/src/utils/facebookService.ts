import { IPost } from "../models/Post";
import { generatePostCaption } from "./facebookContent";
import { Settings } from "../models/Settings";

// Graph API Version
const GRAPH_API_VERSION = "v22.0";

/**
 * Helper to get the Facebook Page Access Token.
 *
 * Priority:
 * 1. Environment variable (FACEBOOK_PAGE_ACCESS_TOKEN) - for backward compatibility
 * 2. Settings collection (key: "facebookIntegration", value.pageAccessToken)
 */
export const getFacebookPageAccessToken = async (): Promise<string> => {
    const fromEnv = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (fromEnv) {
        return fromEnv;
    }

    const settings = await Settings.findOne({ key: "facebookIntegration" }).lean();
    const token = settings && (settings as any).value?.pageAccessToken;

    if (!token || typeof token !== "string") {
        throw new Error("Facebook page access token is not configured. Please update it in the admin panel.");
    }

    return token;
};

export const postToFacebook = async (post: IPost, customCaption?: string): Promise<string> => {
    const FACEBOOK_PAGE_ACCESS_TOKEN = await getFacebookPageAccessToken();

    const caption = customCaption || generatePostCaption(post);
    let url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/feed`;
    let body: any = {
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        message: caption
    };

    // Helper function to check if URL is valid HTTP/HTTPS
    const isValidHttpUrl = (urlString: string): boolean => {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    };

    // If images exist and are valid URLs, use the first image and the /photos endpoint
    if (post.images && post.images.length > 0) {
        const imageUrl = post.images[0];

        // Validate that the image URL is a proper HTTP/HTTPS URL
        if (imageUrl && isValidHttpUrl(imageUrl)) {
            url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/photos`;
            body = {
                access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
                url: imageUrl,
                caption: caption,
            };
        } else {
            console.warn(`Invalid image URL for Facebook: ${imageUrl}. Posting as text-only.`);
            // Fall back to text-only post if image URL is invalid
        }
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
