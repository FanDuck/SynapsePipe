import {
  Images,
  LayoutDashboard,
  LibraryBig,
  Settings2,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: "prompts" | "assets" | "ai";
  shortcut?: string;
};

export const primaryNav: NavItem[] = [
  {
    href: "/",
    label: "总览",
    description: "工作台状态与最近活动",
    icon: LayoutDashboard,
    shortcut: "G O",
  },
  {
    href: "/prompts",
    label: "Prompt 库",
    description: "结构化创意资产与看板",
    icon: LibraryBig,
    badge: "prompts",
    shortcut: "G P",
  },
  {
    href: "/generate",
    label: "AI 扩写台",
    description: "把灵感扩写为大师级 Prompt",
    icon: WandSparkles,
    badge: "ai",
    shortcut: "G A",
  },
  {
    href: "/gallery",
    label: "资产画廊",
    description: "生成的图像、视频与参数",
    icon: Images,
    badge: "assets",
    shortcut: "G L",
  },
];

export const secondaryNav: NavItem[] = [
  {
    href: "/settings",
    label: "设置",
    description: "模型服务、数据与偏好",
    icon: Settings2,
    shortcut: "G S",
  },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
