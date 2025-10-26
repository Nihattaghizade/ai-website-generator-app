"use client";

export default function HydrationFix() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            if (document.body.hasAttribute('cz-shortcut-listen')) {
              document.body.removeAttribute('cz-shortcut-listen');
            }
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'cz-shortcut-listen') {
                  document.body.removeAttribute('cz-shortcut-listen');
                }
              });
            });
            observer.observe(document.body, {
              attributes: true,
              attributeFilter: ['cz-shortcut-listen']
            });
          })();
        `,
      }}
    />
  );
}
