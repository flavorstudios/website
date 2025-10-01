import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Extensions } from "@tiptap/core";

export function createSharedTiptapExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: false,
      underline: false,
    }),
    TextStyle,
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ];
}