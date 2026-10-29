// Draft copy for client review (needsReview = true). Cautious, patient-friendly, no outcome claims.
const S = (heading, description, symptoms, howPtHelps, services = ['physical-therapy']) => ({ heading, description, symptoms, howPtHelps, services });

const REGIONS = [
  {
    slug: 'neck-pain', title: 'Neck Pain', reuse: null, seoTitle: 'Neck Pain Physical Therapy | Prevent & Restore PT',
    meta: 'One-on-one physical therapy in Marietta, GA for neck pain, including spondylosis, whiplash, herniated discs and neck strain.',
    intro: 'Neck pain can make it hard to turn your head, sleep or concentrate at work. We look for what is driving your symptoms and build a plan to help you move more comfortably.',
    sections: [
      S('Spondylosis (neck)', 'Cervical spondylosis describes age-related changes to the discs and joints of the neck.', 'Neck stiffness, aching that may spread to the shoulders, and reduced range of motion.', 'Treatment may include hands-on care, mobility work and strengthening of the neck and upper back to support daily activities.', ['physical-therapy', 'dry-needling']),
      S('Whiplash', 'Whiplash is a neck injury caused by a sudden back-and-forth movement, often after a car accident or fall.', 'Neck pain and stiffness, headaches, and discomfort when turning the head.', 'We use a graded approach to restore comfortable movement and gradually rebuild neck and shoulder strength.'),
      S('Herniated disc (neck)', 'A herniated disc in the neck happens when disc material presses on nearby structures, sometimes irritating a nerve.', 'Neck pain, and possibly pain, tingling or weakness travelling into the arm.', 'Care may focus on positions and movements that ease symptoms, nerve mobility, and progressive strengthening.', ['physical-therapy', 'dry-needling']),
      S('Neck strain', 'A neck strain is an overstretch or small tear in the neck muscles, often from posture, lifting or sleeping awkwardly.', 'Muscle tightness, tenderness and pain with certain movements.', 'Hands-on treatment, mobility exercises and posture strategies may help you return to normal activity.', ['physical-therapy', 'dry-needling']),
    ],
  },
  {
    slug: 'shoulder-pain', title: 'Shoulder Pain', reuse: 'shoulder-neck-pain', seoTitle: 'Shoulder Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy for shoulder pain in Marietta, GA: instability, impingement, frozen shoulder, rotator cuff tears, biceps and AC joint pain.',
    intro: 'Your shoulder needs both mobility and stability for reaching, lifting and throwing. We assess how your shoulder moves and loads to guide a personalized plan.',
    sections: [
      S('Shoulder instability', 'Shoulder instability means the ball of the shoulder moves more than it should within the socket.', 'A feeling of slipping or giving way, apprehension with overhead movements, and pain.', 'Strengthening the rotator cuff and shoulder blade muscles may improve control and confidence.'),
      S('Little League Arm', 'Little League shoulder is an overuse injury to the growth plate of the upper arm in young throwing athletes.', 'Shoulder pain during or after throwing.', 'We focus on rest from aggravating throwing, then a gradual return guided by strength and throwing mechanics.', ['physical-therapy', 'injury-prevention-screening']),
      S('Shoulder impingement', 'Impingement describes pain when tendons in the shoulder are irritated during arm elevation.', 'Pain lifting the arm overhead, reaching behind you or sleeping on the shoulder.', 'Treatment may include mobility, shoulder blade control and progressive loading of the rotator cuff.'),
      S('Adhesive capsulitis', 'Adhesive capsulitis (frozen shoulder) is a gradual stiffening of the shoulder joint capsule.', 'Progressive stiffness, pain and difficulty with everyday tasks like dressing.', 'Gentle, consistent mobility work and pain management strategies may help you keep and regain movement over time.'),
      S('Biceps tendinopathy', 'Biceps tendinopathy is irritation of the biceps tendon at the front of the shoulder.', 'Pain at the front of the shoulder, often with lifting or reaching.', 'A graded tendon-loading program and activity modification are commonly used.'),
      S('Rotator cuff tears', 'The rotator cuff is a group of muscles that help stabilize and move the shoulder; tears can be partial or full thickness.', 'Pain, weakness lifting the arm, and night pain.', 'Depending on the tear, care may focus on strengthening surrounding muscles or on rehabilitation after surgery.', ['physical-therapy', 'blood-flow-restriction-therapy']),
      S('AC joint pain', 'The acromioclavicular (AC) joint is where the collarbone meets the top of the shoulder blade.', 'Pain on top of the shoulder, especially reaching across the body or overhead.', 'We may use load management and strengthening to help reduce irritation and restore function.'),
    ],
  },
  {
    slug: 'elbow-pain', title: 'Elbow Pain', reuse: null, seoTitle: 'Elbow Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy in Marietta, GA for golfer’s elbow, tennis elbow and Little League elbow, with one-on-one care.',
    intro: 'Elbow pain often builds up from repeated gripping, lifting or throwing. We look at the whole arm to understand the load on your elbow.',
    sections: [
      S('Golfer’s elbow', 'Golfer’s elbow (medial epicondylalgia) is irritation of the tendons on the inner side of the elbow.', 'Pain on the inside of the elbow with gripping, lifting or swinging.', 'A progressive tendon-loading program and grip strategies may help.', ['physical-therapy', 'dry-needling', 'shockwave-therapy']),
      S('Tennis elbow', 'Tennis elbow (lateral epicondylalgia) is irritation of the tendons on the outer side of the elbow.', 'Pain on the outside of the elbow when gripping, lifting or typing.', 'Care commonly includes graded strengthening and activity modification.', ['physical-therapy', 'dry-needling', 'shockwave-therapy']),
      S('Little League elbow', 'Little League elbow is an overuse injury to the inner elbow growth plate in young throwers.', 'Inner elbow pain during or after throwing.', 'Rest from throwing followed by a gradual return-to-throw plan and whole-body strength work.', ['physical-therapy', 'injury-prevention-screening']),
    ],
  },
  {
    slug: 'low-back-pain', title: 'Low Back Pain', reuse: 'back-sciatica-pain', seoTitle: 'Low Back Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Low back pain and sciatica physical therapy in Marietta, GA for spondylosis, spondylolisthesis, disc and joint conditions.',
    intro: 'Low back pain is very common and can limit sitting, lifting and sleep. We aim to find what is aggravating your back and help you build strength and confidence in movement.',
    sections: [
      S('Spondylosis (low back)', 'Lumbar spondylosis refers to age-related changes in the discs and joints of the lower spine.', 'Low back stiffness, especially in the morning, and aching with prolonged standing or sitting.', 'Movement, strengthening of the trunk and hips, and pacing strategies may help keep you active.'),
      S('Spondylolisthesis', 'Spondylolisthesis is when one vertebra shifts forward relative to the one below it.', 'Low back pain that may increase with standing or arching backward, and sometimes leg symptoms.', 'Care may focus on trunk and hip strength and movement strategies that reduce irritation.'),
      S('Degenerative disc disease', 'Degenerative disc disease describes changes in the discs that cushion the spine.', 'Low back pain that may vary with posture and activity.', 'A plan built around graded activity, strengthening and mobility may help manage symptoms.'),
      S('Degenerative joint disease', 'Degenerative joint disease of the spine affects the small facet joints of the lower back.', 'Stiffness and pain with bending backward or twisting.', 'Hands-on treatment, mobility and strengthening may help improve comfort with movement.'),
      S('Herniated disc (low back)', 'A herniated disc in the low back can irritate nearby nerves, sometimes causing sciatica.', 'Back pain and possibly pain, numbness or tingling travelling down the leg.', 'Treatment may include positions that ease symptoms, nerve mobility and progressive strengthening.', ['physical-therapy', 'dry-needling']),
    ],
  },
  {
    slug: 'hip-pain', title: 'Hip Pain', reuse: null, seoTitle: 'Hip Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy for hip pain in Marietta, GA, including hip bursitis, piriformis syndrome, labral tears and hip osteoarthritis.',
    intro: 'Hip pain can affect walking, stairs, sleep and sport. We assess how your hips and trunk work together to guide your care.',
    sections: [
      S('Hip bursitis', 'Pain on the outside of the hip is often linked to irritated tendons and bursa (greater trochanteric pain).', 'Pain on the outer hip, especially lying on that side or climbing stairs.', 'Load management and progressive hip strengthening are commonly used.', ['physical-therapy', 'shockwave-therapy']),
      S('Piriformis syndrome', 'The piriformis is a deep hip muscle that can irritate the sciatic nerve in some people.', 'Buttock pain that may travel down the leg, often worse with sitting.', 'Care may include hands-on treatment, nerve mobility and hip strengthening.', ['physical-therapy', 'dry-needling']),
      S('Hip labral tears', 'The labrum is a ring of cartilage around the hip socket that can be torn.', 'Groin or hip pain, clicking or catching, and pain with deep bending.', 'Strengthening and movement strategies may help, including rehabilitation after surgery when needed.'),
      S('Hip osteoarthritis', 'Hip osteoarthritis is wear-related change in the hip joint.', 'Groin or hip stiffness and pain with walking or getting up from a chair.', 'Exercise, strengthening and activity pacing are commonly recommended to support function.'),
    ],
  },
  {
    slug: 'knee-pain', title: 'Knee Pain', reuse: 'knee-pain', seoTitle: 'Knee Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Knee pain physical therapy in Marietta, GA for IT band syndrome, patellofemoral pain, jumper’s knee, meniscus and ligament injuries.',
    intro: 'Knee pain can make stairs, squatting and running difficult. We look at the hip, knee and foot together to understand what is loading your knee.',
    sections: [
      S('IT band syndrome', 'IT band syndrome causes pain on the outside of the knee, common in runners and cyclists.', 'Outer knee pain that builds during running or cycling.', 'Training load changes and hip and knee strengthening are commonly used.', ['physical-therapy', 'remote-strength-and-conditioning']),
      S('Patellofemoral pain syndrome', 'Patellofemoral pain is pain around or behind the kneecap.', 'Pain with stairs, squatting, kneeling or sitting for long periods.', 'Progressive strengthening of the hip and thigh and load management may help.'),
      S('Patellar tendinopathy (jumper’s knee)', 'Patellar tendinopathy is irritation of the tendon below the kneecap, common in jumping sports.', 'Pain just below the kneecap with jumping, squatting or stairs.', 'A graded tendon-loading program is commonly used.', ['physical-therapy', 'shockwave-therapy']),
      S('Meniscus tears', 'The meniscus is cartilage that cushions the knee and can tear with twisting or wear.', 'Knee pain, swelling, and sometimes catching or locking.', 'Strengthening and gradual return to activity, including rehabilitation after surgery when needed.', ['physical-therapy', 'blood-flow-restriction-therapy']),
      S('Ligamentous tears/strains', 'Knee ligaments such as the ACL, MCL and LCL can be sprained or torn.', 'Pain, swelling and a feeling of instability.', 'Rehabilitation focuses on strength, control and a structured return to sport.', ['physical-therapy', 'blood-flow-restriction-therapy']),
    ],
  },
  {
    slug: 'ankle-foot-pain', title: 'Ankle/Foot Pain', reuse: 'foot-ankle-pain', seoTitle: 'Foot and Ankle Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Foot and ankle physical therapy in Marietta, GA for plantar fasciitis, Achilles tendinopathy, posterior tibialis dysfunction, turf toe and more.',
    intro: 'Your feet and ankles absorb load with every step. We assess how you stand, walk and move to help reduce pain and keep you active.',
    sections: [
      S('Plantar fasciitis', 'Plantar fasciitis (plantar heel pain) is irritation of the tissue along the bottom of the foot.', 'Heel pain, often worst with the first steps in the morning.', 'Strengthening, load management and footwear strategies are commonly used.', ['physical-therapy', 'shockwave-therapy', 'dry-needling']),
      S('Achilles tendinopathy', 'Achilles tendinopathy is irritation of the tendon at the back of the ankle.', 'Pain and stiffness at the back of the heel, especially after rest or activity.', 'A progressive calf and tendon loading program is commonly used.', ['physical-therapy', 'shockwave-therapy']),
      S('Posterior tibialis dysfunction', 'The posterior tibialis tendon supports the arch of the foot.', 'Pain on the inner ankle and a gradually flattening arch.', 'Strengthening the foot and lower leg and supportive strategies may help.'),
      S('Turf toe', 'Turf toe is a sprain of the big toe joint, often from pushing off in sport.', 'Pain and swelling at the base of the big toe.', 'Protected loading followed by a gradual return to running and cutting.'),
      S('Lisfranc injury', 'A Lisfranc injury affects the joints and ligaments in the middle of the foot.', 'Midfoot pain, swelling and difficulty bearing weight.', 'Rehabilitation, often after medical management, rebuilds strength and walking tolerance.'),
      S('Bunions', 'A bunion is a bony bump at the base of the big toe.', 'Pain at the big toe joint, especially in tight shoes.', 'Foot strengthening, mobility and footwear advice may help with comfort.'),
    ],
  },
  {
    slug: 'headaches', title: 'Headaches', reuse: 'headaches', seoTitle: 'Headache Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy in Marietta, GA for cervicogenic and tension-type headaches linked to the neck and posture.',
    intro: 'Some headaches are linked to the neck and surrounding muscles. We assess whether your neck may be contributing and tailor care accordingly.',
    sections: [
      S('Cervicogenic headache', 'A cervicogenic headache is pain felt in the head that comes from the neck.', 'Headache that often starts at the back of the head, with neck stiffness.', 'Hands-on care and neck and upper back exercises may help.', ['physical-therapy', 'dry-needling']),
      S('Tension headache', 'Tension-type headaches are often described as a band-like pressure around the head.', 'Dull, pressing headache, sometimes with tight neck and shoulder muscles.', 'Posture strategies, mobility and muscle treatment may help alongside guidance from your doctor.', ['physical-therapy', 'dry-needling']),
    ],
  },
  {
    slug: 'tmj', title: 'TMJ', reuse: 'jaw-pain', seoTitle: 'TMJ/TMD Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy in Marietta, GA for TMJ/TMD jaw pain, clicking and restricted jaw movement.',
    intro: 'Jaw pain can affect eating, talking and sleep. We look at the jaw, neck and posture together.',
    sections: [
      S('TMJ/TMD', 'Temporomandibular disorders (TMD) affect the jaw joint and the muscles that move it.', 'Jaw pain, clicking, limited opening, and sometimes headaches.', 'Care may include jaw and neck exercises, hands-on treatment and habit strategies, often alongside your dentist.', ['physical-therapy', 'dry-needling']),
    ],
  },
  {
    slug: 'muscle-strains', title: 'Muscle Strains', reuse: null, seoTitle: 'Muscle Strain Treatment and Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy in Marietta, GA for sports hernia, hamstring, groin and low back strains, with a structured return to activity.',
    intro: 'Muscle strains are common in sport and everyday life. A structured plan can help you return to activity while lowering the chance of re-injury.',
    sections: [
      S('Sports hernia', 'A sports hernia (athletic groin pain) involves strain of the muscles and tendons in the lower abdomen and groin.', 'Groin pain with sprinting, cutting or kicking.', 'Progressive core and hip strengthening and a staged return to sport.', ['physical-therapy', 'in-person-personal-training']),
      S('Hamstring strains', 'A hamstring strain is an injury to the muscles at the back of the thigh.', 'Sudden pain at the back of the thigh, often during sprinting.', 'Graded strengthening and a structured return-to-running plan.', ['physical-therapy', 'blood-flow-restriction-therapy']),
      S('Low back strains', 'A low back strain affects the muscles and soft tissues of the lower back.', 'Back pain and stiffness after lifting or twisting.', 'Staying active with guided movement and strengthening may help recovery.'),
      S('Groin strains', 'A groin strain is an injury to the inner thigh (adductor) muscles.', 'Pain in the inner thigh with kicking, cutting or changing direction.', 'Progressive adductor and hip strengthening and gradual return to sport.', ['physical-therapy', 'injury-prevention-screening']),
    ],
  },
  {
    slug: 'nerve-pain', title: 'Nerve Pain', reuse: 'numbness-and-tingling', seoTitle: 'Nerve Pain Physical Therapy | Prevent & Restore PT',
    meta: 'Physical therapy in Marietta, GA for thoracic outlet syndrome, radiculopathy and neuropathy symptoms like numbness and tingling.',
    intro: 'Nerve-related symptoms such as tingling, numbness or burning can be worrying. We assess where symptoms may be coming from and work alongside your medical team.',
    sections: [
      S('Thoracic outlet syndrome', 'Thoracic outlet syndrome involves irritation of nerves or blood vessels between the neck and shoulder.', 'Arm tingling, numbness, heaviness or pain, often with overhead positions.', 'Posture, nerve mobility and shoulder strengthening may help.'),
      S('Radiculopathy', 'Radiculopathy is irritation of a nerve root in the neck or low back.', 'Pain, tingling, numbness or weakness travelling into the arm or leg.', 'Positions that ease symptoms, nerve mobility and progressive strengthening are commonly used.', ['physical-therapy', 'dry-needling']),
      S('Neuropathy', 'Peripheral neuropathy is damage to nerves, often in the feet or hands, with many possible causes.', 'Numbness, tingling or burning, and sometimes balance problems.', 'Balance, strength and activity strategies may help you stay safe and active, alongside your doctor’s care.'),
    ],
  },
];

const NEW_SERVICES = [
  { slug: 'physical-therapy', title: 'Physical Therapy', shortDescription: 'One-on-one, 60-minute sessions with a Doctor of Physical Therapy to find the root cause of your pain, restore strength and mobility, and help prevent future injuries.' },
  { slug: 'in-person-personal-training', title: 'In-Person Personal Training', shortDescription: 'Coached strength and conditioning sessions in person, built around your goals and movement needs. [Details to be confirmed by the clinic.]' },
  { slug: 'shockwave-therapy', title: 'Shockwave Therapy', shortDescription: 'Shockwave therapy uses acoustic pressure waves applied to the skin and is commonly used for some tendon and soft-tissue conditions. [Details to be confirmed by the clinic.]' },
  { slug: 'injury-prevention-screening', title: 'Injury Prevention Screening', shortDescription: 'A screening of strength and movement to highlight areas that may benefit from targeted training. [Details to be confirmed by the clinic.]' },
];

const RENAMES = [
  { from: 'functional-dry-needling', slug: 'dry-needling', title: 'Dry Needling' },
  { from: 'pain-prevention-seminars', slug: 'injury-prevention-workshops', title: 'Injury Prevention Workshops' },
  { from: 'exercise-performance-and-programming', slug: 'remote-strength-and-conditioning', title: 'Remote Strength and Conditioning' },
];

const SERVICE_ORDER = ['physical-therapy', 'remote-strength-and-conditioning', 'in-person-personal-training', 'shockwave-therapy', 'dry-needling', 'injury-prevention-workshops', 'injury-prevention-screening', 'functional-movement-screening'];

module.exports = { REGIONS, NEW_SERVICES, RENAMES, SERVICE_ORDER };
