// PWA manifest assets — imported here so Vite includes them in the compiled
// bundle and the Caffeine build pipeline serves them with image/png content-type.
import phonexIcon192 from "./assets/phonex-icon-192.png";
import phonexIcon512 from "./assets/phonex-icon-512.png";
import screenshotChats from "./assets/screenshot-chats.png";
import screenshotLogin from "./assets/screenshot-login.png";
import screenshotMobile2 from "./assets/screenshot-mobile-2.png";
import screenshotPocket from "./assets/screenshot-pocket.png";

// These resolved URLs are used by the app and ensure assets are bundled.
export const PWA_ASSETS = {
  phonexIcon192,
  phonexIcon512,
  screenshotLogin,
  screenshotChats,
  screenshotPocket,
  screenshotMobile2,
} as const;

// Inject the manifest dynamically using Vite-resolved (bundled) asset URLs.
// This ensures the browser fetches icons/screenshots from paths that return
// image/png content-type, not text/html.
export function injectPWAManifest() {
  // Remove the static manifest link if present
  const existing = document.querySelector('link[rel="manifest"]');
  if (existing) existing.remove();

  const manifest = {
    id: "phonex-app",
    name: "Phonex - Rise. Connect. Thrive.",
    short_name: "Phonex",
    description:
      "Phonex is a secure, all-in-one communication and payment app.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "portrait",
    background_color: "#0a1628",
    theme_color: "#1e40af",
    lang: "en",
    dir: "ltr",
    categories: ["communication", "finance", "social"],
    iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",
    prefer_related_applications: false,
    related_applications: [],
    launch_handler: { client_mode: "auto" },
    file_handlers: [
      {
        action: "/",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
          "video/*": [".mp4", ".webm"],
        },
      },
    ],
    protocol_handlers: [{ protocol: "web+phonex", url: "/?action=%s" }],
    share_target: {
      action: "/",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [{ name: "media", accept: ["image/*", "video/*"] }],
      },
    },
    widgets: [
      {
        name: "Phonex Quick Actions",
        tag: "phonex-quick",
        ms_ac_template: "/widgets/template.json",
        data: "/widgets/data.json",
        description: "Quick access to Phonex chats and wallet",
        screenshots: [],
        icons: [{ src: phonexIcon192, sizes: "1024x1024" }],
      },
    ],
    edge_side_panel: { preferred_width: 400 },
    note_taking: { new_note_url: "/?tab=chats" },
    scope_extensions: [],
    tab_strip: { home_tab: { url: "/" } },
    icons: [
      {
        src: phonexIcon192,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: phonexIcon512,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: phonexIcon512,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Open Chats",
        short_name: "Chats",
        description: "Go to your messages",
        url: "/?tab=chats",
        icons: [{ src: phonexIcon192, sizes: "1024x1024", type: "image/png" }],
      },
      {
        name: "Open Pocket",
        short_name: "Pocket",
        description: "Go to your wallet",
        url: "/?tab=pocket",
        icons: [{ src: phonexIcon192, sizes: "1024x1024", type: "image/png" }],
      },
    ],
    screenshots: [
      {
        src: screenshotLogin,
        sizes: "704x1520",
        type: "image/png",
        form_factor: "narrow",
        label: "Phonex login screen",
      },
      {
        src: screenshotChats,
        sizes: "704x1520",
        type: "image/png",
        form_factor: "narrow",
        label: "Phonex Chats tab",
      },
      {
        src: screenshotPocket,
        sizes: "704x1520",
        type: "image/png",
        form_factor: "narrow",
        label: "Phonex Pocket wallet",
      },
      {
        src: screenshotMobile2,
        sizes: "704x1520",
        type: "image/png",
        form_factor: "narrow",
        label: "Phonex home screen",
      },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], {
    type: "application/manifest+json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = url;
  document.head.appendChild(link);
}
