
// 'use client';

// import Script from 'next/script';

// export default function GhlStickyForm() {
//   return (
//     <>
//       <iframe
//         src="https://link.clinicalmarketer.com/widget/form/JaIRNs6LlJ0QqpFaxSLk"
//         style={{
//           display: 'none',
//           width: '100%',
//           height: '100%',
//           border: 'none',
//           borderRadius: '4px',
//         }}
//         id="sticky-sidebar-left-JaIRNs6LlJ0QqpFaxSLk"
//         data-layout={`{'id':'STICKY_SIDEBAR','minimizedTitle':'Contact us','isLeftAligned':true,'isRightAligned':false,'allowMinimize':true,'buttonColor':'#101828','buttonType':'text','buttonSize':'medium','buttonIcon':'chat','cornerRadius':{'tl':8,'tr':8,'bl':8,'br':8},'fontSize':16}`}
//         data-trigger-type="alwaysShow"
//         data-trigger-value=""
//         data-activation-type="alwaysActivated"
//         data-activation-value=""
//         data-deactivation-type="neverDeactivate"
//         data-deactivation-value=""
//         data-form-name="Website Availability & Pricing Form"
//         data-height="959"
//         data-layout-iframe-id="sticky-sidebar-left-JaIRNs6LlJ0QqpFaxSLk"
//         data-form-id="JaIRNs6LlJ0QqpFaxSLk"
//         data-cookie-consent="true"
//         data-cookie-consent-provider="auto"
//         title="Website Availability & Pricing Form"
//       />

//       <Script
//         src="https://link.clinicalmarketer.com/js/form_embed.js"
//         strategy="afterInteractive"
//       />
//     </>
//   );
// }

'use client';

import Script from 'next/script';

export default function GhlStickyForm() {
  return (
    <>
      <iframe
        src="https://link.clinicalmarketer.com/widget/form/JaIRNs6LlJ0QqpFaxSLk"
        style={{
          display: 'none',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '4px',
        }}
        id="sticky-sidebar-left-JaIRNs6LlJ0QqpFaxSLk"
        data-layout={`{'id':'STICKY_SIDEBAR','minimizedTitle':'Contact us','isLeftAligned':true,'isRightAligned':false,'allowMinimize':true,'buttonColor':'#101828','buttonType':'text','buttonSize':'medium','buttonIcon':'chat','cornerRadius':{'tl':8,'tr':8,'bl':8,'br':8},'fontSize':16}`}
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Website Availability & Pricing Form"
        data-height="959"
        data-layout-iframe-id="sticky-sidebar-left-JaIRNs6LlJ0QqpFaxSLk"
        data-form-id="JaIRNs6LlJ0QqpFaxSLk"
        data-cookie-consent="true"
        data-cookie-consent-provider="auto"
        title="Website Availability & Pricing Form"
      />

      <Script
        src="https://link.clinicalmarketer.com/js/form_embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}
