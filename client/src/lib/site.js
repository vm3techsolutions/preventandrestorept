// Developer-managed clinic details (verified from preventandrestorept.com). Edit here, not in the CMS.
export const SITE = {
  name: 'Prevent & Restore Physical Therapy',
  shortName: 'Prevent & Restore PT',
  url: String(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, ''),
  phone: '(404) 907-2734',
  phoneHref: 'tel:+14049072734',
  email: 'raywaters@preventandrestorept.com',
  address: { street: '137 Johnson Ferry Rd, Suite 2220', city: 'Marietta', region: 'GA', postal: '30068' },
  directions: 'Located in the Paper Mill Village complex. Drive past the Emory building toward the back parking lot; we are on the second floor of the two-story brick building.',
  mapsUrl: 'https://www.google.com/maps/place/Prevent+%26+Restore+Physical+Therapy/@33.9694882,-84.4093158,17z/data=!3m1!4b1!4m6!3m5!1s0x88f50d63be7e0237:0x10b0a78bd09939aa!8m2!3d33.9694882!4d-84.4093158!16s%2Fg%2F11wtmf6kxp',
  mapEmbed: 'https://www.google.com/maps?q=Prevent+%26+Restore+Physical+Therapy,+137+Johnson+Ferry+Rd+Suite+2220,+Marietta,+GA+30068&output=embed',
  ghl: {
    formId: 'BEGJvO6gNANPojCjlhqB',
    name: 'Website Request Appointment Form',
    src: 'https://link.clinicalmarketer.com/widget/form/BEGJvO6gNANPojCjlhqB',
    script: 'https://link.clinicalmarketer.com/js/form_embed.js',
    height: 1077,
  },
  appointmentHref: '/contact/#request-appointment',
  // Google Business listing; used for "Read more reviews on Google".
  googleReviewsUrl: 'https://www.google.com/maps/place/Prevent+%26+Restore+Physical+Therapy/@33.9694882,-84.4093158,17z/data=!4m8!3m7!1s0x88f50d63be7e0237:0x10b0a78bd09939aa!8m2!3d33.9694882!4d-84.4093158!9m1!1b1!16s%2Fg%2F11wtmf6kxp',
};

// Only platforms with a URL are shown. Facebook needs the client's profile URL; Yelp is a temporary Yelp search link.
export const SOCIALS = [
  { key: 'facebook', label: 'Facebook', url: '' },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/preventandrestorept' },
  { key: 'google', label: 'Google Business Profile', url: SITE.mapsUrl },
  { key: 'yelp', label: 'Yelp', url: 'https://www.yelp.com/search?find_desc=Prevent+%26+Restore+Physical+Therapy&find_loc=Marietta%2C+GA' },
  { key: 'youtube', label: 'YouTube', url: '' },
].filter((s) => s.url);

// PLACEHOLDER metrics requested by the client until verified numbers are supplied. Edit here.
export const METRICS = [
  { value: 60, suffix: ' min', label: 'One-on-one sessions with a Doctor of Physical Therapy' },
  { value: 10, suffix: '+', label: 'Years of clinical experience' },
  { value: 1000, suffix: '+', label: 'Patients helped' },
  { value: 100, suffix: '%', label: 'Personalised treatment plans' },
];

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Services', href: '/services/' },
  { label: 'What We Treat', href: '/what-we-treat/' },
  { label: 'Blogs', href: '/blogs/' },
  { label: 'Contact', href: '/contact/' },
];

export const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions/' },
];

export const fullAddress = () => `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postal}`;
