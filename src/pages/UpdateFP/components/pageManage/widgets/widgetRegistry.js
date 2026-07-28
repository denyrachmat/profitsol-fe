import { defineAsyncComponent } from "vue";

export default {
  text: {
    meta: { label: "Text", icon: "text_fields", color: "blue" },
    defaultContent: () => ({ body: "<p>Enter your text here...</p>" }),
    PropertiesComponent: defineAsyncComponent(() => import("./text/TextProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./text/TextRenderer.vue")),
  },
  html: {
    meta: { label: "HTML", icon: "code", color: "orange" },
    defaultContent: () => ({ body: "" }),
    PropertiesComponent: defineAsyncComponent(() => import("./html/HtmlProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./html/HtmlRenderer.vue")),
  },
  image: {
    meta: { label: "Image", icon: "image", color: "green" },
    defaultContent: () => ({ src: "", alt: "", caption: "", width: "100", height: null }),
    PropertiesComponent: defineAsyncComponent(() => import("./image/ImageProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./image/ImageRenderer.vue")),
  },
  button: {
    meta: { label: "Button", icon: "smart_button", color: "purple" },
    defaultContent: () => ({
      label: "Click Me", url: "#", color: "primary", customColor: null,
      labelColor: null, customLabelColor: null,
      variant: "flat", size: "md", align: "left",
      btnWidth: "auto", customWidth: null, customHeight: null,
      icon: null, iconPosition: "left",
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./button/ButtonProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./button/ButtonRenderer.vue")),
  },
  divider: {
    meta: { label: "Divider", icon: "horizontal_rule", color: "grey" },
    defaultContent: () => ({ style: "solid", thickness: 1, color: "#e0e0e0", marginY: 16 }),
    PropertiesComponent: defineAsyncComponent(() => import("./divider/DividerProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./divider/DividerRenderer.vue")),
  },
  spacer: {
    meta: { label: "Spacer", icon: "height", color: "grey" },
    defaultContent: () => ({ height: 40 }),
    PropertiesComponent: defineAsyncComponent(() => import("./spacer/SpacerProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./spacer/SpacerRenderer.vue")),
  },
  columns: {
    meta: { label: "Columns", icon: "view_column", color: "indigo" },
    defaultContent: () => ({
      count: 2,
      columns: [{ width: 6, children: [] }, { width: 6, children: [] }],
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./columns/ColumnsProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./columns/ColumnsRenderer.vue")),
  },
  carousel: {
    meta: { label: "Carousel", icon: "view_carousel", color: "pink" },
    defaultContent: () => ({
      slides: [{ children: [] }, { children: [] }],
      slideCount: 2,
      height: "300px",
      navigation: true,
      arrows: true,
      swipeable: true,
      autoplay: false,
      autoplaySpeed: 5,
      infinite: true,
      transition: "slide-right",
      slideBackground: "",
      controlColor: "primary",
      padding: true,
      class: "",
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./carousel/CarouselProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./carousel/CarouselRenderer.vue")),
  },
  posts: {
    meta: { label: "Posts Feed", icon: "post_add", color: "teal" },
    defaultContent: () => ({
      title: "", desc: "", category: [], mode: "last",
      layout: "list", orderBy: "created_at", order: "desc",
      maxShow: 5, perSlide: 1,
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./posts/PostsProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./posts/PostsRenderer.vue")),
  },
  files: {
    meta: { label: "Files", icon: "folder_open", color: "amber" },
    defaultContent: () => ({
      title: "", layout: "grid", orderBy: "created_at",
      order: "desc", maxShow: 5,
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./files/FilesProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./files/FilesRenderer.vue")),
  },
  embed: {
    meta: { label: "Embed", icon: "picture_in_picture", color: "red" },
    defaultContent: () => ({ url: "", ratio: "16:9" }),
    PropertiesComponent: defineAsyncComponent(() => import("./embed/EmbedProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./embed/EmbedRenderer.vue")),
  },
  accordion: {
    meta: { label: "Accordion", icon: "expand_more", color: "cyan" },
    defaultContent: () => ({ items: [{ title: "Section 1", body: "Content here..." }] }),
    PropertiesComponent: defineAsyncComponent(() => import("./accordion/AccordionProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./accordion/AccordionRenderer.vue")),
  },
  tabs: {
    meta: { label: "Tabs", icon: "tab", color: "deep-purple" },
    defaultContent: () => ({ tabs: [{ title: "Tab 1", body: "Content here..." }] }),
    PropertiesComponent: defineAsyncComponent(() => import("./tabs/TabsProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./tabs/TabsRenderer.vue")),
  },
  countdown: {
    meta: { label: "Countdown", icon: "timer", color: "brown" },
    defaultContent: () => ({ label: "Coming Soon", targetDate: "", theme: "light" }),
    PropertiesComponent: defineAsyncComponent(() => import("./countdown/CountdownProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./countdown/CountdownRenderer.vue")),
  },
  qrcode: {
    meta: { label: "QR Code", icon: "qr_code", color: "black" },
    defaultContent: () => ({
      text: "https://example.com", size: 200,
      foreground: "#000000", background: "#ffffff",
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./qrcode/QrcodeProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./qrcode/QrcodeRenderer.vue")),
  },
  sharepoint: {
    meta: { label: "SharePoint Files", icon: "folder_shared", color: "light-blue" },
    defaultContent: () => ({
      title: "", source: "onedrive", siteName: "",
      folderPath: "", layout: "list",
    }),
    PropertiesComponent: defineAsyncComponent(() => import("./sharepoint/SharePointProperties.vue")),
    RendererComponent: defineAsyncComponent(() => import("./sharepoint/SharePointRenderer.vue")),
  },
};
