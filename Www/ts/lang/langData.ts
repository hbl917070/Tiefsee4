import { sw } from "./settings";
import { motionPhoto } from "./motion-photo";
import { videoToolbar } from "./video-toolbar";
import { menu } from "./menu";
import { bulkView } from "./bulk-view";
import { favorites } from "./favorites";
import { msg } from "./messages";
import { exif } from "./exif";
import { script } from "./scripts";

const langData = {
    ...sw,
    ...motionPhoto,
    ...videoToolbar,
    ...menu,
    ...bulkView,
    ...favorites,
    ...msg,
    ...exif,
    ...script,
};

globalThis.langData = langData;
