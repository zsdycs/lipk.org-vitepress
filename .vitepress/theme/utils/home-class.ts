export const HOME_ROUTE_PATH = "/";
export const HOME_ENTRY_FILE = "index.md";
export const HOME_HTML_CLASS = "home";
export const HOME_APP_HOME_CLASS = "index";
export const HOME_APP_DEFAULT_CLASS = "paramount";

export type ClassMutation = {
  add: string[];
  remove: string[];
};

export const isHomeRoutePath = (path: string) => path === HOME_ROUTE_PATH;

export const isHomeEntryFile = (relativePath?: string | null) =>
  relativePath === HOME_ENTRY_FILE;

export const getHtmlClassMutation = (isHome: boolean): ClassMutation => ({
  add: isHome ? [HOME_HTML_CLASS] : [],
  remove: isHome ? [] : [HOME_HTML_CLASS],
});

export const getAppClassMutation = (isHome: boolean): ClassMutation => ({
  add: [isHome ? HOME_APP_HOME_CLASS : HOME_APP_DEFAULT_CLASS],
  remove: [isHome ? HOME_APP_DEFAULT_CLASS : HOME_APP_HOME_CLASS],
});

const HTML_TAG_REGEX = /<html\b([^>]*)>/i; // matches opening <html> tag
const CLASS_ATTR_REGEX = /\sclass=(["'])(.*?)\1/i; // matches class="..." or class='...'
const APP_ID_PATTERN = /\sid=(["'])app\1/i; // matches id="app" or id='app'

const splitClasses = (value: string) =>
  value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

const mergeClassAttribute = (attrs: string, mutation: ClassMutation) => {
  const classMatch = attrs.match(CLASS_ATTR_REGEX);
  const attrsWithoutClass = classMatch
    ? attrs.replace(classMatch[0], "")
    : attrs;
  const initialClasses = classMatch ? splitClasses(classMatch[2]) : [];
  const classSet = new Set(initialClasses);

  mutation.remove.forEach((cls) => classSet.delete(cls));
  mutation.add.forEach((cls) => {
    if (cls) {
      classSet.add(cls);
    }
  });

  const classValue = Array.from(classSet).join(" ");
  const classAttr = classValue ? ` class="${classValue}"` : "";

  return `${attrsWithoutClass}${classAttr}`;
};

export const applyClassMutationToHtml = (
  code: string,
  mutation: ClassMutation
) =>
  code.replace(HTML_TAG_REGEX, (match, attrs) => {
    const updatedAttrs = mergeClassAttribute(attrs, mutation);
    return `<html${updatedAttrs}>`;
  });

export const applyClassMutationToAppRoot = (
  code: string,
  mutation: ClassMutation
) => {
  const divTagRegex = /<div\b([^>]*)>/gi;
  let replaced = false;
  return code.replace(divTagRegex, (match, attrs) => {
    if (replaced || !APP_ID_PATTERN.test(attrs)) {
      return match;
    }
    replaced = true;
    const updatedAttrs = mergeClassAttribute(attrs, mutation);
    return `<div${updatedAttrs}>`;
  });
};
