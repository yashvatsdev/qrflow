import {
  createElement,
  type AnchorHTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
export function usePathname() {
  return "/dashboard/codes";
}
export function useRouter() {
  return {
    refresh() {
      window.dispatchEvent(new Event("fixture-refresh"));
    },
    push(href: string) {
      window.dispatchEvent(
        new CustomEvent("fixture-navigation", { detail: href }),
      );
    },
  };
}
export function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
export function Image({
  unoptimized,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) {
  void unoptimized;
  return createElement("img", { ...props, alt: props.alt || "" });
}
