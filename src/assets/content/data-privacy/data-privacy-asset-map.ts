const modules = import.meta.glob('./*.md', {
  eager: true, 
  query: '?raw', 
  import: 'default' 
});

export const DATA_PRIVACY_LOCALE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, content]) => {
    const localeKey = path.split('/').pop()?.replace('.md', '').replace("data-privacy-", "") || '';
    return [localeKey, content as string];
  })
);
