const modules = import.meta.glob('./*.md', {
  eager: true, 
  query: '?raw', 
  import: 'default' 
});

export const IMPRINT_LOCALE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, content]) => {
    const localeKey = path.split('/').pop()?.replace('.md', '').replace("imprint-", "") || '';
    return [localeKey, content as string];
  })
);