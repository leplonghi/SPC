import { useEffect } from 'react';

const SITE_NAME = 'SPC Maranhão';

/** Define o título da aba para cada página e restaura o padrão ao sair. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Superintendência do Patrimônio Cultural`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
