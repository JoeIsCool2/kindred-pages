import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import {
  Archive,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileHeart,
  Flower2,
  Gift,
  Globe2,
  HeartHandshake,
  Image,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  Palette,
  Plus,
  Printer,
  QrCode,
  Rocket,
  Save,
  Search,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Video
} from 'lucide-react';
import './styles.css';
import heroImage from '../assets/kindred-hero.jpg';
import { loadSiteDraft, persistenceLabel, saveSiteDraft } from './persistence.js';

const starter = {
  name: 'Eleanor Grace Bennett',
  lifespan: '1948 - 2026',
  cover: '',
  portrait: '',
  tone: 'warm',
  privacy: 'invite',
  gatheringType: 'Celebration of Life',
  accessCode: 'garden-light',
  inviteToken: 'family-eleanor-2026',
  searchVisibility: 'Hidden until family approves',
  allowGuestSharing: true,
  template: 'garden',
  relationship: 'Mother, teacher, neighbor, and friend',
  story:
    'Eleanor filled ordinary rooms with patience, music, and practical kindness. Her family remembers handwritten birthday cards, Saturday soup, and the way she made every child feel expected and welcome.',
  serviceTitle: 'Celebration of Life',
  serviceDate: 'Saturday, August 22',
  serviceTime: '2:00 PM',
  servicePlace: 'Maple Grove Community Hall',
  serviceAddress: '1287 Meadow Lane, Fort Collins, CO',
  dressNote: 'Soft colors are welcome.',
  livestream: 'https://example.com/livestream',
  livestreamPlan: {
    platform: 'Private Vimeo event',
    techContact: 'Thomas Hale',
    contactDetail: '(970) 555-0188',
    backup: 'If video fails, call the family line and the coordinator will share the phone audio bridge.',
    replayUrl: 'https://example.com/eleanor-replay',
    recordingStatus: 'Replay available after service'
  },
  donation: 'https://example.com/library-fund',
  contact: 'family@kindred.example',
  accessibility: 'Step-free entrance, reserved front-row seating, and quiet room available.',
  parking: 'Free parking behind the hall. Volunteers will meet guests at the west entrance.',
  reception: 'Tea and light food in the garden room after the service.',
  hotelBlock: 'Ask for the Bennett family rate at the Mason House Inn.',
  travelNote: 'The venue is 20 minutes from the airport. Rides can be coordinated through Marina.',
  childNote: 'Children are welcome. A small activity table will be available near the family seating area.',
  ritualNote: 'Guests may bring a written memory for the story basket near the entrance.',
  honorsNote: 'A short bell-ringing tribute will close the gathering.',
  slug: 'eleanor-bennett',
  music: 'Clair de Lune, garden hymns, and family piano recordings',
  food: 'Tea, lemon bars, and the tomato soup she made every winter',
  wishes: 'In place of flowers, the family invites donations to the town library children\'s room.',
  eventSchedule: [
    { time: '1:15 PM', label: 'Doors open and photo table' },
    { time: '2:00 PM', label: 'Celebration of Life' },
    { time: '3:15 PM', label: 'Reception and memory sharing' }
  ],
  milestones: [
    { year: '1948', label: 'Born in Grand Junction, Colorado' },
    { year: '1971', label: 'Began teaching third grade' },
    { year: '1974', label: 'Married Thomas Bennett' },
    { year: '1986', label: 'Started the neighborhood reading circle' },
    { year: '2026', label: 'Surrounded by family at home' }
  ],
  memories: [
    { from: 'Maya', relation: 'Former student', text: 'She kept a drawer of stickers just for nervous students. I still remember choosing a silver star after my first book report.', photo: '', caption: '', audio: '', audioLabel: '', consent: true },
    { from: 'Daniel', relation: 'Nephew', text: 'Every Thanksgiving she asked everyone to tell one tiny good thing from the year. It changed the whole room.', consent: true }
  ],
  photos: [],
  rsvp: [
    { name: 'Rachel Kim', email: 'rachel@example.com', phone: '(970) 555-0134', group: 'Family friends', attending: 'In person', partySize: '2', needs: 'Photo table help', note: 'Bringing printed photos for the table.', inviteSent: true, followUpDone: false },
    { name: 'Owen Price', email: 'owen@example.com', phone: '', group: 'Out-of-town guests', attending: 'Watching online', partySize: '1', needs: 'Livestream link', note: 'Sending love from Seattle.', inviteSent: false, followUpDone: true }
  ],
  pendingMemories: [
    { from: 'Alicia Moreno', relation: 'Neighbor', text: 'Eleanor mailed me a poem after my mother died. I kept it in my wallet for years.', status: 'Pending', photo: '', caption: 'Alicia kept Eleanor\'s poem tucked into a family recipe book.', consent: true },
    { from: 'James P.', relation: 'Former student', text: 'She never forgot a student, even thirty years later.', status: 'Pending', consent: true }
  ],
  rejectedMemories: [],
  supportGifts: [
    { name: 'Library Children\'s Room', type: 'Donation fund', amount: '$1,840 pledged', status: 'Open', url: 'https://example.com/library-fund' },
    { name: 'Meal train', type: 'Family support', amount: '12 of 18 slots filled', status: 'Coordinating', url: 'https://example.com/meal-train' },
    { name: 'Flower table', type: 'Service help', amount: 'Volunteers welcome', status: 'Needs help', url: 'mailto:family@kindred.example' }
  ],
  supportNeeds: [
    { title: 'Soup and bread for family dinner', category: 'Meal', date: 'Friday evening', detail: 'Dinner for 8, no shellfish. Drop off at Marina\'s house.', claimedBy: 'Rachel Kim', status: 'Claimed' },
    { title: 'Ride for Aunt June', category: 'Transportation', date: 'Service day 1:15 PM', detail: 'Pickup from the west entrance at Pine View Assisted Living.', claimedBy: '', status: 'Open' },
    { title: 'Memory table setup', category: 'Service help', date: 'Service day 12:45 PM', detail: 'Place frames, QR cards, guest book, and candle tray.', claimedBy: 'Owen Price', status: 'Claimed' }
  ],
  coadmins: [
    { name: 'Marina Bennett', role: 'Family admin', email: 'marina@example.com', status: 'Owner' },
    { name: 'Thomas Hale', role: 'Funeral home coordinator', email: 'thomas@example.com', status: 'Invited' }
  ],
  partner: {
    organization: 'Meadow & Pine Funeral Care',
    coordinator: 'Thomas Hale',
    phone: '(970) 555-0188',
    email: 'thomas@example.com',
    brandLine: 'Gentle planning support for every family we serve.',
    logoInitials: 'MP',
    defaultPackage: 'Legacy Archive',
    handoffStatus: 'Family review ready',
    billingMode: 'Partner monthly plan'
  },
  partnerDrafts: [
    { family: 'Bennett family', memorial: 'Eleanor Grace Bennett', stage: 'Family review', package: 'Legacy Archive', owner: 'Marina Bennett' },
    { family: 'Kim family', memorial: 'Robert Kim', stage: 'Service details needed', package: 'Family Page', owner: 'Ari Kim' },
    { family: 'Santos family', memorial: 'Lucia Santos', stage: 'Ready to publish', package: 'Legacy Archive', owner: 'Elena Santos' }
  ],
  careContacts: [
    { name: 'Marina Bennett', role: 'Family questions', detail: 'marina@example.com' },
    { name: 'Maple Grove Community Hall', role: 'Venue access', detail: '(970) 555-0142' },
    { name: 'Thomas Hale', role: 'Livestream help', detail: 'thomas@example.com' }
  ],
  dayOfChecklist: [
    { area: 'Memory table', owner: 'Marina Bennett', task: 'Place QR cards, printed photos, and story basket near the entrance.', done: true },
    { area: 'Livestream', owner: 'Thomas Hale', task: 'Test camera, audio, and backup recording 30 minutes before doors open.', done: false },
    { area: 'Accessibility', owner: 'Venue team', task: 'Reserve front-row seating and keep the quiet room unlocked.', done: false }
  ],
  guestFaq: [
    { question: 'What should guests wear?', answer: 'Soft colors are welcome, and guests should choose whatever feels respectful and comfortable.' },
    { question: 'Can children attend?', answer: 'Children are welcome. A small activity table will be available near the family seating area.' },
    { question: 'Should guests bring flowers?', answer: 'In place of flowers, the family invites donations to the town library children\'s room.' }
  ],
  customCare: [
    { title: 'Story basket ritual', audience: 'All guests', guidance: 'Guests may write a short memory and place it in the basket before the bell-ringing tribute.', contact: 'Marina Bennett', visibility: 'Public' },
    { title: 'Family-only candle lighting', audience: 'Immediate family', guidance: 'The grandchildren will light four candles near the memory table. Guests are welcome to watch quietly.', contact: 'Reverend Ana Wells', visibility: 'Public' },
    { title: 'Photo boundaries', audience: 'Coordinator team', guidance: 'No photos during the final bell or while family is seated in the quiet room.', contact: 'Thomas Hale', visibility: 'Family only' }
  ],
  aftercareReminders: [
    { date: '1 week after', label: 'Send thank-you note to readers, musicians, and volunteers', done: false },
    { date: '30 days after', label: 'Download archive and guest list for the family', done: false },
    { date: 'Birthday', label: 'Invite family to add anniversary memories', done: false }
  ],
  anniversaryCare: [
    { date: 'Eleanor\'s birthday', audience: 'Close family', message: 'Today we are remembering Eleanor with the small stories she loved most. If you would like to add a memory or photo, her page is still open here:', status: 'Draft' },
    { date: 'One-year remembrance', audience: 'Family and friends', message: 'As we mark one year, the family is gathering any memories, photos, or words people would still like preserved in Eleanor\'s archive.', status: 'Scheduled' }
  ],
  thankYouList: [
    { name: 'Reverend Ana Wells', reason: 'Officiant and opening prayer', method: 'Email', due: '1 week after', sent: false },
    { name: 'Bennett grandchildren', reason: 'Candle tribute', method: 'Handwritten card', due: '2 weeks after', sent: false },
    { name: 'Meal train helpers', reason: 'Family meals after the service', method: 'Group message', due: '1 week after', sent: true }
  ],
  activityLog: [
    { action: 'Sample page prepared', detail: 'Polished family draft loaded with service details, memories, and launch tasks.', when: 'Today' },
    { action: 'Privacy set', detail: 'Invite-only sharing is selected for the memorial page.', when: 'Today' },
    { action: 'Guest care added', detail: 'Accessibility, parking, reception, lodging, and contact details are ready for guests.', when: 'Today' }
  ],
  serviceOrder: [
    { time: '2:00 PM', label: 'Welcome and opening music' },
    { time: '2:10 PM', label: 'Family remembrance by Marina Bennett' },
    { time: '2:25 PM', label: 'Reading and candle tribute' },
    { time: '2:45 PM', label: 'Shared memories and closing bell' }
  ],
  programPeople: [
    { role: 'Officiant', name: 'Reverend Ana Wells' },
    { role: 'Reader', name: 'Marina Bennett' },
    { role: 'Music', name: 'Bennett family piano recordings' }
  ],
  serviceSelections: [
    { type: 'Reading', title: 'A garden poem Eleanor kept by the piano', person: 'Marina Bennett', note: 'Print one stanza in the program.', status: 'Confirmed' },
    { type: 'Music', title: 'Clair de Lune', person: 'Bennett family recording', note: 'Play during photo table seating.', status: 'Confirmed' },
    { type: 'Tribute', title: 'Candle tribute', person: 'Grandchildren', note: 'Four candles near the memory table.', status: 'Needs check' }
  ],
  launchTasks: [
    { label: 'Confirm service location and map link', done: true },
    { label: 'Approve guest memories before publishing', done: false },
    { label: 'Print QR cards for memory table', done: false },
    { label: 'Send private link to family group', done: true },
    { label: 'Download archive after the gathering', done: false }
  ],
  launchApproval: {
    status: 'Needs family review',
    reviewer: 'Marina Bennett',
    reviewedAt: '',
    checks: [
      { label: 'Names, dates, and story feel right', done: true },
      { label: 'Service time, place, and guest-care details are confirmed', done: true },
      { label: 'Privacy, passcode, and invite settings match the family choice', done: true },
      { label: 'Photos, memories, and voice notes are family-approved', done: false },
      { label: 'Checkout, domain, and invite plan are understood', done: false }
    ]
  },
  privacyReview: {
    status: 'Needs privacy review',
    reviewer: 'Marina Bennett',
    reviewedAt: '',
    notes: 'Invite-only sharing is right for the first family launch. Public search can stay hidden until after the service.',
    checks: [
      { label: 'Page privacy matches the family decision', done: true },
      { label: 'Invite or passcode is shared only with intended guests', done: true },
      { label: 'Search visibility and social preview feel appropriate', done: true },
      { label: 'Public photos, memories, and custom-care notes are approved', done: false },
      { label: 'Archive, closure, and data request choices are understood', done: false }
    ]
  },
  sensitiveReview: {
    status: 'Needs sensitive details review',
    reviewer: 'Marina Bennett',
    reviewedAt: '',
    notes: 'Cause-of-death wording is intentionally omitted from the public page. Donation links and family-only photo boundaries should be checked before launch.',
    checks: [
      { label: 'Cause-of-death, medical, or conflict details are intentionally included or omitted', done: true },
      { label: 'Children, vulnerable guests, and private family moments are protected in photos and memories', done: false },
      { label: 'Donation, meal-train, and support links are accurate and clearly third-party when needed', done: true },
      { label: 'Faith, cultural, military, or family ritual notes are worded respectfully and with permission', done: false },
      { label: 'Family-only notes, contact details, and coordinator instructions are not exposed publicly', done: false }
    ]
  },
  accessibilityChecks: [
    { label: 'Page works by keyboard only', done: true },
    { label: 'Text is readable on a phone', done: true },
    { label: 'Service access and seating are clear', done: true },
    { label: 'Photos and voice notes have family-safe labels', done: false },
    { label: 'Private page gate is tested before invites go out', done: false }
  ],
  plan: 'Legacy Archive',
  customDomain: 'remembering-eleanor.com',
  launchStatus: 'Draft',
  checkoutStatus: 'Ready',
  domainStatus: 'Not connected',
  inviteStatus: 'Not sent',
  publishTarget: 'Private family link',
  archiveStatus: 'Not exported',
  retentionPlan: 'Preserve page and archive for 10 years',
  closureStatus: 'Open for memories',
  closureRequests: [
    { requester: 'Marina Bennett', request: 'Keep page open through the one-year anniversary', action: 'Preserve public page and archive', status: 'Family reviewed', requestedAt: 'Today' },
    { requester: 'Thomas Hale', request: 'Confirm funeral-home access ends after handoff', action: 'Remove partner coordinator after family approval', status: 'Needs check', requestedAt: 'After service' }
  ],
  searchTitle: 'Remembering Eleanor Grace Bennett',
  searchDescription: 'Service details, family stories, photos, and shared memories for Eleanor Grace Bennett.',
  messages: {
    emailSubject: 'Remembering Eleanor Grace Bennett',
    invite: 'We created a private page for Eleanor with service details, photos, and a place to share memories. You can visit it here:',
    memoryRequest: 'If you have a story, phrase, photo, or small moment you remember about Eleanor, it would mean a lot to the family if you shared it on her page.',
    smsInvite: 'Service details and a place to share memories for Eleanor are here:',
    obituary:
      'Eleanor Grace Bennett, beloved mother, teacher, neighbor, and friend, is remembered for her patient kindness, handwritten notes, and the welcome she created for every child who crossed her path.',
    newspaperNotice:
      'A celebration of life for Eleanor Grace Bennett will be held Saturday, August 22 at 2:00 PM at Maple Grove Community Hall. Family and friends are invited to share memories through her Kindred Pages memorial.',
    socialPost:
      'We are gathering stories, photos, and service details for Eleanor Grace Bennett in one private family page. Thank you for helping us remember her with care.',
    livestreamReminder:
      'Eleanor\'s celebration of life begins at 2:00 PM. If you are joining online, the livestream link and service details are on her memorial page:',
    thankYou: 'Thank you for being part of Eleanor\'s celebration of life. Your presence, stories, and care have meant more than we can say.'
  },
  obituaryPlacements: [
    { outlet: 'Fort Collins Herald', type: 'Newspaper notice', deadline: 'Friday 5 PM', contact: 'notices@example.com', cost: '$185', status: 'Draft' },
    { outlet: 'Maple Grove funeral-home site', type: 'Online obituary', deadline: 'Before family invites', contact: 'Thomas Hale', cost: 'Included', status: 'Submitted' }
  ],
  guestUpdates: [
    { title: 'Livestream link ready', detail: 'The livestream link is available on this page for anyone joining from home.', timing: 'Service day', urgent: true },
    { title: 'Reception reminder', detail: 'Tea and light food will be served in the garden room after the closing bell.', timing: 'After service', urgent: false }
  ]
};

const tones = {
  warm: { label: 'Warm', hint: 'Soft, familial, celebration-focused' },
  classic: { label: 'Classic', hint: 'Formal obituary and service language' },
  faith: { label: 'Faith', hint: 'Gentle spiritual phrasing without assumptions' },
  honor: { label: 'Honor', hint: 'Service, legacy, and public remembrance' },
  quiet: { label: 'Quiet', hint: 'Minimal, private, and understated' }
};

const templates = {
  garden: { label: 'Garden Light', accent: '#5b7f6b' },
  cedar: { label: 'Cedar Room', accent: '#8d5f47' },
  harbor: { label: 'Harbor Air', accent: '#547a91' },
  linen: { label: 'Linen Note', accent: '#8a775f' },
  twilight: { label: 'Evening Honor', accent: '#59617c' },
  chapel: { label: 'Chapel White', accent: '#766b8c' }
};

const gatheringPresets = [
  {
    id: 'celebration',
    label: 'Celebration of Life',
    bestFor: 'A warm gathering with stories, music, photos, and a reception.',
    patch: {
      gatheringType: 'Celebration of Life',
      tone: 'warm',
      template: 'garden',
      privacy: 'invite',
      searchVisibility: 'Hidden until family approves',
      allowGuestSharing: true,
      serviceTitle: 'Celebration of Life',
      dressNote: 'Soft colors or anything that feels like them are welcome.',
      ritualNote: 'Guests may bring a written memory for the story basket near the entrance.',
      honorsNote: 'A shared memory moment will close the gathering.',
      eventSchedule: [
        { time: '1:15 PM', label: 'Doors open and photo table' },
        { time: '2:00 PM', label: 'Celebration of Life' },
        { time: '3:15 PM', label: 'Reception and memory sharing' }
      ],
      guestFaq: [
        { question: 'What should guests wear?', answer: 'Guests are welcome to wear soft colors or anything that feels respectful and comfortable.' },
        { question: 'Can guests share a story?', answer: 'Yes. Stories can be shared on the memorial page or written for the family story basket.' },
        { question: 'Should guests bring flowers?', answer: 'The family will share flower, donation, or support preferences on this page.' }
      ]
    }
  },
  {
    id: 'funeral',
    label: 'Funeral Service',
    bestFor: 'A traditional service with order of service, officiant, committal, and formal wording.',
    patch: {
      gatheringType: 'Funeral Service',
      tone: 'classic',
      template: 'chapel',
      privacy: 'hidden',
      searchVisibility: 'Hidden from search unless family chooses public',
      allowGuestSharing: false,
      serviceTitle: 'Funeral Service',
      dressNote: 'Respectful attire is welcome.',
      ritualNote: 'Guests are invited to arrive quietly and sign the guest book before the service begins.',
      honorsNote: 'A closing blessing and committal will follow the service.',
      eventSchedule: [
        { time: '10:00 AM', label: 'Visitation and guest book' },
        { time: '11:00 AM', label: 'Funeral service' },
        { time: '12:15 PM', label: 'Committal or family receiving time' }
      ],
      guestFaq: [
        { question: 'Is there a visitation?', answer: 'Visitation details are listed in the schedule above.' },
        { question: 'May guests send condolences?', answer: 'Condolences and memories may be sent through this page for family review.' },
        { question: 'Will there be a reception?', answer: 'Reception or family receiving details will be added here when confirmed.' }
      ]
    }
  },
  {
    id: 'graveside',
    label: 'Graveside Service',
    bestFor: 'A short outdoor service where arrival, parking, weather, and seating matter.',
    patch: {
      gatheringType: 'Graveside Service',
      tone: 'quiet',
      template: 'cedar',
      privacy: 'invite',
      searchVisibility: 'Hidden from search',
      allowGuestSharing: true,
      serviceTitle: 'Graveside Service',
      dressNote: 'Please dress for the weather and uneven ground.',
      accessibility: 'Outdoor service. Limited seating should be reserved for guests who need it.',
      parking: 'Follow cemetery staff or family signs for parking near the graveside area.',
      reception: 'Family receiving time will be shared here if one is planned.',
      ritualNote: 'Guests may bring a flower or small written note if they wish.',
      honorsNote: 'The service will be brief and quiet, with time for family blessing or farewell.',
      eventSchedule: [
        { time: '10:30 AM', label: 'Arrival and parking' },
        { time: '11:00 AM', label: 'Graveside service' },
        { time: '11:30 AM', label: 'Family receiving time' }
      ]
    }
  },
  {
    id: 'virtual',
    label: 'Online Remembrance',
    bestFor: 'A livestream or fully online memorial with replay, time zones, and tech help.',
    patch: {
      gatheringType: 'Online Remembrance',
      tone: 'warm',
      template: 'harbor',
      privacy: 'password',
      searchVisibility: 'Hidden from search',
      allowGuestSharing: false,
      serviceTitle: 'Online Remembrance',
      dressNote: 'Guests may join from wherever they are comfortable.',
      accessibility: 'Guests can join from a phone, tablet, or computer. A replay will be shared if available.',
      parking: 'No travel needed for the online remembrance.',
      reception: 'Guests are invited to stay online for informal sharing after the remembrance.',
      ritualNote: 'Guests may light a candle nearby or bring a photo to hold during the online remembrance.',
      honorsNote: 'A quiet closing moment will give everyone time to remember together.',
      livestreamPlan: {
        platform: 'Private online memorial room',
        recordingStatus: 'Replay planned after service',
        backup: 'If the livestream fails, the coordinator will send the backup meeting link to invited guests.'
      },
      eventSchedule: [
        { time: '1:45 PM', label: 'Online room opens' },
        { time: '2:00 PM', label: 'Online remembrance' },
        { time: '2:45 PM', label: 'Open sharing and family thanks' }
      ]
    }
  },
  {
    id: 'archive',
    label: 'Private Family Archive',
    bestFor: 'No public gathering yet. Collect memories, photos, contact details, and future remembrance plans.',
    patch: {
      gatheringType: 'Private Family Archive',
      tone: 'quiet',
      template: 'linen',
      privacy: 'password',
      searchVisibility: 'Hidden from search',
      allowGuestSharing: false,
      serviceTitle: 'Private Family Remembrance',
      dressNote: 'No public gathering details have been shared yet.',
      reception: 'The family will share future remembrance plans when ready.',
      ritualNote: 'Family and close friends may add memories privately for the archive.',
      honorsNote: 'The page is focused on preserving stories, photos, and care notes for the family.',
      publishTarget: 'Private family archive',
      eventSchedule: [
        { time: 'Now', label: 'Collect family memories and photos' },
        { time: 'Next', label: 'Review contributions privately' },
        { time: 'Later', label: 'Choose whether to share a public remembrance' }
      ]
    }
  }
];

const storyStarters = [
  {
    title: 'Small Kindness',
    text: 'One small kindness people remember is the way they made ordinary days feel cared for.'
  },
  {
    title: 'Family Thread',
    text: 'Family and friends will remember the traditions, phrases, meals, and practical love they carried from one generation to the next.'
  },
  {
    title: 'Community Mark',
    text: 'Their community was changed by the steady presence they offered: showing up, noticing people, and making room for others.'
  },
  {
    title: 'Favorite Details',
    text: 'A few favorite details worth keeping are the songs they loved, the places they returned to, and the stories everyone asks to hear again.'
  }
];

const planCatalog = [
  {
    name: 'Family Page',
    price: '$39',
    billing: 'One-time family plan',
    bestFor: 'Simple service sharing and memory collection',
    includes: ['Memorial page', 'Guest memories', 'RSVP list', 'QR table card', 'One year of hosting']
  },
  {
    name: 'Legacy Archive',
    price: '$149',
    billing: 'One-time legacy plan',
    bestFor: 'Long-term archive, program, and anniversary care',
    includes: ['Everything in Family Page', 'Service program', 'Family archive', 'Aftercare packet', 'Anniversary reminders']
  },
  {
    name: 'Funeral Home',
    price: '$99/mo',
    billing: 'Monthly partner plan',
    bestFor: 'Co-branded partner workflow and unlimited drafts',
    includes: ['Partner Desk', 'Co-branded drafts', 'Family handoff notes', 'Scoped co-admins', 'Partner exports']
  }
];

function getPlanDetails(planName) {
  return planCatalog.find((plan) => plan.name === planName) || planCatalog[0];
}

const steps = [
  { id: 'person', label: 'Person', icon: FileHeart },
  { id: 'story', label: 'Story', icon: Sparkles },
  { id: 'service', label: 'Service', icon: CalendarDays },
  { id: 'guests', label: 'Guest Care', icon: UserCheck },
  { id: 'memories', label: 'Memories', icon: MessageCircle },
  { id: 'desk', label: 'Family Desk', icon: Users },
  { id: 'partner', label: 'Partner Desk', icon: HeartHandshake },
  { id: 'announcements', label: 'Announcements', icon: Mail },
  { id: 'keepsakes', label: 'Keepsakes', icon: Printer },
  { id: 'settings', label: 'Settings', icon: Shield }
];

function stepFromHash(hash) {
  const id = hash.replace('#', '');
  return steps.some((step) => step.id === id) ? id : '';
}

function routeFromPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (['/builder', '/preview', '/pricing', '/partners', '/trust'].includes(clean)) return clean;
  return '/';
}

function getRouteMetadata(route, site, productionUrl) {
  const meta = {
    '/': {
      title: 'Kindred Pages | Memorial websites families can finish gently',
      description: 'Create a beautiful memorial page, collect memories, share service details, and preserve a private family archive.'
    },
    '/builder': {
      title: 'Build a Memorial Page | Kindred Pages',
      description: 'A focused memorial builder for story, service details, guest care, memories, keepsakes, privacy review, and launch approval.'
    },
    '/preview': {
      title: `${site.name || 'Memorial'} Preview | Kindred Pages`,
      description: `Preview the guest-facing memorial page for ${site.name || 'a loved one'} with RSVP, livestream, support, and memory sharing.`
    },
    '/pricing': {
      title: 'Pricing | Kindred Pages',
      description: 'Simple family memorial plans and funeral-home partner pricing for celebration-of-life pages, keepsakes, and archives.'
    },
    '/partners': {
      title: 'Funeral Home Partners | Kindred Pages',
      description: 'A co-branded memorial website workflow for funeral homes that need polished family drafts, service exports, and clean handoff.'
    },
    '/trust': {
      title: 'Trust, Privacy, and Research | Kindred Pages',
      description: 'How Kindred Pages handles private memorials, family moderation, sensitive details, archive exports, and research-backed guest care.'
    }
  }[route] || {};

  const path = route === '/' ? '/' : route;
  const base = productionUrl.replace(/\/$/, '');
  return {
    title: meta.title || 'Kindred Pages',
    description: meta.description || 'Memorial websites families can finish gently.',
    url: `${base}${path}`,
    image: `${base}/assets/kindred-hero.jpg`
  };
}

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function getLaunchChecks(site) {
  return [
    { label: 'Name and life dates added', done: Boolean(site.name && site.lifespan) },
    { label: 'Gathering type selected', done: Boolean(site.gatheringType) },
    { label: 'Life story has enough detail', done: Boolean(site.story && site.story.length > 120) },
    { label: 'Service place and time confirmed', done: Boolean(site.serviceDate && site.serviceTime && site.servicePlace) },
    { label: 'Guest care details prepared', done: Boolean(site.accessibility && site.parking && site.eventSchedule?.length) },
    { label: 'Guest memory collection ready', done: Boolean(site.memories.length || site.pendingMemories.length) },
    { label: 'Privacy mode selected', done: Boolean(site.privacy) },
    { label: 'Access controls prepared', done: Boolean(site.inviteToken && (site.privacy !== 'password' || site.accessCode)) },
    { label: 'Family contact available', done: Boolean(site.contact) },
    { label: 'Archive and QR keepsakes available', done: Boolean(site.slug && site.template) },
    { label: 'Search/share description prepared', done: Boolean(site.searchTitle && site.searchDescription) },
    { label: 'Accessibility review complete', done: Boolean(site.accessibilityChecks?.length && site.accessibilityChecks.every((check) => check.done)) },
    { label: 'Privacy and sharing review complete', done: privacyReviewComplete(site) },
    { label: 'Sensitive details reviewed', done: sensitiveReviewComplete(site) },
    { label: 'Family approval signed off', done: approvalComplete(site) }
  ];
}

function getLaunchSnapshot(site) {
  const groups = [
    {
      label: 'Story',
      detail: 'Identity, life story, photos, and memories',
      checks: [
        Boolean(site.name && site.lifespan),
        Boolean(site.story && site.story.length > 120),
        Boolean(publicPhotos(site).length || site.memories.length)
      ]
    },
    {
      label: 'Guest Care',
      detail: 'Service details, arrival needs, livestream, and contacts',
      checks: [
        Boolean(site.gatheringType),
        Boolean(site.serviceDate && site.serviceTime && site.servicePlace),
        Boolean(site.accessibility && site.parking && site.eventSchedule?.length),
        Boolean(site.livestream || site.careContacts?.length)
      ]
    },
    {
      label: 'Sharing',
      detail: 'Privacy, invites, announcements, and guest list',
      checks: [
        Boolean(site.privacy && site.inviteToken),
        Boolean(site.rsvp?.length && site.rsvp.some((guest) => guest.email || guest.phone)),
        Boolean(site.messages?.invite && site.messages?.smsInvite),
        privacyReviewComplete(site),
        sensitiveReviewComplete(site)
      ]
    },
    {
      label: 'Preservation',
      detail: 'Keepsakes, archive, aftercare, and family approval',
      checks: [
        Boolean(site.slug && site.template),
        Boolean(site.aftercareReminders?.length && site.anniversaryCare?.length),
        approvalComplete(site)
      ]
    }
  ];

  return groups.map((group) => {
    const done = group.checks.filter(Boolean).length;
    return {
      ...group,
      done,
      total: group.checks.length,
      status: done === group.checks.length ? 'Ready' : done ? 'Review' : 'Needs care'
    };
  });
}

function privacyReviewComplete(site) {
  return Boolean(
    site.privacyReview?.reviewer &&
    site.privacyReview?.reviewedAt &&
    site.privacyReview?.checks?.length &&
    site.privacyReview.checks.every((check) => check.done)
  );
}

function sensitiveReviewComplete(site) {
  return Boolean(
    site.sensitiveReview?.reviewer &&
    site.sensitiveReview?.reviewedAt &&
    site.sensitiveReview?.checks?.length &&
    site.sensitiveReview.checks.every((check) => check.done)
  );
}

function approvalComplete(site) {
  return Boolean(
    site.launchApproval?.reviewer &&
    site.launchApproval?.reviewedAt &&
    site.launchApproval?.checks?.length &&
    site.launchApproval.checks.every((check) => check.done)
  );
}

function getFamilyLaunchGuide(site, progress) {
  const actions = [];
  const add = (section, title, detail, priority = 'Needed') => actions.push({ section, title, detail, priority });

  if (!site.name || !site.lifespan) {
    add('person', 'Add the person', 'Name, dates, and page address come first.');
  }
  if (!site.gatheringType) {
    add('person', 'Choose the gathering type', 'A preset can shape privacy, schedule, and guest guidance.', 'Helpful');
  }
  if (!site.story || site.story.length < 120) {
    add('story', 'Shape the story', 'A few warm paragraphs make the page feel complete.');
  }
  if (!site.serviceDate || !site.serviceTime || !site.servicePlace) {
    add('service', 'Confirm the service', 'Guests need the date, time, place, and link.');
  }
  if (!site.accessibility || !site.parking || !site.eventSchedule?.length) {
    add('guests', 'Prepare guest care', 'Access, arrival, schedule, and contacts reduce repeated questions.');
  }
  if (site.pendingMemories.length) {
    add('desk', 'Review memories', `${site.pendingMemories.length} contribution${site.pendingMemories.length === 1 ? '' : 's'} waiting for family approval.`, 'Review');
  }
  if (!site.rsvp.length) {
    add('desk', 'Start the guest list', 'Add expected guests before sending invites.', 'Helpful');
  }
  if (!site.messages.invite || !site.messages.smsInvite) {
    add('announcements', 'Prepare invite wording', 'Keep email, SMS, and social messages ready.', 'Helpful');
  }
  if (!sensitiveReviewComplete(site)) {
    add('settings', 'Review sensitive details', 'Check delicate wording, protected photos, support links, and family-only notes before launch.', 'Needed');
  }
  if (site.archiveStatus !== 'Exported') {
    add('settings', 'Save an archive', 'Download a family copy before closing the gathering.', 'Preserve');
  }
  if (progress === 100 && site.launchStatus !== 'Published') {
    add('settings', 'Publish when ready', 'Readiness is complete; the page can be shared.', 'Ready');
  }

  return actions.slice(0, 4);
}

function getStepStatuses(site, progress) {
  return {
    person: Boolean(site.name && site.lifespan && site.gatheringType && site.slug),
    story: Boolean(site.story && site.story.length > 120 && site.milestones?.length),
    service: Boolean(site.serviceTitle && site.serviceDate && site.serviceTime && site.servicePlace),
    guests: Boolean(site.accessibility && site.parking && site.eventSchedule?.length && site.guestFaq?.length),
    memories: Boolean(site.memories?.length || site.pendingMemories?.length),
    desk: Boolean(site.rsvp?.length && site.pendingMemories?.length === 0),
    partner: Boolean(site.partner?.organization && site.partner?.coordinator && site.partner?.handoffStatus),
    announcements: Boolean(site.messages?.invite && site.messages?.obituary && site.obituaryPlacements?.length),
    keepsakes: Boolean(site.slug && site.serviceOrder?.length && site.programPeople?.length),
    settings: progress === 100 && privacyReviewComplete(site) && sensitiveReviewComplete(site) && approvalComplete(site)
  };
}

function getLaunchIssues(site, progress) {
  const issues = [];
  const add = (label, detail, tone = 'Review') => issues.push({ label, detail, tone });

  if (progress < 100) {
    add('Readiness is not complete', `${progress}% complete. Finish the launch checklist before sharing widely.`, 'Needed');
  }
  if (!privacyReviewComplete(site)) {
    add('Privacy review needs sign-off', 'Confirm search visibility, guest sharing, public photos, memories, custom-care notes, and archive choices.', 'Needed');
  }
  if (!sensitiveReviewComplete(site)) {
    add('Sensitive details need review', 'Confirm cause-of-death wording, protected photos, donation links, ritual notes, and family-only details before publishing.', 'Needed');
  }
  if (!approvalComplete(site)) {
    add('Family approval is not recorded', 'Record the reviewer, timestamp, and final family checklist before publishing.', 'Needed');
  }
  if (site.pendingMemories?.length) {
    add('Guest memories waiting', `${site.pendingMemories.length} contribution${site.pendingMemories.length === 1 ? '' : 's'} still need approval or private handling.`, 'Review');
  }
  const unsentInvites = (site.rsvp || []).filter((guest) => !guest.inviteSent).length;
  if (unsentInvites) {
    add('Guest invites not marked sent', `${unsentInvites} guest${unsentInvites === 1 ? '' : 's'} still need invite follow-up.`, 'Helpful');
  }
  const openNeeds = (site.supportNeeds || []).filter((need) => need.status === 'Open').length;
  if (openNeeds) {
    add('Support needs still open', `${openNeeds} support need${openNeeds === 1 ? '' : 's'} can still be claimed by guests.`, 'Helpful');
  }
  const closureNeeds = (site.closureRequests || []).filter((item) => item.status === 'Needs check').length;
  if (closureNeeds) {
    add('Closure requests need review', `${closureNeeds} closure or data request${closureNeeds === 1 ? '' : 's'} still need a family decision.`, 'Review');
  }
  const draftObituaries = (site.obituaryPlacements || []).filter((item) => ['Draft', 'Submitted'].includes(item.status)).length;
  if (draftObituaries) {
    add('Obituary placements not final', `${draftObituaries} publication record${draftObituaries === 1 ? '' : 's'} may need approval or publication status.`, 'Helpful');
  }
  if (site.archiveStatus !== 'Exported') {
    add('Archive has not been downloaded', 'Download a family archive before closure or final handoff.', 'Preserve');
  }

  return issues;
}

function normalizeMemories(memories = []) {
  return memories.map((memory) => ({
    relation: '',
    consent: true,
    photo: '',
    caption: '',
    audio: '',
    audioLabel: '',
    ...memory
  }));
}

function normalizeRsvps(rsvps = []) {
  return rsvps.map((guest) => ({
    email: '',
    phone: '',
    group: 'Guest list',
    partySize: '1',
    needs: '',
    inviteSent: false,
    followUpDone: false,
    ...guest
  }));
}

function normalizeGuestUpdates(updates = []) {
  return updates.map((update) => ({
    urgent: false,
    ...update
  }));
}

function guestImportKey(guest) {
  return (guest.email || guest.phone || guest.name || '').trim().toLowerCase();
}

function parseGuestImport(text) {
  const emailPattern = /[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+/;
  const phonePattern = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[\t,;]+/).map((part) => part.trim()).filter(Boolean);
      const email = line.match(emailPattern)?.[0] || '';
      const phone = line.match(phonePattern)?.[0] || '';
      const namePart = parts.find((part) => !emailPattern.test(part) && !phonePattern.test(part)) || line.replace(emailPattern, '').replace(phonePattern, '').replace(/[\t,;]+/g, ' ').trim();
      const group = parts.find((part) => part !== namePart && !emailPattern.test(part) && !phonePattern.test(part)) || 'Imported guests';

      return {
        name: namePart || email || phone || 'Guest name',
        email,
        phone,
        group,
        attending: 'Not sure',
        partySize: '1',
        needs: '',
        note: 'Imported from pasted guest list',
        inviteSent: false,
        followUpDone: false
      };
    })
    .filter((guest) => guest.name !== 'Guest name' || guest.email || guest.phone);
}

function normalizePhotos(photos = []) {
  return photos.map((photo, index) => (
    typeof photo === 'string'
      ? { src: photo, caption: '', isCover: index === 0, isPublic: true }
      : { caption: '', isCover: false, isPublic: true, ...photo }
  ));
}

function photoSrc(photo) {
  return typeof photo === 'string' ? photo : photo?.src;
}

function photoCaption(photo) {
  return typeof photo === 'string' ? '' : photo?.caption || '';
}

function publicPhotos(site) {
  return (site.photos || []).filter((photo) => photoSrc(photo) && photo.isPublic !== false);
}

function coverPhoto(site) {
  return publicPhotos(site).find((photo) => photo.isCover) || publicPhotos(site)[0];
}

function restoreSite(saved) {
  if (!saved) return starter;
  try {
    const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
    return {
      ...starter,
      ...parsed,
      milestones: parsed.milestones || starter.milestones,
      memories: normalizeMemories(parsed.memories || starter.memories),
      photos: normalizePhotos(parsed.photos || starter.photos),
      livestreamPlan: { ...starter.livestreamPlan, ...(parsed.livestreamPlan || {}) },
      eventSchedule: parsed.eventSchedule || starter.eventSchedule,
      rsvp: normalizeRsvps(parsed.rsvp || starter.rsvp),
      pendingMemories: normalizeMemories(parsed.pendingMemories || starter.pendingMemories),
      rejectedMemories: normalizeMemories(parsed.rejectedMemories || starter.rejectedMemories),
      supportGifts: parsed.supportGifts || starter.supportGifts,
      supportNeeds: parsed.supportNeeds || starter.supportNeeds,
      coadmins: parsed.coadmins || starter.coadmins,
      partner: { ...starter.partner, ...(parsed.partner || {}) },
      partnerDrafts: parsed.partnerDrafts || starter.partnerDrafts,
      careContacts: parsed.careContacts || starter.careContacts,
      dayOfChecklist: parsed.dayOfChecklist || starter.dayOfChecklist,
      guestFaq: parsed.guestFaq || starter.guestFaq,
      customCare: parsed.customCare || starter.customCare,
      aftercareReminders: parsed.aftercareReminders || starter.aftercareReminders,
      anniversaryCare: parsed.anniversaryCare || starter.anniversaryCare,
      thankYouList: parsed.thankYouList || starter.thankYouList,
      activityLog: parsed.activityLog || starter.activityLog,
      serviceOrder: parsed.serviceOrder || starter.serviceOrder,
      programPeople: parsed.programPeople || starter.programPeople,
      serviceSelections: parsed.serviceSelections || starter.serviceSelections,
      launchTasks: parsed.launchTasks || starter.launchTasks,
      launchApproval: {
        ...starter.launchApproval,
        ...(parsed.launchApproval || {}),
        checks: parsed.launchApproval?.checks || starter.launchApproval.checks
      },
      privacyReview: {
        ...starter.privacyReview,
        ...(parsed.privacyReview || {}),
        checks: parsed.privacyReview?.checks || starter.privacyReview.checks
      },
      sensitiveReview: {
        ...starter.sensitiveReview,
        ...(parsed.sensitiveReview || {}),
        checks: parsed.sensitiveReview?.checks || starter.sensitiveReview.checks
      },
      accessibilityChecks: parsed.accessibilityChecks || starter.accessibilityChecks,
      closureRequests: parsed.closureRequests || starter.closureRequests,
      messages: { ...starter.messages, ...(parsed.messages || {}) },
      obituaryPlacements: parsed.obituaryPlacements || starter.obituaryPlacements,
      guestUpdates: normalizeGuestUpdates(parsed.guestUpdates || starter.guestUpdates)
    };
  } catch {
    return starter;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function App() {
  const [site, setSite] = useState(starter);
  const [active, setActive] = useState(() => stepFromHash(window.location.hash) || 'person');
  const [route, setRoute] = useState(() => routeFromPath(window.location.pathname));
  const [previewMode, setPreviewMode] = useState('desktop');
  const [savedAt, setSavedAt] = useState('');
  const [storageStatus, setStorageStatus] = useState(persistenceLabel());
  const [toast, setToast] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const printRef = useRef(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    loadSiteDraft().then((saved) => {
      setSite(restoreSite(saved));
      hydratedRef.current = true;
      setSavedAt('now');
    });
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const next = stepFromHash(window.location.hash);
      if (next) setActive(next);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    const syncRoute = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return undefined;
    const timer = setTimeout(() => {
      saveSiteDraft(site).then((result) => {
        setSavedAt(new Date(result.savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        setStorageStatus(result.mode === 'cloud' ? 'Cloud saved' : result.mode === 'local-fallback' ? 'Local saved, cloud retry' : 'Local saved');
      });
    }, 220);
    return () => clearTimeout(timer);
  }, [site]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const shareUrl = `https://kindred.page/${site.slug || 'memorial'}`;

  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#20362e', light: '#fffdf8' }
    }).then(setQrDataUrl);
  }, [shareUrl]);

  const progress = useMemo(() => {
    const checks = getLaunchChecks(site);
    return Math.round((checks.filter((check) => check.done).length / checks.length) * 100);
  }, [site]);
  const familyGuide = useMemo(() => getFamilyLaunchGuide(site, progress), [site, progress]);
  const stepStatuses = useMemo(() => getStepStatuses(site, progress), [site, progress]);

  const update = (field, value) => setSite((current) => ({ ...current, [field]: value }));
  const updateMessage = (field, value) => setSite((current) => ({ ...current, messages: { ...current.messages, [field]: value } }));
  const updateLivestreamPlan = (field, value) => setSite((current) => ({ ...current, livestreamPlan: { ...current.livestreamPlan, [field]: value } }));
  const navigate = (path) => {
    const next = routeFromPath(path);
    window.history.pushState(null, '', next);
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openStep = (stepId) => {
    setActive(stepId);
    if (window.location.pathname !== '/builder' || window.location.hash !== `#${stepId}`) {
      window.history.pushState(null, '', `/builder#${stepId}`);
      setRoute('/builder');
    }
    window.setTimeout(() => document.querySelector('#builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };
  const addActivity = (action, detail) => {
    setSite((current) => ({
      ...current,
      activityLog: [
        { action, detail, when: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) },
        ...(current.activityLog || [])
      ].slice(0, 12)
    }));
  };
  const applyGatheringPreset = (preset) => {
    setSite((current) => ({
      ...current,
      ...preset.patch,
      livestreamPlan: {
        ...current.livestreamPlan,
        ...(preset.patch.livestreamPlan || {})
      }
    }));
    addActivity('Gathering setup applied', `${preset.label} guidance updated service, privacy, guest-care, and schedule fields.`);
    setToast(`${preset.label} setup applied`);
  };
  const productionUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'https://kindred.page';
  const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL || '';
  const publishEndpoint = import.meta.env.VITE_PUBLISH_ENDPOINT || '';
  const integrationChecks = useMemo(() => ([
    { label: 'Cloud drafts', detail: import.meta.env.VITE_SUPABASE_URL ? 'Supabase URL set' : 'Needs Supabase URL', ready: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY), icon: Archive },
    { label: 'Payments', detail: checkoutUrl ? 'Checkout URL set' : 'Needs checkout URL', ready: Boolean(checkoutUrl && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY), icon: CreditCard },
    { label: 'Publishing', detail: publishEndpoint ? 'Publish endpoint set' : 'Needs publish endpoint', ready: Boolean(publishEndpoint), icon: Rocket },
    { label: 'Support email', detail: import.meta.env.VITE_SUPPORT_EMAIL || 'Needs support email', ready: Boolean(import.meta.env.VITE_SUPPORT_EMAIL), icon: Mail },
    { label: 'Analytics', detail: import.meta.env.VITE_POSTHOG_KEY ? 'Analytics key set' : 'Optional analytics key', ready: Boolean(import.meta.env.VITE_POSTHOG_KEY), icon: Eye },
    { label: 'Domain', detail: productionUrl, ready: Boolean(productionUrl && productionUrl.startsWith('https://')), icon: Globe2 }
  ]), [checkoutUrl, publishEndpoint, productionUrl]);

  useEffect(() => {
    const metadata = getRouteMetadata(route, site, productionUrl);
    document.title = metadata.title;
    upsertMeta('name', 'description', metadata.description);
    upsertMeta('property', 'og:title', metadata.title);
    upsertMeta('property', 'og:description', metadata.description);
    upsertMeta('property', 'og:url', metadata.url);
    upsertMeta('property', 'og:image', metadata.image);
    upsertMeta('name', 'twitter:title', metadata.title);
    upsertMeta('name', 'twitter:description', metadata.description);
    upsertMeta('name', 'twitter:image', metadata.image);
    upsertCanonical(metadata.url);
  }, [route, site.name, productionUrl]);

  const addMemory = () => {
    setSite((current) => ({
      ...current,
      memories: [...current.memories, { from: 'Family friend', text: 'A small moment, a favorite phrase, or a story worth keeping.' }]
    }));
  };

  const updateList = (key, index, patch) => {
    setSite((current) => ({
      ...current,
      [key]: current[key].map((item, i) => (i === index ? { ...item, ...patch } : item))
    }));
  };

  const removeList = (key, index) => {
    setSite((current) => ({ ...current, [key]: current[key].filter((_, i) => i !== index) }));
  };

  const addMilestone = () => {
    setSite((current) => ({
      ...current,
      milestones: [...current.milestones, { year: 'Year', label: 'A meaningful chapter' }]
    }));
  };

  const approveMemory = (index) => {
    setSite((current) => {
      const approved = current.pendingMemories[index];
      return {
        ...current,
        memories: [...current.memories, { from: approved.from, relation: approved.relation || '', text: approved.text, photo: approved.photo || '', caption: approved.caption || '', audio: approved.audio || '', audioLabel: approved.audioLabel || '', consent: approved.consent !== false }],
        pendingMemories: current.pendingMemories.filter((_, i) => i !== index)
      };
    });
    setToast('Memory approved');
    addActivity('Memory approved', 'A guest contribution was approved and moved onto the public memorial page.');
  };

  const rejectMemory = (index) => {
    setSite((current) => {
      const rejected = current.pendingMemories[index];
      if (!rejected) return current;
      return {
        ...current,
        rejectedMemories: [
          { ...rejected, status: 'Declined', reviewedAt: new Date().toISOString(), reviewNote: 'Kept private by family moderator' },
          ...(current.rejectedMemories || [])
        ],
        pendingMemories: current.pendingMemories.filter((_, i) => i !== index)
      };
    });
    setToast('Memory kept private');
    addActivity('Memory declined', 'A guest contribution was kept private and removed from public review.');
  };

  const addRsvp = (guest = {}) => {
    setSite((current) => ({
      ...current,
      rsvp: [
        ...current.rsvp,
        {
          name: guest.name || 'Guest name',
          email: guest.email || '',
          phone: guest.phone || '',
          group: guest.group || 'Guest list',
          attending: guest.attending || 'In person',
          partySize: guest.partySize || '1',
          needs: guest.needs || '',
          note: guest.note || 'Accessibility, flowers, or family note',
          inviteSent: guest.inviteSent || false,
          followUpDone: guest.followUpDone || false
        }
      ]
    }));
    if (guest.name) setToast('RSVP added to guest list');
  };

  const importGuestList = (text) => {
    const guests = parseGuestImport(text);
    if (!guests.length) {
      setToast('No guests found to import');
      return 0;
    }

    const existing = new Set(site.rsvp.map(guestImportKey));
    const unique = guests.filter((guest) => {
      const key = guestImportKey(guest);
      if (!key || existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    if (!unique.length) {
      setToast('Those guests are already on the list');
      return 0;
    }

    setSite((current) => ({ ...current, rsvp: [...current.rsvp, ...unique] }));
    setToast(`${unique.length} guest${unique.length === 1 ? '' : 's'} imported`);
    addActivity('Guest list imported', `${unique.length} guest${unique.length === 1 ? '' : 's'} were added from pasted contact text.`);
    return unique.length;
  };

  const addScheduleItem = () => {
    setSite((current) => ({
      ...current,
      eventSchedule: [...current.eventSchedule, { time: 'Time', label: 'What happens next' }]
    }));
  };

  const addCareContact = () => {
    setSite((current) => ({
      ...current,
      careContacts: [...current.careContacts, { name: 'Contact name', role: 'What they can help with', detail: 'Email or phone' }]
    }));
  };

  const addDayOfTask = () => {
    setSite((current) => ({
      ...current,
      dayOfChecklist: [
        ...(current.dayOfChecklist || []),
        { area: 'Service task', owner: 'Helper name', task: 'Add the setup, guest-care, livestream, or cleanup detail.', done: false }
      ]
    }));
  };

  const addGuestFaq = () => {
    setSite((current) => ({
      ...current,
      guestFaq: [
        ...(current.guestFaq || []),
        { question: 'Guest question', answer: 'Add the clear answer guests should see before they contact the family.' }
      ]
    }));
  };

  const addCustomCare = () => {
    setSite((current) => ({
      ...current,
      customCare: [
        ...(current.customCare || []),
        { title: 'Custom or ritual guidance', audience: 'Who should know', guidance: 'Add the family, cultural, faith, accessibility, or etiquette note.', contact: 'Family contact', visibility: 'Public' }
      ]
    }));
  };

  const addSupportGift = () => {
    setSite((current) => ({
      ...current,
      supportGifts: [...current.supportGifts, { name: 'Support option', type: 'Family support', amount: 'Open', status: 'Open', url: '' }]
    }));
  };

  const addSupportNeed = () => {
    setSite((current) => ({
      ...current,
      supportNeeds: [
        ...(current.supportNeeds || []),
        { title: 'Support need', category: 'Meal, ride, setup, childcare, or errand', date: 'When needed', detail: 'What would help the family?', claimedBy: '', status: 'Open' }
      ]
    }));
  };

  const claimSupportNeed = (index, name) => {
    if (!name?.trim()) return;
    setSite((current) => ({
      ...current,
      supportNeeds: (current.supportNeeds || []).map((need, i) => (
        i === index ? { ...need, claimedBy: name.trim(), status: 'Claimed' } : need
      ))
    }));
    setToast('Support need claimed');
    addActivity('Support need claimed', `${name.trim()} offered help with a family support need.`);
  };

  const addAftercareReminder = () => {
    setSite((current) => ({
      ...current,
      aftercareReminders: [...current.aftercareReminders, { date: 'When', label: 'Follow-up task', done: false }]
    }));
  };

  const addAnniversaryCare = () => {
    setSite((current) => ({
      ...current,
      anniversaryCare: [
        ...(current.anniversaryCare || []),
        { date: 'Date or milestone', audience: 'Who should receive it', message: 'Draft a gentle remembrance note or memory invitation.', status: 'Draft' }
      ]
    }));
  };

  const updateAnniversaryStatus = (index, status) => {
    updateList('anniversaryCare', index, { status });
    addActivity('Anniversary care updated', `A remembrance message was marked ${status}.`);
  };

  const addThankYouRecipient = () => {
    setSite((current) => ({
      ...current,
      thankYouList: [
        ...(current.thankYouList || []),
        { name: 'Recipient name', reason: 'What they helped with', method: 'Card', due: 'When', sent: false }
      ]
    }));
  };

  const addCoadmin = () => {
    setSite((current) => ({
      ...current,
      coadmins: [...current.coadmins, { name: 'Helper name', role: 'Family helper', email: 'helper@example.com', status: 'Draft invite' }]
    }));
  };

  const coadminInviteText = (admin) => [
    `Hi ${admin.name || 'there'},`,
    '',
    `${site.name}'s family is using Kindred Pages to keep service details, memories, RSVPs, and keepsakes in one private place.`,
    `Role: ${admin.role || 'Family helper'}`,
    `Private page: ${shareUrl}?invite=${site.inviteToken || 'family'}`,
    '',
    'Thank you for helping the family carry a few details.'
  ].join('\n');

  const copyCoadminInvite = async (admin, index) => {
    await copyText(coadminInviteText(admin), `${admin.name || 'Helper'} invite`);
    updateList('coadmins', index, { status: 'Invite copied' });
    addActivity('Helper invite copied', `${admin.name || 'A family helper'} was prepared for a family handoff.`);
  };

  const addServiceOrderItem = () => {
    setSite((current) => ({
      ...current,
      serviceOrder: [...current.serviceOrder, { time: 'Time', label: 'Program moment' }]
    }));
  };

  const addProgramPerson = () => {
    setSite((current) => ({
      ...current,
      programPeople: [...current.programPeople, { role: 'Role', name: 'Name' }]
    }));
  };

  const addServiceSelection = () => {
    setSite((current) => ({
      ...current,
      serviceSelections: [
        ...(current.serviceSelections || []),
        { type: 'Reading', title: 'Selection title', person: 'Person or source', note: 'Program note or cue', status: 'Needs check' }
      ]
    }));
  };

  const addGuestUpdate = () => {
    setSite((current) => ({
      ...current,
      guestUpdates: [
        ...(current.guestUpdates || []),
        { title: 'Guest update', detail: 'Add the short note guests need to know.', timing: 'Today', urgent: false }
      ]
    }));
  };

  const addObituaryPlacement = () => {
    setSite((current) => ({
      ...current,
      obituaryPlacements: [
        ...(current.obituaryPlacements || []),
        { outlet: 'Publication name', type: 'Obituary notice', deadline: 'Deadline', contact: 'Contact person or email', cost: 'Cost', status: 'Draft' }
      ]
    }));
  };

  const updateObituaryPlacementStatus = (index, status) => {
    updateList('obituaryPlacements', index, { status });
    addActivity('Obituary placement updated', `Publication status changed to ${status}.`);
  };

  const addClosureRequest = () => {
    setSite((current) => ({
      ...current,
      closureRequests: [
        ...(current.closureRequests || []),
        { requester: 'Family admin', request: 'Describe the closure, privacy, or data request.', action: 'Review with family before changing access', status: 'Needs check', requestedAt: 'Today' }
      ]
    }));
  };

  const updatePartner = (field, value) => {
    setSite((current) => ({ ...current, partner: { ...current.partner, [field]: value } }));
  };

  const addPartnerDraft = () => {
    setSite((current) => ({
      ...current,
      partnerDrafts: [
        ...current.partnerDrafts,
        { family: 'New family', memorial: 'Memorial name', stage: 'Intake started', package: current.partner.defaultPackage, owner: 'Family owner' }
      ]
    }));
  };

  const markHandoffReady = () => {
    updatePartner('handoffStatus', 'Family handoff sent');
    setToast('Handoff marked sent');
  };

  const toggleAftercare = (index) => {
    setSite((current) => ({
      ...current,
      aftercareReminders: current.aftercareReminders.map((task, i) => (i === index ? { ...task, done: !task.done } : task))
    }));
  };

  const toggleThankYouSent = (index) => {
    setSite((current) => ({
      ...current,
      thankYouList: current.thankYouList.map((item, i) => (i === index ? { ...item, sent: !item.sent } : item))
    }));
    addActivity('Thank-you tracker updated', 'An after-service thank-you note status was changed.');
  };

  const toggleDayOfTask = (index) => {
    setSite((current) => ({
      ...current,
      dayOfChecklist: current.dayOfChecklist.map((task, i) => (i === index ? { ...task, done: !task.done } : task))
    }));
    addActivity('Day-of packet updated', 'A service-day coordination task was changed.');
  };

  const toggleGuestFollowUp = (index) => {
    setSite((current) => ({
      ...current,
      rsvp: current.rsvp.map((guest, i) => (i === index ? { ...guest, followUpDone: !guest.followUpDone } : guest))
    }));
    addActivity('Guest follow-up updated', 'A guest need follow-up was changed in the Family Desk.');
  };

  const toggleGuestInvite = (index) => {
    setSite((current) => ({
      ...current,
      rsvp: current.rsvp.map((guest, i) => (i === index ? { ...guest, inviteSent: !guest.inviteSent } : guest))
    }));
    addActivity('Guest invite updated', 'A guest invite status was changed in the Family Desk.');
  };

  const updateClosureRequestStatus = (index, status) => {
    setSite((current) => ({
      ...current,
      closureRequests: current.closureRequests.map((item, i) => (i === index ? { ...item, status } : item))
    }));
    addActivity('Closure request updated', 'A memorial closure or data request status was changed.');
  };

  const toggleTask = (index) => {
    setSite((current) => ({
      ...current,
      launchTasks: current.launchTasks.map((task, i) => (i === index ? { ...task, done: !task.done } : task))
    }));
  };

  const toggleAccessibilityCheck = (index) => {
    setSite((current) => ({
      ...current,
      accessibilityChecks: current.accessibilityChecks.map((check, i) => (i === index ? { ...check, done: !check.done } : check))
    }));
    addActivity('Accessibility review updated', 'A family-safe accessibility check was changed in launch settings.');
  };

  const toggleApprovalCheck = (index) => {
    setSite((current) => ({
      ...current,
      launchApproval: {
        ...current.launchApproval,
        status: 'Needs family review',
        reviewedAt: '',
        checks: current.launchApproval.checks.map((check, i) => (i === index ? { ...check, done: !check.done } : check))
      }
    }));
    addActivity('Family approval updated', 'A final family review item was changed before launch.');
  };

  const updateLaunchApproval = (field, value) => {
    setSite((current) => ({
      ...current,
      launchApproval: { ...current.launchApproval, [field]: value, status: field === 'reviewer' ? 'Needs family review' : current.launchApproval.status }
    }));
  };

  const togglePrivacyReviewCheck = (index) => {
    setSite((current) => ({
      ...current,
      privacyReview: {
        ...current.privacyReview,
        status: 'Needs privacy review',
        reviewedAt: '',
        checks: current.privacyReview.checks.map((check, i) => (i === index ? { ...check, done: !check.done } : check))
      }
    }));
    addActivity('Privacy review updated', 'A family privacy and sharing review item was changed before launch.');
  };

  const updatePrivacyReview = (field, value) => {
    setSite((current) => ({
      ...current,
      privacyReview: { ...current.privacyReview, [field]: value, status: field === 'reviewer' ? 'Needs privacy review' : current.privacyReview.status }
    }));
  };

  const markPrivacyReviewed = () => {
    const reviewer = site.privacyReview.reviewer || site.coadmins[0]?.name || 'Family reviewer';
    const isComplete = site.privacyReview.checks.every((check) => check.done);
    setSite((current) => ({
      ...current,
      privacyReview: {
        ...current.privacyReview,
        reviewer,
        status: isComplete ? 'Privacy reviewed' : 'Needs privacy review',
        reviewedAt: isComplete ? new Date().toISOString() : ''
      }
    }));
    if (isComplete) {
      setToast('Privacy review recorded');
      addActivity('Privacy review recorded', `${reviewer} confirmed privacy, sharing, search, and archive choices.`);
    } else {
      setToast('Finish the privacy review first');
    }
  };

  const toggleSensitiveReviewCheck = (index) => {
    setSite((current) => ({
      ...current,
      sensitiveReview: {
        ...current.sensitiveReview,
        status: 'Needs sensitive details review',
        reviewedAt: '',
        checks: current.sensitiveReview.checks.map((check, i) => (i === index ? { ...check, done: !check.done } : check))
      }
    }));
    addActivity('Sensitive details review updated', 'A family-sensitive launch check was changed.');
  };

  const updateSensitiveReview = (field, value) => {
    setSite((current) => ({
      ...current,
      sensitiveReview: {
        ...current.sensitiveReview,
        [field]: value,
        status: field === 'reviewer' ? 'Needs sensitive details review' : current.sensitiveReview.status
      }
    }));
  };

  const markSensitiveReviewed = () => {
    const reviewer = site.sensitiveReview.reviewer || site.coadmins[0]?.name || 'Family reviewer';
    const isComplete = site.sensitiveReview.checks.every((check) => check.done);
    setSite((current) => ({
      ...current,
      sensitiveReview: {
        ...current.sensitiveReview,
        reviewer,
        status: isComplete ? 'Sensitive details reviewed' : 'Needs sensitive details review',
        reviewedAt: isComplete ? new Date().toISOString() : ''
      }
    }));
    if (isComplete) {
      setToast('Sensitive details review recorded');
      addActivity('Sensitive details reviewed', `${reviewer} confirmed delicate wording, photos, support links, and family-only details.`);
    } else {
      setToast('Finish the sensitive details review first');
    }
  };

  const markLaunchApproved = () => {
    const reviewer = site.launchApproval.reviewer || site.coadmins[0]?.name || 'Family reviewer';
    setSite((current) => ({
      ...current,
      launchApproval: {
        ...current.launchApproval,
        reviewer,
        status: current.launchApproval.checks.every((check) => check.done) ? 'Approved for launch' : 'Needs family review',
        reviewedAt: current.launchApproval.checks.every((check) => check.done) ? new Date().toISOString() : ''
      }
    }));
    if (site.launchApproval.checks.every((check) => check.done)) {
      setToast('Family approval recorded');
      addActivity('Family approval recorded', `${reviewer} approved the memorial for launch.`);
    } else {
      setToast('Finish the family review first');
    }
  };

  const submitGuestMemory = (memory) => {
    setSite((current) => ({
      ...current,
      pendingMemories: [...current.pendingMemories, { ...memory, status: 'Pending', consent: memory.consent === true }]
    }));
    setToast('Memory sent for family review');
  };

  const downloadCsv = (name, rows) => {
    const headers = Object.keys(rows[0] || { name: '', note: '' });
    const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.slug || 'kindred'}-${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${name} exported`);
  };

  const downloadTextFile = (filename, contents, type = 'text/plain') => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCalendar = () => {
    const safeTitle = site.serviceTitle || `Remembering ${site.name}`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const date = new Date(`${site.serviceDate || ''} ${site.serviceTime || ''}`);
    const start = Number.isNaN(date.getTime()) ? now : date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = Number.isNaN(date.getTime()) ? new Date() : new Date(date.getTime() + 90 * 60 * 1000);
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kindred Pages//Memorial Service//EN',
      'BEGIN:VEVENT',
      `UID:${site.slug || 'kindred'}@kindred.page`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${safeTitle}`,
      `LOCATION:${site.servicePlace || ''} ${site.serviceAddress || ''}`.trim(),
      `DESCRIPTION:${shareUrl}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    downloadTextFile(`${site.slug || 'kindred'}-service.ics`, ics, 'text/calendar');
    setToast('Calendar file downloaded');
    addActivity('Calendar exported', 'The service calendar file was downloaded for guest sharing.');
  };

  const guestGuideText = () => [
    `${site.serviceTitle} for ${site.name}`,
    `${site.serviceDate} at ${site.serviceTime}`,
    `${site.servicePlace}`,
    site.serviceAddress,
    '',
    'Guest care',
    `Accessibility: ${site.accessibility}`,
    `Parking: ${site.parking}`,
    `Reception: ${site.reception}`,
    `Travel: ${site.travelNote}`,
    `Lodging: ${site.hotelBlock}`,
    `Children: ${site.childNote}`,
    `Rituals and honors: ${[site.ritualNote, site.honorsNote].filter(Boolean).join(' ')}`,
    '',
    'Livestream and replay',
    `Watch: ${site.livestream || 'Not added'}`,
    `Platform: ${site.livestreamPlan?.platform || 'Not added'}`,
    `Recording: ${site.livestreamPlan?.recordingStatus || 'Not added'}`,
    `Replay: ${site.livestreamPlan?.replayUrl || 'Not added'}`,
    `Tech contact: ${[site.livestreamPlan?.techContact, site.livestreamPlan?.contactDetail].filter(Boolean).join(' ') || 'Not added'}`,
    `Backup: ${site.livestreamPlan?.backup || 'Not added'}`,
    '',
    'Schedule',
    ...site.eventSchedule.map((item) => `${item.time} - ${item.label}`),
    '',
    'Contacts',
    ...site.careContacts.map((contact) => `${contact.name} (${contact.role}): ${contact.detail}`),
    '',
    'Guest updates',
    ...(site.guestUpdates || []).map((item) => `${item.urgent ? 'Urgent - ' : ''}${item.timing}: ${item.title} - ${item.detail}`),
    '',
    'Ways to help',
    ...(site.supportNeeds || []).map((need) => `${need.status}: ${need.title} (${need.category}, ${need.date})${need.claimedBy ? ` - claimed by ${need.claimedBy}` : ''}`),
    '',
    'Guest FAQ',
    ...(site.guestFaq || []).map((item) => `${item.question} ${item.answer}`),
    '',
    'Custom and ritual care',
    ...(site.customCare || []).filter((item) => item.visibility !== 'Family only').map((item) => `${item.title} (${item.audience}) - ${item.guidance}${item.contact ? ` Contact: ${item.contact}` : ''}`),
    '',
    shareUrl
  ].filter((line) => line !== undefined).join('\n');

  const downloadGuestGuide = () => {
    downloadTextFile(`${site.slug || 'kindred'}-guest-guide.txt`, guestGuideText());
    setToast('Guest guide downloaded');
    addActivity('Guest guide exported', 'Guest-care details were downloaded for sharing.');
  };

  const dayOfPacketText = () => [
    `Day-of service packet for ${site.name}`,
    '',
    `${site.serviceTitle}`,
    `${site.serviceDate} at ${site.serviceTime}`,
    `${site.servicePlace}`,
    site.serviceAddress,
    '',
    'Service links',
    `Memorial page: ${shareUrl}`,
    `Livestream: ${site.livestream || 'Not added'}`,
    `Livestream platform: ${site.livestreamPlan?.platform || 'Not added'}`,
    `Replay: ${site.livestreamPlan?.replayUrl || 'Not added'}`,
    `Support link: ${site.donation || 'Not added'}`,
    '',
    'Arrival and care',
    `Accessibility: ${site.accessibility}`,
    `Parking: ${site.parking}`,
    `Reception: ${site.reception}`,
    `Children: ${site.childNote}`,
    `Rituals and honors: ${[site.ritualNote, site.honorsNote].filter(Boolean).join(' ')}`,
    '',
    'Public schedule',
    ...site.eventSchedule.map((item) => `${item.time} - ${item.label}`),
    '',
    'Coordinator checklist',
    ...(site.dayOfChecklist || []).map((item) => `${item.done ? '[done]' : '[ ]'} ${item.area} - ${item.task} (${item.owner})`),
    '',
    'Livestream backup',
    `Recording status: ${site.livestreamPlan?.recordingStatus || 'Not added'}`,
    `Tech contact: ${[site.livestreamPlan?.techContact, site.livestreamPlan?.contactDetail].filter(Boolean).join(' ') || 'Not added'}`,
    site.livestreamPlan?.backup || 'No backup instructions added',
    '',
    'Support needs',
    ...(site.supportNeeds || []).map((need) => `${need.status === 'Complete' ? '[done]' : need.status === 'Claimed' ? '[claimed]' : '[open]'} ${need.title} - ${need.category}, ${need.date}${need.claimedBy ? ` (${need.claimedBy})` : ''}. ${need.detail}`),
    '',
    'Guest needs and follow-up',
    ...site.rsvp.filter((guest) => guest.needs || (guest.note && guest.note !== 'No note')).map((guest) => `${guest.followUpDone ? '[done]' : '[ ]'} ${guest.name} (${guest.attending}, party ${guest.partySize || '1'}${guest.group ? `, ${guest.group}` : ''}): ${[guest.email, guest.phone, guest.needs, guest.note].filter(Boolean).join(' - ')}`),
    '',
    'Helpful contacts',
    ...site.careContacts.map((contact) => `${contact.name} (${contact.role}): ${contact.detail}`),
    '',
    'Guest updates',
    ...(site.guestUpdates || []).map((item) => `${item.urgent ? 'Urgent - ' : ''}${item.timing}: ${item.title} - ${item.detail}`),
    '',
    'Guest FAQ',
    ...(site.guestFaq || []).map((item) => `${item.question} ${item.answer}`),
    '',
    'Custom and ritual care',
    ...(site.customCare || []).map((item) => `${item.visibility}: ${item.title} (${item.audience}) - ${item.guidance}${item.contact ? ` Contact: ${item.contact}` : ''}`)
  ].filter((line) => line !== undefined).join('\n');

  const downloadDayOfPacket = () => {
    downloadTextFile(`${site.slug || 'kindred'}-day-of-service-packet.txt`, dayOfPacketText());
    setToast('Day-of packet downloaded');
    addActivity('Day-of packet exported', 'Coordinator checklist, service details, contacts, and guest updates were downloaded.');
  };

  const aftercarePacketText = () => [
    `Aftercare packet for ${site.name}`,
    '',
    'Thank-you note',
    site.messages.thankYou,
    '',
    'Family archive',
    `Archive status: ${site.archiveStatus}`,
    `Retention plan: ${site.retentionPlan}`,
    `Closure status: ${site.closureStatus}`,
    `Memorial link: ${shareUrl}`,
    '',
    'Follow-up reminders',
    ...site.aftercareReminders.map((task) => `${task.done ? '[done]' : '[ ]'} ${task.date}: ${task.label}`),
    '',
    'Anniversary care',
    ...(site.anniversaryCare || []).map((item) => `${item.status}: ${item.date} for ${item.audience} - ${item.message} ${shareUrl}`),
    '',
    'Thank-you tracker',
    ...(site.thankYouList || []).map((item) => `${item.sent ? '[sent]' : '[ ]'} ${item.name} - ${item.reason} (${item.method}, due ${item.due})`),
    '',
    'Helpful contacts',
    ...site.careContacts.map((contact) => `${contact.name} (${contact.role}): ${contact.detail}`),
    '',
    'Memory follow-up',
    site.messages.memoryRequest
  ].filter((line) => line !== undefined).join('\n');

  const copyAftercarePacket = () => {
    copyText(aftercarePacketText(), 'Aftercare packet');
    addActivity('Aftercare packet copied', 'Thank-you wording, archive status, reminders, and contacts were copied for family follow-up.');
  };

  const downloadProgram = () => {
    const order = site.serviceOrder.map((item) => `
      <li>
        <strong>${escapeHtml(item.time)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </li>
    `).join('');
    const people = site.programPeople.map((person) => `
      <li>
        <strong>${escapeHtml(person.role)}</strong>
        <span>${escapeHtml(person.name)}</span>
      </li>
    `).join('');
    const selections = (site.serviceSelections || []).map((item) => `
      <article>
        <span>${escapeHtml(item.type)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.person)} · ${escapeHtml(item.status)}</p>
        ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}
      </article>
    `).join('');
    const chapters = site.milestones.slice(0, 6).map((item) => `
      <li>
        <strong>${escapeHtml(item.year)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </li>
    `).join('');
    const memories = site.memories.slice(0, 2).map((memory) => `
      <blockquote>
        <p>${escapeHtml(memory.text)}</p>
        <cite>${escapeHtml(memory.from)}${memory.relation ? `, ${escapeHtml(memory.relation)}` : ''}</cite>
      </blockquote>
    `).join('');
    const cover = coverPhoto(site);
    const coverImage = cover ? `<img class="cover-photo" src="${escapeHtml(photoSrc(cover))}" alt="${escapeHtml(photoCaption(cover) || site.name)}">` : '<div class="program-mark">K</div>';
    const qr = qrDataUrl ? `<img class="qr" src="${escapeHtml(qrDataUrl)}" alt="QR code for ${escapeHtml(shareUrl)}">` : '<div class="qr fallback">QR</div>';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(site.name)} Service Program</title><style>@page{size:letter;margin:.55in}*{box-sizing:border-box}body{font-family:Georgia,"Times New Roman",serif;color:#24302d;line-height:1.5;margin:0;background:#fff}main{max-width:760px;margin:0 auto}.cover{min-height:9in;display:flex;flex-direction:column;justify-content:center;text-align:center;border:0;padding:0}.eyebrow{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em;color:#5b7f6b;font-size:12px;font-weight:700}.cover h1{font-size:52px;line-height:1.02;margin:16px 0 8px}.cover p{margin:0;color:#66736f;font-size:19px}.cover-photo{width:178px;height:178px;object-fit:cover;border-radius:50%;margin:0 auto 22px;border:8px solid #f3efe6}.program-mark{width:96px;height:96px;border-radius:50%;display:grid;place-items:center;margin:0 auto 22px;background:#eef5f0;color:#557867;font-size:44px}.service-card{margin:30px auto 0;padding:18px;border:1px solid #ded8cc;border-radius:12px;max-width:520px;background:#fffaf2}.service-card strong,.service-card span{display:block}.service-card span{color:#66736f}section{break-inside:avoid;padding:24px 0;border-top:1px solid #ded8cc}h2{font-size:28px;margin:0 0 14px}.two{display:grid;grid-template-columns:1fr 1fr;gap:22px}.line-list{list-style:none;padding:0;margin:0}.line-list li{display:grid;grid-template-columns:86px 1fr;gap:12px;padding:9px 0;border-bottom:1px solid #eee8dc}.line-list strong{color:#557867}.selection-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.selection-grid article{border:1px solid #e1dbd0;border-radius:10px;padding:12px;background:#fffdf8;break-inside:avoid}.selection-grid span{font-family:Arial,sans-serif;text-transform:uppercase;color:#557867;font-size:11px;font-weight:800}.selection-grid strong{display:block;margin:5px 0}.selection-grid p,.selection-grid small{margin:0;color:#66736f}.story{font-size:17px}.wishes{padding:16px;border-left:4px solid #5b7f6b;background:#f8f5ef}.memory blockquote{margin:0 0 12px;padding:14px 16px;border-left:4px solid #5b7f6b;background:#fffaf2}.memory p{margin:0 0 8px}.memory cite{color:#66736f;font-style:normal;font-weight:700}.qr-panel{display:grid;grid-template-columns:112px 1fr;gap:16px;align-items:center;border:1px solid #ded8cc;border-radius:12px;padding:16px;background:#fffdf8}.qr{width:112px;height:112px}.qr.fallback{display:grid;place-items:center;background:#eef5f0;color:#557867;font-family:Arial,sans-serif;font-weight:800}.qr-panel p{margin:0;color:#53625e}.footer{font-family:Arial,sans-serif;text-align:center;color:#6a746f;font-size:12px;border-top:1px solid #ded8cc;padding-top:16px;margin-top:18px}@media print{body{background:#fff}.cover{break-after:page}.selection-grid,.two{grid-template-columns:1fr 1fr}}</style></head><body><main><section class="cover">${coverImage}<div class="eyebrow">${escapeHtml(site.gatheringType || site.serviceTitle)}</div><h1>${escapeHtml(site.name)}</h1><p>${escapeHtml(site.lifespan)}</p><p>${escapeHtml(site.relationship)}</p><div class="service-card"><strong>${escapeHtml(site.serviceTitle)}</strong><span>${escapeHtml(site.serviceDate)} at ${escapeHtml(site.serviceTime)}</span><span>${escapeHtml(site.servicePlace)}</span><span>${escapeHtml(site.serviceAddress)}</span></div></section><section><h2>Order of Service</h2><ul class="line-list">${order}</ul></section><section><h2>Readings, Music, and Tributes</h2><div class="selection-grid">${selections || '<p>Selections will be shared during the service.</p>'}</div></section><section class="two"><div><h2>Participants</h2><ul class="line-list">${people}</ul></div><div><h2>Chapters</h2><ul class="line-list">${chapters}</ul></div></section><section><h2>Life Story</h2><p class="story">${escapeHtml(site.story)}</p></section><section><h2>Family Wishes</h2><p class="wishes">${escapeHtml(site.wishes || site.donation || 'The family is grateful for your presence, stories, and care.')}</p></section>${memories ? `<section class="memory"><h2>Shared Memories</h2>${memories}</section>` : ''}<section><h2>Share a Memory</h2><div class="qr-panel">${qr}<p>Scan to leave a story, photo, or voice note for the family. Memories are reviewed privately before appearing on the memorial page.<br><strong>${escapeHtml(shareUrl)}</strong></p></div></section><p class="footer">Created with Kindred Pages</p></main></body></html>`;
    downloadTextFile(`${site.slug || 'kindred'}-program.html`, html, 'text/html');
    setToast('Program downloaded');
    addActivity('Service program exported', 'The polished printable program with service details, selections, QR code, and family wishes was downloaded.');
  };

  const downloadMemoryBook = () => {
    const chapters = site.milestones.map((item) => `<li><strong>${escapeHtml(item.year)}</strong><span>${escapeHtml(item.label)}</span></li>`).join('');
    const photos = publicPhotos(site).slice(0, 12).map((photo) => `
      <figure>
        <img src="${escapeHtml(photoSrc(photo))}" alt="${escapeHtml(photoCaption(photo) || site.name)}">
        ${photoCaption(photo) ? `<figcaption>${escapeHtml(photoCaption(photo))}</figcaption>` : ''}
      </figure>
    `).join('');
    const memories = site.memories.map((memory) => `
      <blockquote>
        <p>${escapeHtml(memory.text)}</p>
        <cite>${escapeHtml(memory.from)}${memory.relation ? `, ${escapeHtml(memory.relation)}` : ''}</cite>
      </blockquote>
    `).join('');
    const prompts = storyStarters.slice(0, 6).map((prompt) => `<li>${escapeHtml(prompt.text)}</li>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(site.name)} Memory Book</title><style>@page{size:letter;margin:.65in}body{font-family:Georgia,serif;color:#24302d;line-height:1.55;margin:0;background:#fff}main{max-width:760px;margin:0 auto}section{break-inside:avoid;padding:28px 0;border-top:1px solid #ded8cc}.cover{min-height:8.5in;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:0}.cover h1{font-size:54px;line-height:1.02;margin:18px 0 8px}.cover p{font-size:20px;color:#66736f;margin:0}.mark{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:#eef5f0;color:#557867;font-size:38px}h2{font-size:30px;margin:0 0 14px}p{font-size:16px}.story{font-size:19px}.chapters{list-style:none;padding:0;margin:0}.chapters li{display:grid;grid-template-columns:82px 1fr;gap:16px;margin:12px 0}.chapters strong{color:#557867}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:14px}.gallery figure{margin:0;break-inside:avoid}.gallery img{width:100%;height:220px;object-fit:cover;border-radius:10px}.gallery figcaption{margin-top:6px;color:#66736f;font-size:13px}.memories blockquote{margin:0 0 16px;padding:16px 18px;border-left:4px solid #557867;background:#fffaf2;break-inside:avoid}.memories p{margin:0 0 9px}.memories cite{color:#66736f;font-style:normal;font-weight:700}.prompts li{margin:8px 0;color:#4d5b56}.footer{font-family:Arial,sans-serif;text-align:center;color:#6a746f;font-size:12px;border-top:1px solid #ded8cc;padding-top:18px}@media print{body{background:#fff}.cover{break-after:page}.gallery img{height:185px}}</style></head><body><main><section class="cover"><div class="mark">K</div><h1>${escapeHtml(site.name)}</h1><p>${escapeHtml(site.lifespan)}</p><p>${escapeHtml(site.relationship)}</p></section><section><h2>Life Story</h2><p class="story">${escapeHtml(site.story)}</p></section><section><h2>Chapters</h2><ul class="chapters">${chapters}</ul></section>${photos ? `<section><h2>Family Photos</h2><div class="gallery">${photos}</div></section>` : ''}<section class="memories"><h2>Shared Memories</h2>${memories || '<p>No approved guest memories have been added yet.</p>'}</section><section><h2>Story Prompts for Later</h2><ul class="prompts">${prompts}</ul></section><p class="footer">Created with Kindred Pages · ${escapeHtml(shareUrl)}</p></main></body></html>`;
    downloadTextFile(`${site.slug || 'kindred'}-memory-book.html`, html, 'text/html');
    setToast('Memory book downloaded');
    addActivity('Memory book exported', 'A printable family memory book with story, photos, chapters, and memories was downloaded.');
  };

  const downloadQrCards = () => {
    const cardCount = 6;
    const cards = Array.from({ length: cardCount }).map(() => `
      <article>
        <img src="${qrDataUrl}" alt="QR code for ${escapeHtml(shareUrl)}">
        <div>
          <h2>Share a Memory</h2>
          <p>Scan to leave a story, photo, or voice note for ${escapeHtml(site.name)}'s family.</p>
          <small>${escapeHtml(shareUrl)}</small>
        </div>
      </article>
    `).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(site.name)} QR Cards</title><style>@page{size:letter;margin:.45in}body{font-family:Inter,Arial,sans-serif;color:#24302d;margin:0}.sheet{display:grid;grid-template-columns:1fr 1fr;gap:14px}article{break-inside:avoid;border:1px solid #d9d4c9;border-radius:10px;padding:18px;min-height:2.4in;display:grid;grid-template-columns:112px 1fr;gap:16px;align-items:center}img{width:112px;height:112px}h2{font-family:Georgia,serif;margin:0 0 8px;font-size:24px}p{margin:0;color:#53625e;line-height:1.45}small{display:block;margin-top:10px;color:#4e6c5d;overflow-wrap:anywhere;font-weight:700}@media print{article{page-break-inside:avoid}}</style></head><body><main class="sheet">${cards}</main></body></html>`;
    downloadTextFile(`${site.slug || 'kindred'}-qr-table-cards.html`, html, 'text/html');
    setToast('QR cards downloaded');
    addActivity('QR cards exported', 'Printable memory-table cards were downloaded.');
  };

  const copyText = async (text, label = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied`);
    } catch {
      downloadTextFile(`${site.slug || 'kindred'}-${label.toLowerCase().replaceAll(' ', '-')}.txt`, text);
      setToast(`${label} downloaded`);
    }
  };

  const handlePhotos = (files) => {
    Array.from(files).slice(0, 8).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setSite((current) => ({
        ...current,
        photos: [
          ...current.photos,
          { src: reader.result, caption: '', isCover: !current.photos.length, isPublic: true }
        ]
      }));
      reader.readAsDataURL(file);
    });
  };

  const setCoverPhoto = (index) => {
    setSite((current) => ({
      ...current,
      photos: current.photos.map((photo, i) => ({ ...(typeof photo === 'string' ? { src: photo } : photo), isCover: i === index }))
    }));
    setToast('Cover photo selected');
  };

  const downloadJson = () => {
    const archiveExportedAt = new Date().toISOString();
    const archivedSite = {
      ...site,
      archiveStatus: 'Exported'
    };
    const manifest = {
      memorial: archivedSite.name,
      exportedAt: archiveExportedAt,
      shareUrl,
      privacy: archivedSite.privacy,
      gatheringType: archivedSite.gatheringType,
      archiveStatus: archivedSite.archiveStatus,
      retentionPlan: archivedSite.retentionPlan,
      closureStatus: archivedSite.closureStatus,
      counts: {
        approvedMemories: archivedSite.memories.length,
        pendingMemories: archivedSite.pendingMemories.length,
        keptPrivateMemories: archivedSite.rejectedMemories?.length || 0,
        photos: archivedSite.photos.length,
        publicPhotos: publicPhotos(archivedSite).length,
        captionedPhotos: archivedSite.photos.filter((photo) => photoCaption(photo)).length,
        rsvps: archivedSite.rsvp.length,
        invitedGuests: archivedSite.rsvp.filter((guest) => guest.inviteSent).length,
        guestContacts: archivedSite.rsvp.filter((guest) => guest.email || guest.phone).length,
        supportOptions: archivedSite.supportGifts.length,
        supportNeeds: archivedSite.supportNeeds?.length || 0,
        openSupportNeeds: archivedSite.supportNeeds?.filter((need) => need.status === 'Open').length || 0,
        coadmins: archivedSite.coadmins.length,
        serviceOrder: archivedSite.serviceOrder.length,
        programPeople: archivedSite.programPeople.length,
        serviceSelections: archivedSite.serviceSelections?.length || 0,
        dayOfChecklist: archivedSite.dayOfChecklist?.length || 0,
        anniversaryCare: archivedSite.anniversaryCare?.length || 0,
        thankYouList: archivedSite.thankYouList?.length || 0,
        closureRequests: archivedSite.closureRequests?.length || 0,
        obituaryPlacements: archivedSite.obituaryPlacements?.length || 0,
        guestNeeds: archivedSite.rsvp.filter((guest) => guest.needs || (guest.note && guest.note !== 'No note')).length,
        guestUpdates: archivedSite.guestUpdates?.length || 0,
        guestFaq: archivedSite.guestFaq?.length || 0,
        customCare: archivedSite.customCare?.length || 0,
        livestreamPlan: archivedSite.livestreamPlan ? 1 : 0,
        privacyReviewChecks: archivedSite.privacyReview?.checks?.length || 0,
        completedPrivacyReviewChecks: archivedSite.privacyReview?.checks?.filter((check) => check.done).length || 0,
        activityLog: archivedSite.activityLog?.length || 0
      },
      included: [
        'memorial story and service details',
        'gathering type setup and family-safe defaults',
        'approved memories and captions',
        'pending memories for family review',
        'private moderation records',
        'RSVP and guest-list records',
        'guest contact, group, and invite tracking',
        'guest-care logistics and contacts',
        'photo gallery captions, cover choice, and visibility',
        'day-of service packet checklist',
        'guest needs and RSVP follow-up status',
        'guest update history',
        'guest FAQ answers',
        'custom, ritual, faith, and family guidance',
        'livestream platform, replay, recording, and backup plan',
        'privacy and sharing review notes, checks, and reviewer',
        'obituary publication tracker records',
        'aftercare packet wording and reminder status',
        'anniversary care message drafts and status',
        'thank-you tracker recipients and sent status',
        'closure and data request log',
        'service program order and participant records',
        'readings, music, and tribute selections',
        'support options and partner handoff details',
        'support needs, claimants, and status',
        'printable memory book keepsake',
        'family activity log',
        'launch, access, and archive settings'
      ]
    };
    const payload = {
      exportedAt: archiveExportedAt,
      app: 'Kindred Pages',
      version: '1.0.0',
      manifest,
      site: archivedSite
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.slug || 'kindred-page'}-archive.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSite(archivedSite);
    setToast('Archive downloaded');
    addActivity('Archive exported', 'A family archive with the current page data and manifest was downloaded.');
  };

  const importArchive = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setSite(restoreSite(parsed.site || parsed));
        setToast('Archive restored');
      } catch {
        setToast('Archive could not be read');
      }
    };
    reader.readAsText(file);
  };

  const resetSample = () => {
    const ok = window.confirm('Replace the current draft with the polished sample? Download an archive first if you want to keep this draft.');
    if (!ok) return;
    setSite(starter);
    setToast('Sample restored');
  };

  const print = () => window.print();

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setToast('Share link copied');
  };

  const launchPayload = () => ({
    slug: site.slug,
    gatheringType: site.gatheringType,
    plan: site.plan,
    planDetails: getPlanDetails(site.plan),
    privacy: site.privacy,
    customDomain: site.customDomain,
    contact: site.contact,
    privacyReview: site.privacyReview,
    sensitiveReview: site.sensitiveReview,
    familyApproval: site.launchApproval,
    shareMetadata: shareMetadata(),
    shareUrl,
    productionUrl,
    readiness: progress
  });

  const shareMetadata = () => ({
    title: site.searchTitle || `Remembering ${site.name}`,
    description: site.searchDescription || site.story,
    url: site.customDomain ? `https://${site.customDomain}` : shareUrl,
    image: photoSrc(coverPhoto(site)) || `${productionUrl}/kindred-hero.jpg`,
    robots: site.privacy === 'public' ? 'index,follow' : 'noindex,nofollow',
    openGraphType: 'profile',
    canonicalUrl: site.customDomain ? `https://${site.customDomain}` : shareUrl
  });

  const copyShareMetadata = () => {
    copyText(JSON.stringify(shareMetadata(), null, 2), 'Share metadata');
    addActivity('Share metadata copied', 'Search, social preview, canonical URL, and robots settings were copied for publishing.');
  };

  const checkoutPacketText = () => {
    const plan = getPlanDetails(site.plan);
    return [
      `Checkout packet for ${site.name}`,
      '',
      `Selected plan: ${plan.name}`,
      `Price: ${plan.price}`,
      `Billing: ${plan.billing}`,
      `Best for: ${plan.bestFor}`,
      '',
      'Included',
      ...plan.includes.map((item) => `- ${item}`),
      '',
      `Family contact: ${site.contact}`,
      `Page slug: ${site.slug}`,
      `Privacy: ${site.privacy}`,
      `Return URL: ${productionUrl}/?launch=${site.slug || 'memorial'}`
    ].join('\n');
  };

  const copyCheckoutPacket = () => {
    copyText(checkoutPacketText(), 'Checkout packet');
    addActivity('Checkout packet copied', `${site.plan} price, billing, and included items were copied for launch handoff.`);
  };

  const familyApprovalPacketText = () => [
    `Family launch approval for ${site.name}`,
    '',
    `Status: ${site.launchApproval.status}`,
    `Reviewer: ${site.launchApproval.reviewer || 'Not recorded'}`,
    `Reviewed at: ${site.launchApproval.reviewedAt || 'Not recorded'}`,
    `Readiness: ${progress}%`,
    `Privacy review: ${privacyReviewComplete(site) ? 'Complete' : 'Needs review'}`,
    `Privacy reviewer: ${site.privacyReview?.reviewer || 'Not recorded'}`,
    `Privacy reviewed at: ${site.privacyReview?.reviewedAt || 'Not recorded'}`,
    `Sensitive details review: ${sensitiveReviewComplete(site) ? 'Complete' : 'Needs review'}`,
    `Sensitive details reviewer: ${site.sensitiveReview?.reviewer || 'Not recorded'}`,
    `Sensitive details reviewed at: ${site.sensitiveReview?.reviewedAt || 'Not recorded'}`,
    '',
    'Final review',
    ...site.launchApproval.checks.map((check) => `${check.done ? '[approved]' : '[needs review]'} ${check.label}`),
    '',
    'Sensitive details checks',
    ...(site.sensitiveReview?.checks || []).map((check) => `${check.done ? '[reviewed]' : '[needs review]'} ${check.label}`),
    '',
    'Launch choices',
    `Gathering type: ${site.gatheringType}`,
    `Privacy: ${site.privacy}`,
    `Private invite token: ${site.inviteToken}`,
    `Search visibility: ${site.searchVisibility}`,
    `Guest sharing: ${site.allowGuestSharing ? 'Allowed' : 'Family only'}`,
    `Robots: ${shareMetadata().robots}`,
    `Domain: ${site.customDomain || shareUrl}`,
    `Plan: ${site.plan}`,
    '',
    'Counts',
    `Approved memories: ${site.memories.length}`,
    `Pending memories: ${site.pendingMemories.length}`,
    `Kept-private memories: ${site.rejectedMemories?.length || 0}`,
    `Guests: ${site.rsvp.length}`,
    `Photos: ${site.photos.length}`
  ].join('\n');

  const copyFamilyApprovalPacket = () => {
    copyText(familyApprovalPacketText(), 'Family approval packet');
    addActivity('Family approval packet copied', 'Final family review, privacy choices, sensitive details, counts, and launch details were copied.');
  };

  const familyHandoffPacketText = () => {
    const familyOwner = site.coadmins.find((admin) => admin.status === 'Owner') || site.coadmins[0];
    return [
      `Family ownership handoff for ${site.name}`,
      '',
      `Memorial link: ${shareUrl}`,
      `Family owner: ${familyOwner ? `${familyOwner.name} (${familyOwner.email})` : site.contact}`,
      `Family contact: ${site.contact}`,
      `Gathering type: ${site.gatheringType}`,
      `Privacy: ${site.privacy}`,
      `Search visibility: ${site.searchVisibility}`,
      `Guest sharing: ${site.allowGuestSharing ? 'Allowed' : 'Family only'}`,
      '',
      'Launch and review',
      `Launch status: ${site.launchStatus}`,
      `Readiness: ${progress}%`,
      `Family approval: ${approvalComplete(site) ? 'Complete' : 'Needs review'}`,
      `Privacy review: ${privacyReviewComplete(site) ? 'Complete' : 'Needs review'}`,
      `Sensitive details review: ${sensitiveReviewComplete(site) ? 'Complete' : 'Needs review'}`,
      `Archive status: ${site.archiveStatus}`,
      `Retention plan: ${site.retentionPlan}`,
      `Closure status: ${site.closureStatus}`,
      '',
      'Helpers and partner access',
      ...(site.coadmins || []).map((admin) => `- ${admin.name}: ${admin.role}, ${admin.email}, ${admin.status || 'Active'}`),
      `Partner organization: ${site.partner?.organization || 'Not connected'}`,
      `Partner coordinator: ${site.partner?.coordinator || 'Not recorded'}`,
      `Partner handoff status: ${site.partner?.handoffStatus || 'Not recorded'}`,
      '',
      'Records included',
      `Guests: ${site.rsvp.length}`,
      `Approved memories: ${site.memories.length}`,
      `Pending memories: ${site.pendingMemories.length}`,
      `Photos: ${site.photos.length}`,
      `Support needs: ${site.supportNeeds?.length || 0}`,
      `Closure requests: ${site.closureRequests?.length || 0}`,
      '',
      'Recommended next actions',
      `${site.archiveStatus === 'Exported' ? '[done]' : '[ ]'} Download the family archive`,
      `${privacyReviewComplete(site) ? '[done]' : '[ ]'} Complete privacy and sharing review`,
      `${sensitiveReviewComplete(site) ? '[done]' : '[ ]'} Complete sensitive details review`,
      `${approvalComplete(site) ? '[done]' : '[ ]'} Record final family approval`,
      `${site.partner?.handoffStatus === 'Family handoff sent' ? '[done]' : '[ ]'} Confirm funeral-home/coordinator handoff`,
      `${site.closureRequests?.every((item) => item.status !== 'Needs check') ? '[done]' : '[ ]'} Review closure and data requests`
    ].join('\n');
  };

  const copyFamilyHandoffPacket = () => {
    copyText(familyHandoffPacketText(), 'Family handoff packet');
    addActivity('Family handoff packet copied', 'Ownership, helper access, partner handoff, archive, and next actions were copied for the family.');
  };

  const closurePacketText = () => [
    `Closure and data request packet for ${site.name}`,
    '',
    `Archive status: ${site.archiveStatus}`,
    `Retention plan: ${site.retentionPlan}`,
    `Closure status: ${site.closureStatus}`,
    `Privacy: ${site.privacy}`,
    `Search visibility: ${site.searchVisibility}`,
    `Memorial link: ${shareUrl}`,
    '',
    'Requests',
    ...(site.closureRequests || []).map((item) => `${item.status}: ${item.requester} requested "${item.request}" | Action: ${item.action} | When: ${item.requestedAt}`),
    '',
    'Family contact',
    site.contact
  ].join('\n');

  const copyClosurePacket = () => {
    copyText(closurePacketText(), 'Closure packet');
    addActivity('Closure packet copied', 'Retention plan, closure status, privacy settings, and request log were copied.');
  };

  const startCheckout = () => {
    const selectedPlan = getPlanDetails(site.plan);
    update('checkoutStatus', 'Checkout started');
    addActivity('Checkout started', `${site.plan} checkout was prepared for this memorial.`);
    const params = new URLSearchParams({
      plan: site.plan,
      price: selectedPlan.price,
      billing: selectedPlan.billing,
      slug: site.slug || 'memorial',
      contact: site.contact || '',
      return_url: `${productionUrl}/?launch=${site.slug || 'memorial'}`
    });
    if (checkoutUrl) {
      window.open(`${checkoutUrl}?${params.toString()}`, '_blank', 'noopener,noreferrer');
      setToast('Checkout opened');
      return;
    }
    setTimeout(() => update('checkoutStatus', 'Paid'), 250);
    setToast('Checkout marked paid');
  };

  const connectDomain = () => {
    const nextStatus = site.customDomain ? 'DNS instructions ready' : 'Use Kindred subdomain';
    update('domainStatus', nextStatus);
    addActivity('Domain instructions prepared', `${site.customDomain || `${site.slug}.kindred.page`} setup details were copied.`);
    copyText(
      [
        `Domain: ${site.customDomain || `${site.slug}.kindred.page`}`,
        'CNAME: cname.kindred.page',
        'TXT verification: kindred-site-verification',
        `Fallback link: ${shareUrl}`
      ].join('\n'),
      'Domain instructions'
    );
  };

  const publishPage = async () => {
    if (progress < 100) {
      setToast('Finish the readiness checklist first');
      return;
    }
    if (!approvalComplete(site)) {
      setToast('Record family approval first');
      return;
    }
    if (!privacyReviewComplete(site)) {
      setToast('Record privacy review first');
      return;
    }
    if (!sensitiveReviewComplete(site)) {
      setToast('Record sensitive details review first');
      return;
    }
    const payload = launchPayload();
    update('launchStatus', 'Publishing');
    addActivity('Publish started', 'The launch packet was prepared for publishing.');
    if (publishEndpoint) {
      try {
        await fetch(publishEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        update('launchStatus', 'Published');
        addActivity('Page published', `${site.name}'s memorial was published.`);
        setToast('Page published');
      } catch {
        update('launchStatus', 'Needs review');
        downloadTextFile(`${site.slug || 'kindred'}-publish-payload.json`, JSON.stringify(payload, null, 2), 'application/json');
        addActivity('Publish needs review', 'The publish payload was downloaded for manual launch support.');
        setToast('Publish payload downloaded');
      }
      return;
    }
    update('launchStatus', 'Published');
      addActivity('Page marked published', 'The memorial page was marked published in this environment.');
    setToast('Page published locally');
  };

  const sendInvites = () => {
    const recipients = site.rsvp.map((guest) => `${guest.name}${guest.email ? ` <${guest.email}>` : ''}${guest.phone ? ` ${guest.phone}` : ''}${guest.group ? ` [${guest.group}]` : ''}`).join('\n');
    setSite((current) => ({
      ...current,
      inviteStatus: `Queued for ${current.rsvp.length} guests`,
      rsvp: current.rsvp.map((guest) => ({ ...guest, inviteSent: true }))
    }));
    update('inviteStatus', `Queued for ${site.rsvp.length} guests`);
    addActivity('Invites prepared', `${site.rsvp.length} guest invite${site.rsvp.length === 1 ? '' : 's'} queued for sharing.`);
    copyText(`${site.messages.invite} ${shareUrl}\n\nGuest contacts:\n${recipients}`, 'Invite batch');
  };

  return (
    <main className={`app template-${site.template}`}>
      <a className="skip-link" href={route === '/builder' ? '#builder' : '#page-content'}>{route === '/builder' ? 'Skip to builder' : 'Skip to page content'}</a>
      <TopBar route={route} savedAt={savedAt} progress={progress} storageStatus={storageStatus} onNavigate={navigate} onBuilder={() => openStep(active)} onCopy={copyLink} onArchive={downloadJson} onPrint={print} />
      {route === '/' && (
        <>
      <section id="page-content" className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Flower2 size={16} /> Kindred Pages</div>
          <h1>Memorial websites families can finish gently.</h1>
          <p>
            Build a polished celebration-of-life page, collect stories, share service details, create print-ready keepsakes,
            and preserve everything in a private family archive.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => openStep('person')}>
              Start building <ChevronRight size={18} />
            </button>
            <button className="secondary" onClick={copyLink}>
              <Globe2 size={18} /> Copy share link
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <img src={heroImage} alt="Family photographs and a memorial page being arranged on a quiet table" />
          <div className="hero-card">
            <span>{progress}% ready</span>
            <strong>{site.name}</strong>
            <small>{shareUrl}</small>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Product capabilities">
        <Capability icon={Lock} title="Private by default" text="Invite-only, password, public, or hidden from search." />
        <Capability icon={MessageCircle} title="Memory collection" text="Guestbook, stories, photos, voice-note prompts, and moderation." />
        <Capability icon={QrCode} title="Service-ready" text="QR cards, printable programs, livestream, RSVP, and donation links." />
        <Capability icon={Archive} title="Family archive" text="Downloadable keepsake bundle and long-term preservation controls." />
      </section>
      <HomeWorkflow onStart={() => openStep('person')} onPreview={() => navigate('/preview')} onTrust={() => navigate('/trust')} />
        </>
      )}

      {route === '/builder' && (
      <section id="builder" className="builder-shell">
        <aside className="rail" aria-label="Builder sections">
          <div>
            <p className="rail-label">Build</p>
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <button key={step.id} className={active === step.id ? 'active nav-step' : 'nav-step'} aria-current={active === step.id ? 'step' : undefined} onClick={() => openStep(step.id)}>
                  <Icon size={18} /> <span>{step.label}</span>
                  <em className={stepStatuses[step.id] ? 'step-state done' : 'step-state'} aria-label={stepStatuses[step.id] ? `${step.label} ready` : `${step.label} needs attention`}>
                    {stepStatuses[step.id] ? <Check size={12} /> : null}
                  </em>
                </button>
              );
            })}
          </div>
          <div className="launch-box">
            <div className="meter" role="progressbar" aria-label="Launch readiness" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
            <strong>Launch readiness</strong>
            <p>{progress < 100 ? 'A few details still need attention.' : 'This page is ready to share.'}</p>
            <button onClick={() => openStep('settings')}>Review checklist</button>
          </div>
          <FamilyLaunchGuide actions={familyGuide} onSelect={openStep} />
        </aside>

        <section className="editor">
        <Editor active={active} site={site} progress={progress} shareUrl={shareUrl} productionUrl={productionUrl} shareMetadata={shareMetadata} copyShareMetadata={copyShareMetadata} checkoutPacketText={checkoutPacketText} copyCheckoutPacket={copyCheckoutPacket} copyFamilyApprovalPacket={copyFamilyApprovalPacket} copyFamilyHandoffPacket={copyFamilyHandoffPacket} copyClosurePacket={copyClosurePacket} integrationChecks={integrationChecks} applyGatheringPreset={applyGatheringPreset} update={update} updateMessage={updateMessage} updateLivestreamPlan={updateLivestreamPlan} updateList={updateList} removeList={removeList} addMemory={addMemory} addMilestone={addMilestone} addScheduleItem={addScheduleItem} addCareContact={addCareContact} addDayOfTask={addDayOfTask} addGuestFaq={addGuestFaq} addCustomCare={addCustomCare} addSupportGift={addSupportGift} addSupportNeed={addSupportNeed} addAftercareReminder={addAftercareReminder} addAnniversaryCare={addAnniversaryCare} updateAnniversaryStatus={updateAnniversaryStatus} addThankYouRecipient={addThankYouRecipient} addCoadmin={addCoadmin} coadminInviteText={coadminInviteText} copyCoadminInvite={copyCoadminInvite} addServiceOrderItem={addServiceOrderItem} addProgramPerson={addProgramPerson} addServiceSelection={addServiceSelection} addGuestUpdate={addGuestUpdate} addObituaryPlacement={addObituaryPlacement} updateObituaryPlacementStatus={updateObituaryPlacementStatus} addClosureRequest={addClosureRequest} updatePartner={updatePartner} addPartnerDraft={addPartnerDraft} markHandoffReady={markHandoffReady} toggleAftercare={toggleAftercare} toggleThankYouSent={toggleThankYouSent} toggleDayOfTask={toggleDayOfTask} toggleGuestFollowUp={toggleGuestFollowUp} toggleGuestInvite={toggleGuestInvite} updateClosureRequestStatus={updateClosureRequestStatus} handlePhotos={handlePhotos} setCoverPhoto={setCoverPhoto} setSite={setSite} qrDataUrl={qrDataUrl} approveMemory={approveMemory} rejectMemory={rejectMemory} addRsvp={addRsvp} importGuestList={importGuestList} toggleTask={toggleTask} toggleAccessibilityCheck={toggleAccessibilityCheck} toggleApprovalCheck={toggleApprovalCheck} updateLaunchApproval={updateLaunchApproval} markLaunchApproved={markLaunchApproved} togglePrivacyReviewCheck={togglePrivacyReviewCheck} updatePrivacyReview={updatePrivacyReview} markPrivacyReviewed={markPrivacyReviewed} toggleSensitiveReviewCheck={toggleSensitiveReviewCheck} updateSensitiveReview={updateSensitiveReview} markSensitiveReviewed={markSensitiveReviewed} downloadCsv={downloadCsv} downloadCalendar={downloadCalendar} downloadProgram={downloadProgram} downloadMemoryBook={downloadMemoryBook} downloadQrCards={downloadQrCards} downloadGuestGuide={downloadGuestGuide} downloadDayOfPacket={downloadDayOfPacket} copyAftercarePacket={copyAftercarePacket} aftercarePacketText={aftercarePacketText} dayOfPacketText={dayOfPacketText} downloadJson={downloadJson} startCheckout={startCheckout} connectDomain={connectDomain} publishPage={publishPage} sendInvites={sendInvites} copyText={copyText} guestGuideText={guestGuideText} importArchive={importArchive} resetSample={resetSample} />
        </section>

        <aside className="preview-wrap">
          <div className="preview-toolbar">
            <span><Eye size={16} /> Live page</span>
            <div className="segmented">
              <button className={previewMode === 'desktop' ? 'selected' : ''} aria-pressed={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')}>Wide</button>
              <button className={previewMode === 'mobile' ? 'selected' : ''} aria-pressed={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')}>Phone</button>
            </div>
          </div>
          <div className={`preview ${previewMode}`} ref={printRef}>
            <MemorialPage site={site} shareUrl={shareUrl} qrDataUrl={qrDataUrl} onGuestMemory={submitGuestMemory} onGuestRsvp={addRsvp} onSupportClaim={claimSupportNeed} onCalendar={downloadCalendar} />
          </div>
        </aside>
      </section>
      )}

      {route === '/preview' && (
        <section id="page-content" className="preview-page">
          <div className="page-head">
            <p className="eyebrow"><Eye size={16} /> Family-facing page</p>
            <h1>A clean memorial page guests can understand immediately.</h1>
            <p>Guests see service details, RSVP, support options, livestream information, and a gentle memory form without needing to learn the builder.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => openStep('service')}>Edit details <ChevronRight size={18} /></button>
              <button className="secondary" onClick={copyLink}><Globe2 size={18} /> Copy share link</button>
            </div>
          </div>
          <div className="public-preview-frame">
            <MemorialPage site={site} shareUrl={shareUrl} qrDataUrl={qrDataUrl} onGuestMemory={submitGuestMemory} onGuestRsvp={addRsvp} onSupportClaim={claimSupportNeed} onCalendar={downloadCalendar} />
          </div>
        </section>
      )}

      {route === '/pricing' && (
        <PricingPage onStart={() => openStep('person')} onPartners={() => navigate('/partners')} />
      )}

      {route === '/partners' && <PartnerMarketingPage site={site} onStart={() => openStep('partner')} onPricing={() => navigate('/pricing')} />}
      {route === '/trust' && (
        <>
          <TrustCenter />
          <TrustResearchPage onStart={() => openStep('settings')} />
        </>
      )}

      {toast && <div className="toast" role="status" aria-live="polite"><Check size={16} /> {toast}</div>}
    </main>
  );
}

function HomeWorkflow({ onStart, onPreview, onTrust }) {
  const pages = [
    { icon: FileHeart, title: 'Start with the person', text: 'Names, dates, gathering type, tone, and a few gentle story prompts get the family unstuck quickly.', action: 'Open builder', onClick: onStart },
    { icon: UserCheck, title: 'Make guests feel cared for', text: 'Service access, parking, children, rituals, livestream, RSVP, and support needs sit in one calm place.', action: 'See preview', onClick: onPreview },
    { icon: Shield, title: 'Review before sharing', text: 'Privacy, sensitive details, moderation, launch approval, and archive controls are checked before the page goes out.', action: 'View trust', onClick: onTrust }
  ];

  return (
    <section className="page-section workflow-section">
      <div className="page-head compact">
        <p className="eyebrow"><Sparkles size={16} /> Simple by design</p>
        <h2>Each page does one job, so families are never staring at a blank website builder.</h2>
        <p>The workflow follows bereavement research: hold the story, reduce practical stress, protect privacy, and make support easier to give.</p>
      </div>
      <div className="workflow-grid">
        {pages.map(({ icon: Icon, title, text, action, onClick }) => (
          <article key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{text}</p>
            <button className="secondary" onClick={onClick}>{action} <ChevronRight size={16} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PartnerMarketingPage({ site, onStart, onPricing }) {
  const partnerStats = [
    ['Family drafts', site.partnerDrafts?.length || 0],
    ['Package', site.partner.defaultPackage],
    ['Handoff', site.partner.handoffStatus],
    ['Billing', site.partner.billingMode]
  ];
  const workflow = [
    ['Intake', 'Start a polished family draft with service details, gathering type, privacy defaults, and obituary copy already organized.'],
    ['Coordinate', 'Track RSVPs, guest needs, livestream backup, readings, support links, and open service-day tasks in one place.'],
    ['Handoff', 'Give the family ownership notes, archive status, helper access, privacy choices, and next actions without loose spreadsheets.']
  ];
  const outcomes = [
    ['Less repeated coordination', 'Families and guests can find parking, access, livestream, reception, RSVP, and support details without calling the office.'],
    ['A sellable digital add-on', 'The partner plan supports recurring family drafts, co-branding, package status, and simple handoff around existing service work.'],
    ['Respectful boundaries', 'Moderation, family ownership, noindex defaults, and scoped co-admin access keep the funeral home helpful without taking over.']
  ];

  return (
    <section id="page-content" className="page-section partner-page">
      <div className="partner-landing">
        <div className="page-head">
          <p className="eyebrow"><HeartHandshake size={16} /> Funeral-home partners</p>
          <h1>A digital memorial add-on families can actually finish.</h1>
          <p>Partner teams can prepare a polished draft, co-brand the handoff, help with service logistics, and leave final ownership with the family.</p>
          <div className="hero-actions">
            <button className="primary" onClick={onStart}>Open Partner Desk <ChevronRight size={18} /></button>
            <button className="secondary" onClick={onPricing}><CreditCard size={18} /> See plans</button>
          </div>
        </div>
        <div className="partner-page-grid">
          <article>
            <h2>{site.partner.organization}</h2>
            <p>{site.partner.brandLine}</p>
            <div className="partner-mark-large">{site.partner.logoInitials}</div>
          </article>
          <div className="workflow-grid compact-cards">
            {partnerStats.map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>
      <section className="partner-workflow">
        <div className="page-head compact">
          <p className="eyebrow"><Rocket size={16} /> Partner workflow</p>
          <h2>Built around the handoff families already expect from a care team.</h2>
        </div>
        <div className="partner-flow">
          {workflow.map(([title, text], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="workflow-grid">
        <article><Users size={22} /><h3>Scoped collaboration</h3><p>Funeral homes can help coordinate pages without owning the family archive or private memories.</p></article>
        <article><Printer size={22} /><h3>Service-day exports</h3><p>Programs, QR cards, day-of packets, guest guides, and coordinator briefs are ready for real gatherings.</p></article>
        <article><Archive size={22} /><h3>Clean handoff</h3><p>Families receive ownership notes, archive status, helper roles, privacy choices, and the next actions in one packet.</p></article>
      </div>
      <section className="partner-outcomes">
        {outcomes.map(([title, text]) => (
          <article key={title}>
            <Check size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </section>
  );
}

function TrustResearchPage({ onStart }) {
  const principles = [
    ['Continuing bonds', 'Memory collection, archives, and later anniversary prompts help families keep a meaningful connection through stories and rituals.'],
    ['Dual-process coping', 'The app separates story work from practical tasks because bereaved families often move between emotional and logistical needs.'],
    ['Social support buffering', 'Guest care, RSVP, support needs, and clear access details make it easier for people to show up helpfully.'],
    ['Family control', 'Moderation, privacy review, sensitive-details review, and noindex defaults reduce avoidable exposure in a vulnerable moment.']
  ];

  return (
    <section className="page-section research-page">
      <div className="page-head compact">
        <p className="eyebrow"><Search size={16} /> Research-backed structure</p>
        <h2>The product is niche on purpose: memorial pages need different rules than generic websites.</h2>
        <p>Kindred Pages is organized around bereavement, family coordination, privacy, and practical guest care rather than templates and marketing sections.</p>
      </div>
      <div className="research-grid">
        {principles.map(([title, text]) => (
          <article key={title}>
            <Check size={18} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="source-note">
        <strong>Sources used in the product rationale</strong>
        <p>Klass, Silverman, and Nickman on continuing bonds; Stroebe and Schut on dual-process coping; Cohen and Wills on social support buffering; Walter and later online memorial research on biography, memory, and digital remembrance.</p>
        <button className="primary" onClick={onStart}>Review launch controls <ChevronRight size={18} /></button>
      </div>
    </section>
  );
}

function PricingPage({ onStart, onPartners }) {
  return (
    <section id="page-content" className="pricing-page page-section">
      <div className="pricing-hero">
        <div>
          <p className="eyebrow"><HeartHandshake size={16} /> Launch model</p>
          <h1>Simple pricing for a sensitive, high-stakes job.</h1>
          <p>Families should not need a sales call to share service details, collect memories, and preserve the archive. Funeral homes get a clear partner plan for repeatable family handoffs.</p>
          <div className="hero-actions">
            <button className="primary" onClick={onStart}>Start a family page <ChevronRight size={18} /></button>
            <button className="secondary" onClick={onPartners}><HeartHandshake size={18} /> Partner workflow</button>
          </div>
        </div>
        <Pricing />
      </div>
      <PricingGuidance />
    </section>
  );
}

function PricingGuidance() {
  const fit = [
    ['Family Page', 'Best when the family needs a private page, RSVP, QR card, memories, and service details without long-term archive planning.'],
    ['Legacy Archive', 'Best when the family wants the program, memory book, aftercare packet, archive manifest, and anniversary care in one place.'],
    ['Funeral Home', 'Best when a care team needs co-branded drafts, scoped co-admins, package status, and clean ownership handoff for many families.']
  ];
  const outcomes = [
    ['Before the service', 'Private link, RSVP list, livestream details, guest-care notes, invite copy, and QR cards.'],
    ['During the gathering', 'Guest guide, service program, day-of packet, support needs, and memory table prompts.'],
    ['Afterward', 'Approved memories, memory book, thank-you tracker, anniversary prompts, closure log, and downloadable archive.']
  ];
  const questions = [
    ['Can a page stay private?', 'Yes. Invite-only, passcode, hidden search, and family review controls are built into the workflow.'],
    ['Do guests post directly?', 'No. Memories, photos, and voice notes go to family moderation before appearing publicly.'],
    ['Can funeral homes hand pages back?', 'Yes. The Partner Desk keeps co-admin help scoped and gives families ownership, archive status, and next actions.']
  ];

  return (
    <>
      <div className="pricing-fit-grid">
        {fit.map(([title, text]) => (
          <article key={title}>
            <Check size={18} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="pricing-outcomes">
        <div className="page-head compact">
          <p className="eyebrow"><Archive size={16} /> What the purchase covers</p>
          <h2>Not a template fee. It covers the moments families actually need help with.</h2>
        </div>
        <div className="workflow-grid">
          {outcomes.map(([title, text]) => (
            <article key={title}>
              <Sparkles size={20} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="pricing-faq">
        {questions.map(([question, answer]) => (
          <article key={question}>
            <strong>{question}</strong>
            <p>{answer}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function TopBar({ route, savedAt, progress, storageStatus, onNavigate, onBuilder, onCopy, onArchive, onPrint }) {
  const navItems = [
    ['/', 'Home'],
    ['/builder', 'Builder'],
    ['/preview', 'Preview'],
    ['/pricing', 'Pricing'],
    ['/partners', 'Partners'],
    ['/trust', 'Trust']
  ];

  return (
    <header className="topbar">
      <button className="brand brand-button" onClick={() => onNavigate('/')}>
        <span className="brand-mark">K</span><span>Kindred Pages</span>
      </button>
      <nav className="site-nav" aria-label="Main pages">
        {navItems.map(([path, label]) => (
          <button key={path} className={route === path ? 'selected' : ''} aria-current={route === path ? 'page' : undefined} onClick={() => (path === '/builder' ? onBuilder() : onNavigate(path))}>
            {label}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <span className="save-note"><Save size={15} /> Saved {savedAt || 'now'}</span>
        <span className="storage-note"><Archive size={15} /> {storageStatus}</span>
        <span className="progress-pill">{progress}% ready</span>
        <button onClick={onPrint} title="Print" aria-label="Print memorial page"><Printer size={17} /></button>
        <button onClick={onArchive} title="Download archive" aria-label="Download archive"><Download size={17} /></button>
        <button className="primary small" onClick={onCopy}><Globe2 size={16} /> Share</button>
      </div>
    </header>
  );
}

function Capability({ icon: Icon, title, text }) {
  return (
    <article>
      <Icon size={22} />
      <div><strong>{title}</strong><p>{text}</p></div>
    </article>
  );
}

function FamilyLaunchGuide({ actions, onSelect }) {
  return (
    <div className="family-guide">
      <div className="family-guide-head">
        <Sparkles size={16} />
        <strong>What Matters Next</strong>
      </div>
      <p>Start with the essentials. Keepsakes, partner tools, and archive settings can wait until the page feels calm and true.</p>
      <div className="family-guide-list">
        {actions.length ? actions.map((action) => (
          <button key={`${action.section}-${action.title}`} onClick={() => onSelect(action.section)}>
            <span>{action.priority}</span>
            <strong>{action.title}</strong>
            <small>{action.detail}</small>
          </button>
        )) : (
          <button onClick={() => onSelect('settings')}>
            <span>Ready</span>
            <strong>Review launch</strong>
            <small>The essentials are filled in. Check privacy, invite, and archive settings.</small>
          </button>
        )}
      </div>
    </div>
  );
}

function Editor({ active, site, progress, shareUrl, productionUrl, shareMetadata, copyShareMetadata, checkoutPacketText, copyCheckoutPacket, copyFamilyApprovalPacket, copyFamilyHandoffPacket, copyClosurePacket, integrationChecks, applyGatheringPreset, update, updateMessage, updateLivestreamPlan, updateList, removeList, addMemory, addMilestone, addScheduleItem, addCareContact, addDayOfTask, addGuestFaq, addCustomCare, addSupportGift, addSupportNeed, addAftercareReminder, addAnniversaryCare, updateAnniversaryStatus, addThankYouRecipient, addCoadmin, copyCoadminInvite, addServiceOrderItem, addProgramPerson, addServiceSelection, addGuestUpdate, addObituaryPlacement, updateObituaryPlacementStatus, addClosureRequest, updatePartner, addPartnerDraft, markHandoffReady, toggleAftercare, toggleThankYouSent, toggleDayOfTask, toggleGuestFollowUp, toggleGuestInvite, updateClosureRequestStatus, handlePhotos, setCoverPhoto, setSite, qrDataUrl, approveMemory, rejectMemory, addRsvp, importGuestList, toggleTask, toggleAccessibilityCheck, toggleApprovalCheck, updateLaunchApproval, markLaunchApproved, togglePrivacyReviewCheck, updatePrivacyReview, markPrivacyReviewed, toggleSensitiveReviewCheck, updateSensitiveReview, markSensitiveReviewed, downloadCsv, downloadCalendar, downloadProgram, downloadMemoryBook, downloadQrCards, downloadGuestGuide, downloadDayOfPacket, copyAftercarePacket, aftercarePacketText, dayOfPacketText, downloadJson, startCheckout, connectDomain, publishPage, sendInvites, copyText, guestGuideText, importArchive, resetSample }) {
  const [guestImportText, setGuestImportText] = useState('');

  const privateInviteUrl = `${shareUrl}?invite=${site.inviteToken || 'family'}`;
  const guestInviteText = (guest) => [
    `Hi ${guest.name?.split(' ')[0] || 'there'},`,
    '',
    `${site.messages.invite} ${privateInviteUrl}`,
    '',
    `${site.serviceTitle}: ${site.serviceDate} at ${site.serviceTime}`,
    site.servicePlace,
    site.livestream ? `Online link: ${site.livestream}` : '',
    '',
    site.messages.memoryRequest
  ].filter(Boolean).join('\n');

  const pendingInvitePacket = () => {
    const guests = site.rsvp.filter((guest) => !guest.inviteSent);
    const invitees = guests.length ? guests : site.rsvp;
    return [
      `${guests.length ? 'Pending' : 'All'} guest invites for ${site.name}`,
      '',
      ...invitees.flatMap((guest) => [
        `${guest.name}${guest.email ? ` <${guest.email}>` : ''}${guest.phone ? ` ${guest.phone}` : ''}${guest.group ? ` [${guest.group}]` : ''}`,
        guestInviteText(guest),
        ''
      ])
    ].join('\n').trim();
  };

  const coordinatorBriefText = () => {
    const openTasks = (site.dayOfChecklist || []).filter((task) => !task.done);
    const guestNeeds = (site.rsvp || []).filter((guest) => guest.needs || (guest.note && guest.note !== 'No note'));
    const openNeeds = (site.supportNeeds || []).filter((need) => need.status === 'Open');

    return [
      `Service-day coordinator brief for ${site.name}`,
      '',
      `${site.serviceTitle}: ${site.serviceDate} at ${site.serviceTime}`,
      `${site.servicePlace}${site.serviceAddress ? `, ${site.serviceAddress}` : ''}`,
      `Livestream: ${site.livestream || 'Not added'}`,
      `Backup: ${site.livestreamPlan?.backup || 'Not added'}`,
      '',
      'Arrival and access',
      `Parking: ${site.parking || 'Not added'}`,
      `Accessibility: ${site.accessibility || 'Not added'}`,
      `Reception: ${site.reception || 'Not added'}`,
      '',
      'Open coordinator tasks',
      ...(openTasks.length ? openTasks.map((task) => `[ ] ${task.area}: ${task.task} (${task.owner})`) : ['All day-of tasks are marked ready.']),
      '',
      'Guest needs to watch',
      ...(guestNeeds.length ? guestNeeds.map((guest) => `${guest.followUpDone ? '[done]' : '[ ]'} ${guest.name}: ${[guest.attending, guest.partySize ? `party ${guest.partySize}` : '', guest.needs, guest.note].filter(Boolean).join(' - ')}`) : ['No guest needs recorded.']),
      '',
      'Open support needs',
      ...(openNeeds.length ? openNeeds.map((need) => `${need.title} (${need.category}, ${need.date})`) : ['No open support needs.']),
      '',
      'Helpful contacts',
      ...(site.careContacts || []).map((contact) => `${contact.name} (${contact.role}): ${contact.detail}`)
    ].join('\n');
  };

  const addStoryStarter = (text) => {
    const spacer = site.story.trim() ? '\n\n' : '';
    update('story', `${site.story.trim()}${spacer}${text}`);
  };

  if (active === 'person') {
    return (
      <Panel title="The Person" intro="Start with the details families expect to see first.">
        <div className="setup-presets">
          <div className="section-line">
            <h3>Guided Setup</h3>
            <span>{site.gatheringType}</span>
          </div>
          <p>Choose the closest situation. Kindred will adjust the service, privacy, schedule, guest-care, and wording defaults while keeping the family story intact.</p>
          <div className="preset-grid">
            {gatheringPresets.map((preset) => (
              <button className={site.gatheringType === preset.label ? 'preset-card selected' : 'preset-card'} key={preset.id} onClick={() => applyGatheringPreset(preset)}>
                <strong>{preset.label}</strong>
                <span>{preset.bestFor}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid two">
          <Field label="Full name" value={site.name} onChange={(v) => update('name', v)} />
          <Field label="Dates" value={site.lifespan} onChange={(v) => update('lifespan', v)} />
          <Field label="Relationship line" value={site.relationship} onChange={(v) => update('relationship', v)} />
          <Field label="Page address" value={site.slug} prefix="kindred.page/" onChange={(v) => update('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
        </div>
        <div className="template-grid">
          {Object.entries(templates).map(([id, template]) => (
            <button key={id} className={site.template === id ? 'template selected' : 'template'} onClick={() => update('template', id)}>
              <span style={{ background: template.accent }} />
              {template.label}
            </button>
          ))}
        </div>
        <PhotoUploader photos={site.photos} onFiles={handlePhotos} onRemove={(i) => removeList('photos', i)} onUpdate={(i, patch) => updateList('photos', i, patch)} onCover={setCoverPhoto} />
      </Panel>
    );
  }

  if (active === 'story') {
    return (
      <Panel title="Story & Legacy" intro="Keep the language guided, editable, and never blank-page scary.">
        <div className="tone-grid">
          {Object.entries(tones).map(([id, tone]) => (
            <button key={id} className={site.tone === id ? 'tone selected' : 'tone'} onClick={() => update('tone', id)}>
              <strong>{tone.label}</strong><span>{tone.hint}</span>
            </button>
          ))}
        </div>
        <div className="story-helper">
          <div>
            <strong>Story starters</strong>
            <p>Use one if the writing box feels too open. Edit the words until they sound like the family.</p>
          </div>
          <div className="story-prompt-grid">
            {storyStarters.map((starter) => (
              <button key={starter.title} className="story-prompt" onClick={() => addStoryStarter(starter.text)}>
                <Sparkles size={16} />
                <span>{starter.title}</span>
              </button>
            ))}
          </div>
        </div>
        <TextArea label="Life story" value={site.story} onChange={(v) => update('story', v)} />
        <div className="grid two">
          <Field label="Music or readings" value={site.music} onChange={(v) => update('music', v)} />
          <Field label="Food or gathering details" value={site.food} onChange={(v) => update('food', v)} />
        </div>
        <h3>Timeline</h3>
        {site.milestones.map((item, index) => (
          <div className="list-row" key={`${item.year}-${index}`}>
            <input value={item.year} onChange={(e) => updateList('milestones', index, { year: e.target.value })} />
            <input value={item.label} onChange={(e) => updateList('milestones', index, { label: e.target.value })} />
            <button onClick={() => removeList('milestones', index)}><Trash2 size={16} /></button>
          </div>
        ))}
        <button className="secondary" onClick={addMilestone}><Plus size={17} /> Add chapter</button>
      </Panel>
    );
  }

  if (active === 'service') {
    return (
      <Panel title="Service Details" intro="Everything a guest needs: time, place, livestream, notes, and support links.">
        <div className="grid two">
          <Field label="Service title" value={site.serviceTitle} onChange={(v) => update('serviceTitle', v)} />
          <Field label="Date" value={site.serviceDate} onChange={(v) => update('serviceDate', v)} />
          <Field label="Time" value={site.serviceTime} onChange={(v) => update('serviceTime', v)} />
          <Field label="Place" value={site.servicePlace} onChange={(v) => update('servicePlace', v)} />
          <Field label="Address" value={site.serviceAddress} onChange={(v) => update('serviceAddress', v)} />
          <Field label="Dress note" value={site.dressNote} onChange={(v) => update('dressNote', v)} />
          <Field label="Livestream link" value={site.livestream} onChange={(v) => update('livestream', v)} />
          <Field label="Donation or flowers link" value={site.donation} onChange={(v) => update('donation', v)} />
        </div>
        <div className="livestream-panel">
          <div className="section-line">
            <h3>Livestream & Recording</h3>
            <button className="secondary" onClick={() => copyText(`${site.serviceTitle}\nWatch: ${site.livestream}\nReplay: ${site.livestreamPlan?.replayUrl || 'Not added'}\nTech contact: ${site.livestreamPlan?.techContact || 'Not added'} ${site.livestreamPlan?.contactDetail || ''}\nBackup: ${site.livestreamPlan?.backup || 'Not added'}`, 'Livestream details')}><Video size={16} /> Copy details</button>
          </div>
          <div className="grid two">
            <Field label="Platform" value={site.livestreamPlan?.platform || ''} onChange={(v) => updateLivestreamPlan('platform', v)} />
            <Field label="Recording status" value={site.livestreamPlan?.recordingStatus || ''} onChange={(v) => updateLivestreamPlan('recordingStatus', v)} />
            <Field label="Tech contact" value={site.livestreamPlan?.techContact || ''} onChange={(v) => updateLivestreamPlan('techContact', v)} />
            <Field label="Contact detail" value={site.livestreamPlan?.contactDetail || ''} onChange={(v) => updateLivestreamPlan('contactDetail', v)} />
            <Field label="Replay link" value={site.livestreamPlan?.replayUrl || ''} onChange={(v) => updateLivestreamPlan('replayUrl', v)} />
          </div>
          <TextArea label="Backup instructions" value={site.livestreamPlan?.backup || ''} onChange={(v) => updateLivestreamPlan('backup', v)} />
        </div>
        <TextArea label="Family wishes" value={site.wishes} onChange={(v) => update('wishes', v)} />
        <div className="action-row">
          <button className="secondary" onClick={downloadCalendar}><CalendarDays size={17} /> Download calendar file</button>
          <button className="secondary" onClick={() => copyText(`${site.serviceTitle}\n${site.serviceDate} at ${site.serviceTime}\n${site.servicePlace}\n${site.serviceAddress}\n${shareUrl}`, 'Service details')}><Mail size={17} /> Copy service details</button>
        </div>
      </Panel>
    );
  }

  if (active === 'guests') {
    const openDayOfTasks = (site.dayOfChecklist || []).filter((task) => !task.done);
    const guestNeedsForBrief = (site.rsvp || []).filter((guest) => guest.needs || (guest.note && guest.note !== 'No note'));
    const openSupportNeedsForBrief = (site.supportNeeds || []).filter((need) => need.status === 'Open');

    return (
      <Panel title="Guest Care" intro="Reduce repeated questions with clear access, travel, ritual, and day-of guidance.">
        <div className="care-summary">
          <CareNote icon={UserCheck} title="Access and seating" text={site.accessibility} />
          <CareNote icon={MapPin} title="Parking and arrival" text={site.parking} />
          <CareNote icon={HeartHandshake} title="Reception" text={site.reception} />
        </div>

        <div className="grid two">
          <TextArea label="Accessibility and seating" value={site.accessibility} onChange={(v) => update('accessibility', v)} />
          <TextArea label="Parking and arrival" value={site.parking} onChange={(v) => update('parking', v)} />
          <TextArea label="Reception or meal" value={site.reception} onChange={(v) => update('reception', v)} />
          <TextArea label="Travel and rides" value={site.travelNote} onChange={(v) => update('travelNote', v)} />
          <Field label="Hotel or lodging note" value={site.hotelBlock} onChange={(v) => update('hotelBlock', v)} />
          <Field label="Children and family seating" value={site.childNote} onChange={(v) => update('childNote', v)} />
          <Field label="Ritual, faith, or cultural note" value={site.ritualNote} onChange={(v) => update('ritualNote', v)} />
          <Field label="Honors or special tribute" value={site.honorsNote} onChange={(v) => update('honorsNote', v)} />
        </div>

        <div className="section-line">
          <h3>Guest FAQ</h3>
          <button className="secondary" onClick={addGuestFaq}><Plus size={16} /> Add question</button>
        </div>
        <div className="guest-faq-editor">
          {(site.guestFaq || []).map((item, index) => (
            <article className="guest-faq-edit" key={`${item.question}-${index}`}>
              <Field label="Question" value={item.question} onChange={(v) => updateList('guestFaq', index, { question: v })} />
              <TextArea label="Answer" value={item.answer} onChange={(v) => updateList('guestFaq', index, { answer: v })} />
              <button onClick={() => removeList('guestFaq', index)}><Trash2 size={16} /> Remove</button>
            </article>
          ))}
        </div>

        <div className="section-line">
          <h3>Custom & Ritual Care</h3>
          <button className="secondary" onClick={addCustomCare}><Plus size={16} /> Add guidance</button>
        </div>
        <div className="custom-care-list">
          {(site.customCare || []).map((item, index) => (
            <article className="custom-care-edit" key={`${item.title}-${index}`}>
              <Field label="Title" value={item.title} onChange={(v) => updateList('customCare', index, { title: v })} />
              <Field label="Audience" value={item.audience} onChange={(v) => updateList('customCare', index, { audience: v })} />
              <Field label="Contact" value={item.contact} onChange={(v) => updateList('customCare', index, { contact: v })} />
              <Field label="Visibility" value={item.visibility} onChange={(v) => updateList('customCare', index, { visibility: v })} />
              <TextArea label="Guidance" value={item.guidance} onChange={(v) => updateList('customCare', index, { guidance: v })} />
              <div className="custom-care-actions">
                {['Public', 'Family only'].map((visibility) => (
                  <button key={visibility} className={item.visibility === visibility ? 'selected' : ''} onClick={() => updateList('customCare', index, { visibility })}>{visibility}</button>
                ))}
                <button onClick={() => removeList('customCare', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>

        <div className="section-line">
          <h3>Day-of Schedule</h3>
          <button className="secondary" onClick={addScheduleItem}><Plus size={16} /> Add time</button>
        </div>
        {site.eventSchedule.map((item, index) => (
          <div className="list-row schedule-row" key={`${item.time}-${index}`}>
            <input value={item.time} onChange={(e) => updateList('eventSchedule', index, { time: e.target.value })} />
            <input value={item.label} onChange={(e) => updateList('eventSchedule', index, { label: e.target.value })} />
            <button onClick={() => removeList('eventSchedule', index)}><Trash2 size={16} /></button>
          </div>
        ))}

        <div className="coordinator-brief">
          <div className="coordinator-brief-head">
            <div>
              <h3>Coordinator Brief</h3>
              <p>One service-day note for the person holding the clipboard: open tasks, guest needs, livestream backup, support needs, and contacts.</p>
            </div>
            <button className="secondary" onClick={() => copyText(coordinatorBriefText(), 'Coordinator brief')}><Download size={16} /> Copy brief</button>
          </div>
          <div className="coordinator-brief-grid">
            <div><span>Open tasks</span><strong>{openDayOfTasks.length}</strong></div>
            <div><span>Guest needs</span><strong>{guestNeedsForBrief.length}</strong></div>
            <div><span>Open support</span><strong>{openSupportNeedsForBrief.length}</strong></div>
            <div><span>Contacts</span><strong>{site.careContacts.length}</strong></div>
          </div>
          <div className="brief-list">
            {(openDayOfTasks.length ? openDayOfTasks : site.dayOfChecklist.slice(0, 2)).slice(0, 3).map((task, index) => (
              <article key={`${task.area}-${index}`}>
                <strong>{task.area}</strong>
                <p>{task.task}</p>
                <span>{task.owner}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="section-line">
          <h3>Day-of Service Packet</h3>
          <button className="secondary" onClick={addDayOfTask}><Plus size={16} /> Add task</button>
        </div>
        <div className="day-of-packet">
          <div className="day-of-summary">
            <Printer size={20} />
            <div>
              <strong>{site.dayOfChecklist.filter((task) => task.done).length} of {site.dayOfChecklist.length} service-day tasks ready</strong>
              <p>Setup, livestream, access, helper roles, and contacts for the people coordinating the gathering.</p>
            </div>
          </div>
          <div className="day-of-list">
            {site.dayOfChecklist.map((task, index) => (
              <article className={task.done ? 'day-of-task done' : 'day-of-task'} key={`${task.area}-${index}`}>
                <button onClick={() => toggleDayOfTask(index)} aria-label={task.done ? 'Mark service task incomplete' : 'Mark service task done'}>
                  {task.done ? <Check size={16} /> : index + 1}
                </button>
                <Field label="Area" value={task.area} onChange={(v) => updateList('dayOfChecklist', index, { area: v })} />
                <Field label="Owner" value={task.owner} onChange={(v) => updateList('dayOfChecklist', index, { owner: v })} />
                <TextArea label="Task" value={task.task} onChange={(v) => updateList('dayOfChecklist', index, { task: v })} />
                <button onClick={() => removeList('dayOfChecklist', index)}><Trash2 size={16} /> Remove</button>
              </article>
            ))}
          </div>
        </div>

        <div className="section-line">
          <h3>Helpful Contacts</h3>
          <button className="secondary" onClick={addCareContact}><Plus size={16} /> Add contact</button>
        </div>
        <div className="contact-list">
          {site.careContacts.map((contact, index) => (
            <div className="contact-edit" key={`${contact.name}-${index}`}>
              <Field label="Name" value={contact.name} onChange={(v) => updateList('careContacts', index, { name: v })} />
              <Field label="Role" value={contact.role} onChange={(v) => updateList('careContacts', index, { role: v })} />
              <Field label="Email or phone" value={contact.detail} onChange={(v) => updateList('careContacts', index, { detail: v })} />
              <button onClick={() => removeList('careContacts', index)}><Trash2 size={16} /> Remove</button>
            </div>
          ))}
        </div>

        <div className="section-line">
          <h3>After-service Reminders</h3>
          <button className="secondary" onClick={addAftercareReminder}><Plus size={16} /> Add reminder</button>
        </div>
        <div className="aftercare-list">
          {site.aftercareReminders.map((task, index) => (
            <div className={task.done ? 'aftercare done' : 'aftercare'} key={`${task.date}-${index}`}>
              <button onClick={() => toggleAftercare(index)} aria-label={task.done ? 'Mark reminder incomplete' : 'Mark reminder done'}>
                {task.done ? <Check size={16} /> : index + 1}
              </button>
              <input value={task.date} onChange={(e) => updateList('aftercareReminders', index, { date: e.target.value })} />
              <input value={task.label} onChange={(e) => updateList('aftercareReminders', index, { label: e.target.value })} />
              <button onClick={() => removeList('aftercareReminders', index)} aria-label="Remove reminder"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="section-line">
          <h3>Anniversary Care</h3>
          <button className="secondary" onClick={addAnniversaryCare}><Plus size={16} /> Add message</button>
        </div>
        <div className="anniversary-list">
          {(site.anniversaryCare || []).map((item, index) => (
            <article className="anniversary-card" key={`${item.date}-${index}`}>
              <div className="anniversary-head">
                <Field label="Date or milestone" value={item.date} onChange={(v) => updateList('anniversaryCare', index, { date: v })} />
                <Field label="Audience" value={item.audience} onChange={(v) => updateList('anniversaryCare', index, { audience: v })} />
              </div>
              <TextArea label="Message draft" value={item.message} onChange={(v) => updateList('anniversaryCare', index, { message: v })} />
              <div className="anniversary-actions">
                {['Draft', 'Scheduled', 'Sent'].map((status) => (
                  <button key={status} className={item.status === status ? 'selected' : ''} onClick={() => updateAnniversaryStatus(index, status)}>{status}</button>
                ))}
                <button className="secondary" onClick={() => copyText(`${item.message} ${shareUrl}`, 'Anniversary message')}><Send size={16} /> Copy</button>
                <button onClick={() => removeList('anniversaryCare', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>

        <div className="section-line">
          <h3>Thank-you Tracker</h3>
          <button className="secondary" onClick={addThankYouRecipient}><Plus size={16} /> Add recipient</button>
        </div>
        <div className="thank-you-list">
          {(site.thankYouList || []).map((item, index) => (
            <article className={item.sent ? 'thank-you-item sent' : 'thank-you-item'} key={`${item.name}-${index}`}>
              <button onClick={() => toggleThankYouSent(index)} aria-label={item.sent ? 'Mark thank-you unsent' : 'Mark thank-you sent'}>
                {item.sent ? <Check size={16} /> : index + 1}
              </button>
              <Field label="Recipient" value={item.name} onChange={(v) => updateList('thankYouList', index, { name: v })} />
              <Field label="Reason" value={item.reason} onChange={(v) => updateList('thankYouList', index, { reason: v })} />
              <Field label="Method" value={item.method} onChange={(v) => updateList('thankYouList', index, { method: v })} />
              <Field label="Due" value={item.due} onChange={(v) => updateList('thankYouList', index, { due: v })} />
              <button onClick={() => removeList('thankYouList', index)}><Trash2 size={16} /> Remove</button>
            </article>
          ))}
        </div>

        <div className="aftercare-packet">
          <Archive size={20} />
          <div>
            <strong>Aftercare Packet</strong>
            <p>Thank-you wording, archive status, reminders, and contact details for the weeks after the service.</p>
            <small>{site.thankYouList.filter((item) => item.sent).length} of {site.thankYouList.length} thank-you notes sent</small>
          </div>
        </div>

        <div className="action-row">
          <button className="secondary" onClick={downloadGuestGuide}><Download size={17} /> Download guest guide</button>
          <button className="secondary" onClick={() => copyText(guestGuideText(), 'Guest guide')}><Mail size={17} /> Copy guest guide</button>
          <button className="secondary" onClick={downloadDayOfPacket}><Printer size={17} /> Download day-of packet</button>
          <button className="secondary" onClick={() => copyText(dayOfPacketText(), 'Day-of packet')}><Mail size={17} /> Copy day-of packet</button>
          <button className="secondary" onClick={copyAftercarePacket}><Archive size={17} /> Copy aftercare packet</button>
        </div>
      </Panel>
    );
  }

  if (active === 'memories') {
    return (
      <Panel title="Guest Memories" intro="Families can moderate stories before they appear publicly.">
        {site.memories.map((memory, index) => (
          <div className="memory-edit" key={`${memory.from}-${index}`}>
            <Field label="From" value={memory.from} onChange={(v) => updateList('memories', index, { from: v })} />
            <Field label="How they knew them" value={memory.relation || ''} onChange={(v) => updateList('memories', index, { relation: v })} />
            <TextArea label="Memory" value={memory.text} onChange={(v) => updateList('memories', index, { text: v })} />
            <Field label="Photo caption" value={memory.caption || ''} onChange={(v) => updateList('memories', index, { caption: v })} />
            <Field label="Voice note label" value={memory.audioLabel || ''} onChange={(v) => updateList('memories', index, { audioLabel: v })} />
            {memory.photo && <img className="memory-photo-preview" src={memory.photo} alt="" />}
            {memory.audio && <audio className="memory-audio" src={memory.audio} controls />}
            <button onClick={() => removeList('memories', index)}><Trash2 size={16} /> Remove</button>
          </div>
        ))}
        <button className="secondary" onClick={addMemory}><Plus size={17} /> Add memory</button>
        <div className="prompt-bank">
          <Prompt icon={Mic} text="Record a 60-second voice memory" />
          <Prompt icon={Image} text="Ask guests for one favorite photo" />
          <Prompt icon={Mail} text="Send a private contribution link" />
        </div>
      </Panel>
    );
  }

  if (active === 'keepsakes') {
    return (
      <Panel title="Keepsakes & Print" intro="Make the digital page useful inside the actual memorial gathering.">
        <div className="keepsake-grid">
          <Keepsake icon={QrCode} title="QR table cards" text="Printable cards linking guests to the memory form." />
          <Keepsake icon={Printer} title="Service program" text="A folded program with timeline, poem space, and QR code." />
          <Keepsake icon={FileHeart} title="Memory book" text="A printable keepsake with story, photos, chapters, and memories." />
          <Keepsake icon={Archive} title="Family archive" text="Download data, photos, and approved stories together." />
          <Keepsake icon={Gift} title="Thank-you list" text="Track attendees, donors, and contributors after the service." />
        </div>
        <div className="print-card">
          <QrImage src={qrDataUrl} label={`QR code for kindred.page/${site.slug}`} />
          <div>
            <strong>Memory table card</strong>
            <p>Scan to share a story, upload a photo, or leave a note for the family.</p>
            <small>kindred.page/{site.slug}</small>
          </div>
        </div>
        <div className="program-builder">
          <div className="section-line">
            <h3>Order of Service</h3>
            <button className="secondary" onClick={addServiceOrderItem}><Plus size={16} /> Add moment</button>
          </div>
          {site.serviceOrder.map((item, index) => (
            <div className="list-row program-row" key={`${item.time}-${index}`}>
              <input value={item.time} onChange={(event) => updateList('serviceOrder', index, { time: event.target.value })} />
              <input value={item.label} onChange={(event) => updateList('serviceOrder', index, { label: event.target.value })} />
              <button onClick={() => removeList('serviceOrder', index)}><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="section-line">
            <h3>Program Participants</h3>
            <button className="secondary" onClick={addProgramPerson}><Plus size={16} /> Add person</button>
          </div>
          <div className="program-people">
            {site.programPeople.map((person, index) => (
              <div className="list-row program-person-row" key={`${person.role}-${index}`}>
                <input value={person.role} onChange={(event) => updateList('programPeople', index, { role: event.target.value })} />
                <input value={person.name} onChange={(event) => updateList('programPeople', index, { name: event.target.value })} />
                <button onClick={() => removeList('programPeople', index)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className="section-line">
            <h3>Readings, Music & Tributes</h3>
            <button className="secondary" onClick={addServiceSelection}><Plus size={16} /> Add selection</button>
          </div>
          <div className="service-selection-list">
            {site.serviceSelections.map((item, index) => (
              <article className="service-selection" key={`${item.type}-${item.title}-${index}`}>
                <Field label="Type" value={item.type} onChange={(v) => updateList('serviceSelections', index, { type: v })} />
                <Field label="Title" value={item.title} onChange={(v) => updateList('serviceSelections', index, { title: v })} />
                <Field label="Person or source" value={item.person} onChange={(v) => updateList('serviceSelections', index, { person: v })} />
                <Field label="Status" value={item.status} onChange={(v) => updateList('serviceSelections', index, { status: v })} />
                <TextArea label="Program note" value={item.note} onChange={(v) => updateList('serviceSelections', index, { note: v })} />
                <button onClick={() => removeList('serviceSelections', index)}><Trash2 size={16} /> Remove</button>
              </article>
            ))}
          </div>
        </div>
        <div className="action-row">
          <button className="secondary" onClick={downloadQrCards}><QrCode size={17} /> Download QR cards</button>
          <button className="secondary" onClick={downloadProgram}><Download size={17} /> Download service program</button>
          <button className="secondary" onClick={downloadMemoryBook}><FileHeart size={17} /> Download memory book</button>
          <button className="secondary" onClick={() => copyText(shareUrl, 'Memory page link')}><QrCode size={17} /> Copy QR link</button>
        </div>
      </Panel>
    );
  }

  if (active === 'announcements') {
    const announcementPacket = [
      `Subject: ${site.messages.emailSubject}`,
      '',
      'Private invite',
      `${site.messages.invite} ${shareUrl}`,
      '',
      'SMS invite',
      `${site.messages.smsInvite} ${shareUrl}`,
      '',
      'Obituary',
      site.messages.obituary,
      '',
      'Newspaper notice',
      `${site.messages.newspaperNotice} ${shareUrl}`,
      '',
      'Publication tracker',
      ...(site.obituaryPlacements || []).map((item) => `${item.status}: ${item.outlet} (${item.type}) - deadline ${item.deadline}, contact ${item.contact}, cost ${item.cost}`),
      '',
      'Social post',
      `${site.messages.socialPost} ${shareUrl}`,
      '',
      'Livestream reminder',
      `${site.messages.livestreamReminder} ${shareUrl}`,
      '',
      'Guest updates',
      ...(site.guestUpdates || []).map((update) => `${update.urgent ? 'Urgent - ' : ''}${update.timing}: ${update.title} - ${update.detail}`),
      '',
      'Thank-you note',
      site.messages.thankYou
    ].join('\n');

    return (
      <Panel title="Announcements" intro="Ready-to-send wording for invites, obituary notices, social posts, and after-service notes.">
        <div className="announcement-actions">
          <button className="primary" onClick={() => copyText(announcementPacket, 'Announcement packet')}><Download size={17} /> Copy packet</button>
          <button className="secondary" onClick={() => copyText(`${site.messages.smsInvite} ${shareUrl}`, 'SMS invite')}><Send size={17} /> Copy SMS</button>
          <button className="secondary" onClick={() => copyText(`${site.messages.livestreamReminder} ${shareUrl}`, 'Livestream reminder')}><Video size={17} /> Copy livestream reminder</button>
        </div>
        <div className="grid two">
          <Field label="Email subject" value={site.messages.emailSubject} onChange={(v) => updateMessage('emailSubject', v)} />
          <Field label="SMS invite" value={site.messages.smsInvite} onChange={(v) => updateMessage('smsInvite', v)} />
        </div>
        <div className="announcement-grid">
          <AnnouncementEditor title="Private page invite" value={site.messages.invite} onChange={(v) => updateMessage('invite', v)} onCopy={() => copyText(`${site.messages.invite} ${shareUrl}`, 'Invite message')} />
          <AnnouncementEditor title="Memory request" value={site.messages.memoryRequest} onChange={(v) => updateMessage('memoryRequest', v)} onCopy={() => copyText(`${site.messages.memoryRequest} ${shareUrl}`, 'Memory request')} />
          <AnnouncementEditor title="Obituary" value={site.messages.obituary} onChange={(v) => updateMessage('obituary', v)} onCopy={() => copyText(site.messages.obituary, 'Obituary')} />
          <AnnouncementEditor title="Newspaper notice" value={site.messages.newspaperNotice} onChange={(v) => updateMessage('newspaperNotice', v)} onCopy={() => copyText(`${site.messages.newspaperNotice} ${shareUrl}`, 'Newspaper notice')} />
          <AnnouncementEditor title="Social post" value={site.messages.socialPost} onChange={(v) => updateMessage('socialPost', v)} onCopy={() => copyText(`${site.messages.socialPost} ${shareUrl}`, 'Social post')} />
          <AnnouncementEditor title="Thank-you note" value={site.messages.thankYou} onChange={(v) => updateMessage('thankYou', v)} onCopy={() => copyText(site.messages.thankYou, 'Thank-you note')} />
        </div>
        <div className="section-line guest-update-head">
          <h3>Obituary Publishing</h3>
          <button className="secondary" onClick={addObituaryPlacement}><Plus size={16} /> Add placement</button>
        </div>
        <div className="obituary-placement-list">
          {(site.obituaryPlacements || []).map((item, index) => (
            <article className="obituary-placement" key={`${item.outlet}-${index}`}>
              <Field label="Outlet" value={item.outlet} onChange={(v) => updateList('obituaryPlacements', index, { outlet: v })} />
              <Field label="Type" value={item.type} onChange={(v) => updateList('obituaryPlacements', index, { type: v })} />
              <Field label="Deadline" value={item.deadline} onChange={(v) => updateList('obituaryPlacements', index, { deadline: v })} />
              <Field label="Contact" value={item.contact} onChange={(v) => updateList('obituaryPlacements', index, { contact: v })} />
              <Field label="Fee" value={item.cost} onChange={(v) => updateList('obituaryPlacements', index, { cost: v })} />
              <div className="placement-statuses" aria-label={`Publication status for ${item.outlet}`}>
                {['Draft', 'Submitted', 'Approved', 'Published'].map((status) => (
                  <button key={status} className={item.status === status ? 'selected' : ''} aria-pressed={item.status === status} onClick={() => updateObituaryPlacementStatus(index, status)}>{status}</button>
                ))}
                <button onClick={() => removeList('obituaryPlacements', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>
        <div className="section-line guest-update-head">
          <h3>Guest Updates</h3>
          <button className="secondary" onClick={addGuestUpdate}><Plus size={16} /> Add update</button>
        </div>
        <div className="guest-update-list">
          {(site.guestUpdates || []).map((item, index) => (
            <article className="guest-update-edit" key={`${item.title}-${index}`}>
              <Field label="Title" value={item.title} onChange={(v) => updateList('guestUpdates', index, { title: v })} />
              <Field label="Timing" value={item.timing} onChange={(v) => updateList('guestUpdates', index, { timing: v })} />
              <TextArea label="Update for guests" value={item.detail} onChange={(v) => updateList('guestUpdates', index, { detail: v })} />
              <div className="guest-update-actions">
                <button className={item.urgent ? 'urgent-toggle selected' : 'urgent-toggle'} onClick={() => updateList('guestUpdates', index, { urgent: !item.urgent })}>
                  <Shield size={16} /> {item.urgent ? 'Urgent' : 'Normal'}
                </button>
                <button className="secondary" onClick={() => copyText(`${item.urgent ? 'Urgent update: ' : ''}${item.title}\n${item.detail}\n${shareUrl}`, 'Guest update')}><Send size={16} /> Copy update</button>
                <button onClick={() => removeList('guestUpdates', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    );
  }

  if (active === 'desk') {
    const taskCount = site.launchTasks.filter((task) => task.done).length;
    const inPerson = site.rsvp.filter((guest) => guest.attending === 'In person').length;
    const guestNeeds = site.rsvp.filter((guest) => guest.needs || (guest.note && guest.note !== 'No note'));
    const openFollowUps = guestNeeds.filter((guest) => !guest.followUpDone).length;
    const pendingInvites = site.rsvp.filter((guest) => !guest.inviteSent).length;
    const totalPartySize = site.rsvp.reduce((sum, guest) => sum + (Number.parseInt(guest.partySize, 10) || 1), 0);
    const openSupportNeeds = (site.supportNeeds || []).filter((need) => need.status === 'Open').length;
    return (
      <Panel title="Family Desk" intro="A calm command center for the details that happen around the service.">
        <div className="stat-grid">
          <Stat icon={MessageCircle} value={site.memories.length} label="approved memories" />
          <Stat icon={Clock} value={site.pendingMemories.length} label="waiting review" />
          <Stat icon={Shield} value={site.rejectedMemories?.length || 0} label="kept private" />
          <Stat icon={Users} value={totalPartySize} label="expected guests" />
          <Stat icon={Gift} value={openSupportNeeds} label="open support needs" />
        </div>

        <h3>Review Contributions</h3>
        <div className="review-list">
          {site.pendingMemories.length ? site.pendingMemories.map((memory, index) => (
            <article className="review-card" key={`${memory.from}-${index}`}>
              {memory.photo && <img className="review-photo" src={memory.photo} alt="" />}
              <div>
                <strong>{memory.from}</strong>
                {memory.relation && <small>{memory.relation}</small>}
                <p>{memory.text}</p>
                {memory.caption && <small>{memory.caption}</small>}
                {memory.audio && <audio className="memory-audio" src={memory.audio} controls />}
                {memory.audioLabel && <small>{memory.audioLabel}</small>}
                {memory.consent && <em className="review-consent">Guest gave family review permission</em>}
              </div>
              <div className="review-actions">
                <button className="primary small" onClick={() => approveMemory(index)}><Check size={16} /> Approve</button>
                <button className="decline small" onClick={() => rejectMemory(index)}><Shield size={16} /> Keep private</button>
              </div>
            </article>
          )) : <p className="empty-note">All guest contributions have been reviewed.</p>}
        </div>

        <div className="moderation-history">
          <div>
            <Shield size={18} />
            <h3>Kept Private</h3>
          </div>
          {site.rejectedMemories?.length ? (
            site.rejectedMemories.slice(0, 3).map((memory, index) => (
              <article className="private-card" key={`${memory.from}-${index}`}>
                <strong>{memory.from}</strong>
                <p>{memory.text}</p>
                <small>{memory.reviewNote || 'Kept private by family moderator'}</small>
              </article>
            ))
          ) : <p className="empty-note">No guest memories have been kept private.</p>}
        </div>

        <div className="desk-split">
          <section>
            <div className="section-line">
              <h3>Guest List</h3>
              <div className="guest-list-actions">
                <button className="secondary" onClick={() => copyText(pendingInvitePacket(), 'Pending invite packet')}><Send size={16} /> Copy pending invites</button>
                <button className="secondary" onClick={() => downloadCsv('guest-list', site.rsvp)}><Download size={16} /> CSV</button>
              </div>
            </div>
            <div className="guest-needs-summary">
              <UserCheck size={18} />
              <div>
                <strong>{openFollowUps} guest follow-up{openFollowUps === 1 ? '' : 's'} open</strong>
                <p>{inPerson} in-person RSVP{inPerson === 1 ? '' : 's'}, {site.rsvp.filter((guest) => guest.attending === 'Watching online').length} online, {site.rsvp.filter((guest) => guest.attending === 'Unable to attend').length} unable to attend. {pendingInvites} invite{pendingInvites === 1 ? '' : 's'} not marked sent.</p>
              </div>
            </div>
            <div className="guest-import-panel">
              <div>
                <strong>Paste Guest List</strong>
                <p>One guest per line. Names, emails, phone numbers, and groups can come from a spreadsheet, message thread, or notes app.</p>
              </div>
              <textarea
                value={guestImportText}
                onChange={(event) => setGuestImportText(event.target.value)}
                placeholder={'Aunt June, june@example.com, (970) 555-0101, Family\nMarcus Lee\tmarcus@example.com\tCollege friends'}
              />
              <div className="guest-import-actions">
                <button
                  className="primary"
                  onClick={() => {
                    const added = importGuestList(guestImportText);
                    if (added) setGuestImportText('');
                  }}
                  disabled={!guestImportText.trim()}
                >
                  <Upload size={16} /> Import guests
                </button>
                <button className="secondary" onClick={() => setGuestImportText('')} disabled={!guestImportText.trim()}>Clear</button>
              </div>
            </div>
            {site.rsvp.map((guest, index) => (
              <div className={guest.followUpDone ? 'guest-row done' : 'guest-row'} key={`${guest.name}-${index}`}>
                <input value={guest.name} onChange={(e) => updateList('rsvp', index, { name: e.target.value })} />
                <input value={guest.email || ''} onChange={(e) => updateList('rsvp', index, { email: e.target.value })} placeholder="Email" />
                <input value={guest.phone || ''} onChange={(e) => updateList('rsvp', index, { phone: e.target.value })} placeholder="Phone" />
                <input value={guest.group || ''} onChange={(e) => updateList('rsvp', index, { group: e.target.value })} placeholder="Group" />
                <input value={guest.attending} onChange={(e) => updateList('rsvp', index, { attending: e.target.value })} />
                <input value={guest.partySize || '1'} onChange={(e) => updateList('rsvp', index, { partySize: e.target.value })} aria-label="Party size" />
                <input value={guest.needs || ''} onChange={(e) => updateList('rsvp', index, { needs: e.target.value })} placeholder="Needs or follow-up" />
                <input value={guest.note || ''} onChange={(e) => updateList('rsvp', index, { note: e.target.value })} placeholder="Guest note" />
                <button className="copy-invite" onClick={() => copyText(guestInviteText(guest), `${guest.name || 'Guest'} invite`)}><Mail size={16} /> Copy</button>
                <button className={guest.inviteSent ? 'invite-toggle sent' : 'invite-toggle'} onClick={() => toggleGuestInvite(index)}>{guest.inviteSent ? <Check size={16} /> : <Send size={16} />} {guest.inviteSent ? 'Invited' : 'Invite'}</button>
                <button className="follow-up-toggle" onClick={() => toggleGuestFollowUp(index)}>{guest.followUpDone ? <Check size={16} /> : <UserCheck size={16} />} {guest.followUpDone ? 'Done' : 'Follow up'}</button>
                <button onClick={() => removeList('rsvp', index)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="secondary" onClick={addRsvp}><Plus size={17} /> Add guest</button>
          </section>

          <section>
            <div className="section-line">
              <h3>Launch Tasks</h3>
              <span>{taskCount} of {site.launchTasks.length}</span>
            </div>
            <div className="task-list">
              {site.launchTasks.map((task, index) => (
                <button className={task.done ? 'task done' : 'task'} key={task.label} onClick={() => toggleTask(index)}>
                  <span>{task.done ? <Check size={16} /> : index + 1}</span>
                  {task.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="section-line">
          <h3>Support Options</h3>
          <button className="secondary" onClick={addSupportGift}><Plus size={16} /> Add support</button>
        </div>
        <div className="support-editor">
          {site.supportGifts.map((gift, index) => (
            <article className="support-edit" key={`${gift.name}-${index}`}>
              <Field label="Name" value={gift.name} onChange={(v) => updateList('supportGifts', index, { name: v })} />
              <Field label="Type" value={gift.type} onChange={(v) => updateList('supportGifts', index, { type: v })} />
              <Field label="Progress or note" value={gift.amount} onChange={(v) => updateList('supportGifts', index, { amount: v })} />
              <Field label="Status" value={gift.status} onChange={(v) => updateList('supportGifts', index, { status: v })} />
              <Field label="Link" value={gift.url || ''} onChange={(v) => updateList('supportGifts', index, { url: v })} />
              <button onClick={() => removeList('supportGifts', index)}><Trash2 size={16} /> Remove</button>
            </article>
          ))}
        </div>

        <div className="section-line">
          <h3>Support Needs</h3>
          <button className="secondary" onClick={addSupportNeed}><Plus size={16} /> Add need</button>
        </div>
        <div className="support-need-list">
          {(site.supportNeeds || []).map((need, index) => (
            <article className="support-need-edit" key={`${need.title}-${index}`}>
              <Field label="Need" value={need.title} onChange={(v) => updateList('supportNeeds', index, { title: v })} />
              <Field label="Category" value={need.category} onChange={(v) => updateList('supportNeeds', index, { category: v })} />
              <Field label="When" value={need.date} onChange={(v) => updateList('supportNeeds', index, { date: v })} />
              <Field label="Claimed by" value={need.claimedBy || ''} onChange={(v) => updateList('supportNeeds', index, { claimedBy: v, status: v ? 'Claimed' : 'Open' })} />
              <TextArea label="Details" value={need.detail} onChange={(v) => updateList('supportNeeds', index, { detail: v })} />
              <div className="support-need-actions">
                <button className={need.status === 'Open' ? 'selected' : ''} onClick={() => updateList('supportNeeds', index, { status: 'Open', claimedBy: '' })}>Open</button>
                <button className={need.status === 'Claimed' ? 'selected' : ''} onClick={() => updateList('supportNeeds', index, { status: 'Claimed' })}>Claimed</button>
                <button className={need.status === 'Complete' ? 'selected' : ''} onClick={() => updateList('supportNeeds', index, { status: 'Complete' })}>Complete</button>
                <button onClick={() => removeList('supportNeeds', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>

        <div className="section-line">
          <h3>Family Helpers</h3>
          <button className="secondary" onClick={addCoadmin}><Plus size={16} /> Add helper</button>
        </div>
        <div className="helper-grid">
          {site.coadmins.map((admin, index) => (
            <article className="helper-card" key={`${admin.email}-${index}`}>
              <div className="helper-card-head">
                <Mail size={18} />
                <em>{admin.status || 'Active'}</em>
              </div>
              <Field label="Name" value={admin.name} onChange={(v) => updateList('coadmins', index, { name: v })} />
              <Field label="Role" value={admin.role} onChange={(v) => updateList('coadmins', index, { role: v })} />
              <Field label="Email" value={admin.email} onChange={(v) => updateList('coadmins', index, { email: v })} />
              <Field label="Status" value={admin.status || 'Active'} onChange={(v) => updateList('coadmins', index, { status: v })} />
              <div className="helper-actions">
                <button className="secondary" onClick={() => copyCoadminInvite(admin, index)}><Send size={16} /> Copy invite</button>
                <button onClick={() => removeList('coadmins', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>

        <h3>Family Messages</h3>
        <div className="message-grid">
          <MessageTemplate title="Private page invite" text={`${site.messages.invite} ${shareUrl}`} onCopy={() => copyText(`${site.messages.invite} ${shareUrl}`, 'Invite message')} />
          <MessageTemplate title="Memory request" text={`${site.messages.memoryRequest} ${shareUrl}`} onCopy={() => copyText(`${site.messages.memoryRequest} ${shareUrl}`, 'Memory request')} />
          <MessageTemplate title="Thank-you note" text={site.messages.thankYou} onCopy={() => copyText(site.messages.thankYou, 'Thank-you note')} />
        </div>

        <div className="section-line">
          <h3>Activity</h3>
          <span>{site.activityLog?.length || 0} recent actions</span>
        </div>
        <div className="activity-list">
          {(site.activityLog || []).map((entry, index) => (
            <article className="activity-card" key={`${entry.action}-${entry.when}-${index}`}>
              <Clock size={17} />
              <div>
                <strong>{entry.action}</strong>
                <p>{entry.detail}</p>
              </div>
              <em>{entry.when}</em>
            </article>
          ))}
        </div>
      </Panel>
    );
  }

  if (active === 'partner') {
    const readyDrafts = site.partnerDrafts.filter((draft) => draft.stage === 'Ready to publish').length;
    return (
      <Panel title="Partner Desk" intro="A co-branded workflow for funeral homes, celebrants, and care teams managing family pages.">
        <div className="partner-hero">
          <div className="partner-mark">{site.partner.logoInitials}</div>
          <div>
            <strong>{site.partner.organization}</strong>
            <p>{site.partner.brandLine}</p>
            <span>{site.partner.coordinator} · {site.partner.phone}</span>
          </div>
          <em>{site.partner.handoffStatus}</em>
        </div>

        <div className="partner-stats">
          <Stat icon={FileHeart} value={site.partnerDrafts.length} label="family drafts" />
          <Stat icon={Rocket} value={readyDrafts} label="ready to publish" />
          <Stat icon={CreditCard} value={site.partner.billingMode.includes('monthly') ? 'Monthly' : 'Family'} label="billing mode" />
          <Stat icon={Shield} value="Scoped" label="co-admin access" />
        </div>

        <div className="grid two">
          <Field label="Organization" value={site.partner.organization} onChange={(v) => updatePartner('organization', v)} />
          <Field label="Coordinator" value={site.partner.coordinator} onChange={(v) => updatePartner('coordinator', v)} />
          <Field label="Phone" value={site.partner.phone} onChange={(v) => updatePartner('phone', v)} />
          <Field label="Email" value={site.partner.email} onChange={(v) => updatePartner('email', v)} />
          <Field label="Logo initials" value={site.partner.logoInitials} onChange={(v) => updatePartner('logoInitials', v.slice(0, 3).toUpperCase())} />
          <Field label="Default package" value={site.partner.defaultPackage} onChange={(v) => updatePartner('defaultPackage', v)} />
          <Field label="Billing mode" value={site.partner.billingMode} onChange={(v) => updatePartner('billingMode', v)} />
          <Field label="Handoff status" value={site.partner.handoffStatus} onChange={(v) => updatePartner('handoffStatus', v)} />
        </div>
        <TextArea label="Partner brand line" value={site.partner.brandLine} onChange={(v) => updatePartner('brandLine', v)} />

        <div className="section-line">
          <h3>Family Drafts</h3>
          <button className="secondary" onClick={addPartnerDraft}><Plus size={16} /> Add draft</button>
        </div>
        <div className="partner-drafts">
          {site.partnerDrafts.map((draft, index) => (
            <article className="draft-card" key={`${draft.family}-${index}`}>
              <div>
                <strong>{draft.memorial}</strong>
                <span>{draft.family}</span>
              </div>
              <input value={draft.stage} onChange={(e) => updateList('partnerDrafts', index, { stage: e.target.value })} />
              <input value={draft.package} onChange={(e) => updateList('partnerDrafts', index, { package: e.target.value })} />
              <input value={draft.owner} onChange={(e) => updateList('partnerDrafts', index, { owner: e.target.value })} />
              <button onClick={() => removeList('partnerDrafts', index)} aria-label="Remove partner draft"><Trash2 size={16} /></button>
            </article>
          ))}
        </div>

        <div className="partner-actions">
          <button className="primary" onClick={markHandoffReady}><Send size={17} /> Mark handoff sent</button>
          <button className="secondary" onClick={() => copyText(`${site.partner.organization}\nCoordinator: ${site.partner.coordinator}\n${shareUrl}`, 'Partner handoff')}><Mail size={17} /> Copy handoff note</button>
          <button className="secondary" onClick={() => downloadCsv('partner-drafts', site.partnerDrafts)}><Download size={17} /> Export drafts</button>
        </div>
      </Panel>
    );
  }

  const metadata = shareMetadata();
  const selectedPlan = getPlanDetails(site.plan);
  const launchSnapshot = getLaunchSnapshot(site);
  const launchIssues = getLaunchIssues(site, progress);

  return (
    <Panel title="Privacy & Launch" intro="The page can be shared gently, privately, or through a funeral-home workflow.">
      <div className="launch-command">
        <div className="launch-hero">
          <div>
            <p className="eyebrow"><Rocket size={16} /> Launch command center</p>
            <h3>{site.launchStatus === 'Published' ? 'This memorial is published.' : 'Finish, pay, publish, and invite guests from one place.'}</h3>
            <p>{site.launchStatus === 'Published' ? `${site.name}'s page is ready at ${shareUrl}.` : 'Kindred keeps the launch steps visible so a family admin or funeral-home coordinator can hand off cleanly.'}</p>
          </div>
          <button className="primary" onClick={publishPage} disabled={progress < 100}>
            <Rocket size={17} /> {site.launchStatus === 'Published' ? 'Republish page' : 'Publish page'}
          </button>
        </div>
        <div className="launch-status-grid">
          <LaunchStatus icon={Check} label="Readiness" value={`${progress}% complete`} tone={progress === 100 ? 'done' : 'active'} />
          <LaunchStatus icon={CreditCard} label="Payment" value={site.checkoutStatus} tone={site.checkoutStatus === 'Paid' ? 'done' : 'active'} />
          <LaunchStatus icon={Globe2} label="Domain" value={site.domainStatus} tone={site.domainStatus.includes('ready') ? 'done' : 'active'} />
          <LaunchStatus icon={Send} label="Invites" value={site.inviteStatus} tone={site.inviteStatus.includes('Queued') ? 'done' : 'active'} />
        </div>
        <div className="launch-actions">
          <button className="secondary" onClick={startCheckout}><CreditCard size={17} /> Start checkout</button>
          <button className="secondary" onClick={connectDomain}><Globe2 size={17} /> Domain setup</button>
          <button className="secondary" onClick={sendInvites}><Send size={17} /> Prepare invites</button>
          <button className="secondary" onClick={() => copyText(JSON.stringify({ shareUrl, productionUrl, site }, null, 2), 'Launch packet')}><Download size={17} /> Copy launch packet</button>
        </div>
      </div>

      <div className="snapshot-panel">
        <div className="section-line">
          <h3>Launch Snapshot</h3>
          <span>{launchSnapshot.filter((item) => item.status === 'Ready').length} of {launchSnapshot.length} ready</span>
        </div>
        <p className="snapshot-intro">Story, Guest Care, Sharing, and Preservation show what is ready at a glance.</p>
        <div className="snapshot-grid">
          {launchSnapshot.map((item) => (
            <article className={item.status === 'Ready' ? 'snapshot-card ready' : 'snapshot-card'} key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.detail}</p>
              <small>{item.done} of {item.total} essentials complete</small>
            </article>
          ))}
        </div>
      </div>

      <div className="readiness-panel">
        <div className="readiness-head">
          <div>
            <strong>{progress}% ready</strong>
            <span>{progress === 100 ? 'Ready to share with confidence.' : 'Finish these before sending the link widely.'}</span>
          </div>
          <div className="meter"><span style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="check-grid">
          {getLaunchChecks(site).map((check) => (
            <div className={check.done ? 'launch-check done' : 'launch-check'} key={check.label}>
              <span>{check.done ? <Check size={15} /> : null}</span>
              {check.label}
            </div>
          ))}
        </div>
      </div>
      <div className="launch-issues-panel">
        <div className="section-line">
          <h3>Launch Issues</h3>
          <span>{launchIssues.length ? `${launchIssues.length} to review` : 'Clear'}</span>
        </div>
        {launchIssues.length ? (
          <div className="launch-issue-list">
            {launchIssues.map((issue) => (
              <article className="launch-issue" key={issue.label}>
                <span>{issue.tone}</span>
                <div>
                  <strong>{issue.label}</strong>
                  <p>{issue.detail}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="launch-clear">
            <Check size={18} />
            <div>
              <strong>No launch issues found</strong>
              <p>Readiness, reviews, guest records, support needs, archive state, and closure requests are clear.</p>
            </div>
          </div>
        )}
      </div>
      <div className="approval-panel">
        <div className="section-line">
          <h3>Family Launch Approval</h3>
          <span>{site.launchApproval.status}</span>
        </div>
        <div className="approval-summary">
          <Shield size={20} />
          <div>
            <strong>{approvalComplete(site) ? 'Approved for launch' : 'Waiting for final family sign-off'}</strong>
            <p>Record the family reviewer before publishing so privacy, service details, memories, and invites are confirmed together.</p>
          </div>
        </div>
        <div className="grid two">
          <Field label="Family reviewer" value={site.launchApproval.reviewer} onChange={(v) => updateLaunchApproval('reviewer', v)} />
          <Field label="Reviewed at" value={site.launchApproval.reviewedAt || 'Not approved yet'} onChange={(v) => updateLaunchApproval('reviewedAt', v)} />
        </div>
        <div className="approval-checks">
          {site.launchApproval.checks.map((check, index) => (
            <button className={check.done ? 'approval-check done' : 'approval-check'} key={check.label} onClick={() => toggleApprovalCheck(index)}>
              <span>{check.done ? <Check size={15} /> : index + 1}</span>
              {check.label}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="primary" onClick={markLaunchApproved}><Check size={17} /> Mark approved</button>
          <button className="secondary" onClick={copyFamilyApprovalPacket}><Download size={17} /> Copy approval packet</button>
        </div>
      </div>
      <div className="integration-panel">
        <div className="section-line">
          <h3>Production Integrations</h3>
          <span>{integrationChecks.filter((check) => check.ready).length} of {integrationChecks.length} connected</span>
        </div>
        <div className="integration-grid">
          {integrationChecks.map((check) => <IntegrationCard key={check.label} {...check} />)}
        </div>
      </div>
      <div className="accessibility-panel">
        <div className="section-line">
          <h3>Accessibility Review</h3>
          <span>{site.accessibilityChecks.filter((check) => check.done).length} of {site.accessibilityChecks.length}</span>
        </div>
        <div className="accessibility-checks">
          {site.accessibilityChecks.map((check, index) => (
            <button className={check.done ? 'accessibility-check done' : 'accessibility-check'} key={check.label} onClick={() => toggleAccessibilityCheck(index)}>
              <span>{check.done ? <Check size={15} /> : index + 1}</span>
              {check.label}
            </button>
          ))}
        </div>
      </div>
      <div className="privacy-grid">
        <Choice icon={Lock} selected={site.privacy === 'invite'} title="Invite-only" text="Only people with the private link can view." onClick={() => update('privacy', 'invite')} />
        <Choice icon={Shield} selected={site.privacy === 'password'} title="Password" text="Guests need a family passcode." onClick={() => update('privacy', 'password')} />
        <Choice icon={Search} selected={site.privacy === 'hidden'} title="Hidden from search" text="Shareable, but not indexed." onClick={() => update('privacy', 'hidden')} />
        <Choice icon={Globe2} selected={site.privacy === 'public'} title="Public" text="Open memorial page for the broader community." onClick={() => update('privacy', 'public')} />
      </div>
      <div className="access-panel">
        <div className="section-line">
          <h3>Access Controls</h3>
          <span>{site.privacy === 'password' ? 'Passcode required' : site.privacy === 'public' ? 'Open page' : 'Private sharing'}</span>
        </div>
        <div className="grid two">
          <Field label="Family passcode" value={site.accessCode} onChange={(v) => update('accessCode', v)} />
          <Field label="Private invite token" value={site.inviteToken} onChange={(v) => update('inviteToken', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
          <Field label="Search visibility" value={site.searchVisibility} onChange={(v) => update('searchVisibility', v)} />
          <Field label="Guest sharing" value={site.allowGuestSharing ? 'Allowed' : 'Family only'} onChange={(v) => update('allowGuestSharing', v.toLowerCase().includes('allow'))} />
        </div>
        <div className="access-link-card">
          <Lock size={18} />
          <div>
            <strong>Private link</strong>
            <span>{shareUrl}?invite={site.inviteToken || 'family'}</span>
          </div>
          <button className="secondary" onClick={() => copyText(`${shareUrl}?invite=${site.inviteToken || 'family'}`, 'Private invite link')}><Mail size={16} /> Copy</button>
        </div>
      </div>
      <div className="privacy-review-panel">
        <div className="section-line">
          <h3>Privacy & Sharing Review</h3>
          <span>{site.privacyReview.status}</span>
        </div>
        <div className="privacy-review-summary">
          <Eye size={20} />
          <div>
            <strong>{privacyReviewComplete(site) ? 'Privacy choices are reviewed' : 'Review what guests and search engines can see'}</strong>
            <p>Confirm the private link, search visibility, guest sharing, public content, and archive choices before publishing.</p>
          </div>
        </div>
        <div className="privacy-review-grid">
          <div><span>Page privacy</span><strong>{site.privacy}</strong></div>
          <div><span>Search</span><strong>{site.searchVisibility}</strong></div>
          <div><span>Guest sharing</span><strong>{site.allowGuestSharing ? 'Allowed' : 'Family only'}</strong></div>
          <div><span>Public photos</span><strong>{publicPhotos(site).length}</strong></div>
          <div><span>Approved memories</span><strong>{site.memories.length}</strong></div>
          <div><span>Public care notes</span><strong>{(site.customCare || []).filter((item) => item.visibility !== 'Family only').length}</strong></div>
        </div>
        <div className="grid two">
          <Field label="Privacy reviewer" value={site.privacyReview.reviewer} onChange={(v) => updatePrivacyReview('reviewer', v)} />
          <Field label="Privacy reviewed at" value={site.privacyReview.reviewedAt || 'Not reviewed yet'} onChange={(v) => updatePrivacyReview('reviewedAt', v)} />
        </div>
        <TextArea label="Review notes" value={site.privacyReview.notes} onChange={(v) => updatePrivacyReview('notes', v)} />
        <div className="privacy-review-checks">
          {site.privacyReview.checks.map((check, index) => (
            <button className={check.done ? 'privacy-review-check done' : 'privacy-review-check'} key={check.label} onClick={() => togglePrivacyReviewCheck(index)}>
              <span>{check.done ? <Check size={15} /> : index + 1}</span>
              {check.label}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="primary" onClick={markPrivacyReviewed}><Shield size={17} /> Mark privacy reviewed</button>
        </div>
      </div>
      <div className="sensitive-review-panel">
        <div className="section-line">
          <h3>Sensitive Details Review</h3>
          <span>{site.sensitiveReview.status}</span>
        </div>
        <div className="sensitive-review-summary">
          <Shield size={20} />
          <div>
            <strong>{sensitiveReviewComplete(site) ? 'Sensitive details are reviewed' : 'Review delicate wording and private family details'}</strong>
            <p>Check cause-of-death wording, protected photos, donation links, ritual notes, and family-only instructions before the page is shared.</p>
          </div>
        </div>
        <div className="sensitive-review-grid">
          <div><span>Public photos</span><strong>{publicPhotos(site).length}</strong></div>
          <div><span>Pending memories</span><strong>{site.pendingMemories.length}</strong></div>
          <div><span>Family-only notes</span><strong>{(site.customCare || []).filter((item) => item.visibility === 'Family only').length}</strong></div>
          <div><span>Support links</span><strong>{(site.supportGifts || []).filter((item) => item.url).length}</strong></div>
          <div><span>Ritual notes</span><strong>{site.ritualNote ? 'Included' : 'Not added'}</strong></div>
          <div><span>Reviewer</span><strong>{site.sensitiveReview.reviewer || 'Not recorded'}</strong></div>
        </div>
        <div className="grid two">
          <Field label="Sensitive details reviewer" value={site.sensitiveReview.reviewer} onChange={(v) => updateSensitiveReview('reviewer', v)} />
          <Field label="Sensitive details reviewed at" value={site.sensitiveReview.reviewedAt || 'Not reviewed yet'} onChange={(v) => updateSensitiveReview('reviewedAt', v)} />
        </div>
        <TextArea label="Sensitive details notes" value={site.sensitiveReview.notes} onChange={(v) => updateSensitiveReview('notes', v)} />
        <div className="sensitive-review-checks">
          {site.sensitiveReview.checks.map((check, index) => (
            <button className={check.done ? 'sensitive-review-check done' : 'sensitive-review-check'} key={check.label} onClick={() => toggleSensitiveReviewCheck(index)}>
              <span>{check.done ? <Check size={15} /> : index + 1}</span>
              {check.label}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="primary" onClick={markSensitiveReviewed}><Shield size={17} /> Mark sensitive details reviewed</button>
        </div>
      </div>
      <div className="grid two">
        <Field label="Family contact" value={site.contact} onChange={(v) => update('contact', v)} />
        <Field label="Custom domain" value={site.customDomain} onChange={(v) => update('customDomain', v)} />
        <Field label="Search title" value={site.searchTitle} onChange={(v) => update('searchTitle', v)} />
        <Field label="Publish target" value={site.publishTarget} onChange={(v) => update('publishTarget', v)} />
      </div>
      <PlanPicker selected={site.plan} onSelect={(plan) => update('plan', plan)} />
      <div className="checkout-summary">
        <div>
          <span>Selected package</span>
          <strong>{selectedPlan.name} · {selectedPlan.price}</strong>
          <p>{selectedPlan.billing}. {selectedPlan.bestFor}.</p>
        </div>
        <ul>
          {selectedPlan.includes.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <button className="secondary" onClick={copyCheckoutPacket}><CreditCard size={16} /> Copy checkout packet</button>
      </div>
      <TextArea label="Search description" value={site.searchDescription} onChange={(v) => update('searchDescription', v)} />
      <div className="share-preview-panel">
        <div className="section-line">
          <h3>Share Preview</h3>
          <button className="secondary" onClick={copyShareMetadata}><Download size={16} /> Copy metadata</button>
        </div>
        <div className="share-preview-card">
          <div className="share-preview-media">
            {coverPhoto(site) ? <img src={photoSrc(coverPhoto(site))} alt={photoCaption(coverPhoto(site))} /> : <FileHeart size={32} />}
          </div>
          <div>
            <strong>{metadata.title}</strong>
            <p>{metadata.description}</p>
            <span>{metadata.url}</span>
          </div>
        </div>
        <div className="meta-grid">
          <div><span>Robots</span><strong>{metadata.robots}</strong></div>
          <div><span>Canonical</span><strong>{metadata.canonicalUrl}</strong></div>
          <div><span>Image</span><strong>{coverPhoto(site) ? 'Family cover photo' : 'Kindred hero'}</strong></div>
          <div><span>Type</span><strong>{metadata.openGraphType}</strong></div>
        </div>
      </div>
      <div className="trust-panel">
        <Shield size={21} />
        <div>
          <strong>Family trust settings</strong>
          <p>Pages stay private until shared, contributions wait for approval, and archives can be downloaded before any page is closed.</p>
        </div>
      </div>
      <div className="archive-panel">
        <div className="section-line">
          <h3>Archive & Closure</h3>
          <span>{site.archiveStatus}</span>
        </div>
        <div className="grid two">
          <Field label="Retention plan" value={site.retentionPlan} onChange={(v) => update('retentionPlan', v)} />
          <Field label="Closure status" value={site.closureStatus} onChange={(v) => update('closureStatus', v)} />
        </div>
        <div className="section-line">
          <h3>Closure Requests</h3>
          <button className="secondary" onClick={addClosureRequest}><Plus size={16} /> Add request</button>
        </div>
        <div className="closure-request-list">
          {(site.closureRequests || []).map((item, index) => (
            <article className="closure-request" key={`${item.requester}-${index}`}>
              <Field label="Requester" value={item.requester} onChange={(v) => updateList('closureRequests', index, { requester: v })} />
              <Field label="When" value={item.requestedAt} onChange={(v) => updateList('closureRequests', index, { requestedAt: v })} />
              <TextArea label="Request" value={item.request} onChange={(v) => updateList('closureRequests', index, { request: v })} />
              <TextArea label="Action" value={item.action} onChange={(v) => updateList('closureRequests', index, { action: v })} />
              <div className="closure-actions">
                {['Needs check', 'Family reviewed', 'Completed'].map((status) => (
                  <button className={item.status === status ? 'selected' : ''} key={status} onClick={() => updateClosureRequestStatus(index, status)}>{status}</button>
                ))}
                <button onClick={() => removeList('closureRequests', index)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>
        <div className="archive-manifest">
          <Archive size={20} />
          <div>
            <strong>Family archive manifest</strong>
            <p>{site.memories.length} approved memories, {site.pendingMemories.length} pending memories, {site.rsvp.length} guests, {site.photos.length} family photos, and {site.supportGifts.length} support records.</p>
          </div>
          <button className="primary" onClick={downloadJson}><Download size={17} /> Download archive</button>
        </div>
        <div className="action-row">
          <button className="secondary" onClick={copyClosurePacket}><Shield size={17} /> Copy closure packet</button>
        </div>
      </div>
      <div className="handoff-panel">
        <div className="section-line">
          <h3>Family Ownership Handoff</h3>
          <span>{site.partner?.handoffStatus || 'Needs review'}</span>
        </div>
        <div className="handoff-summary">
          <HeartHandshake size={20} />
          <div>
            <strong>Give the family one clear ownership note</strong>
            <p>Copy a handoff packet with the owner, helpers, partner access, archive status, privacy review, sensitive details review, family approval, and remaining next actions.</p>
          </div>
        </div>
        <div className="handoff-grid">
          <div><span>Family helpers</span><strong>{site.coadmins.length}</strong></div>
          <div><span>Archive</span><strong>{site.archiveStatus}</strong></div>
          <div><span>Approval</span><strong>{approvalComplete(site) ? 'Complete' : 'Needs review'}</strong></div>
          <div><span>Privacy</span><strong>{privacyReviewComplete(site) ? 'Complete' : 'Needs review'}</strong></div>
          <div><span>Sensitive details</span><strong>{sensitiveReviewComplete(site) ? 'Complete' : 'Needs review'}</strong></div>
        </div>
        <div className="action-row">
          <button className="primary" onClick={copyFamilyHandoffPacket}><Download size={17} /> Copy handoff packet</button>
        </div>
      </div>
      <div className="data-safety">
        <div>
          <strong>Data safety</strong>
          <p>Restore a downloaded archive or reload the polished sample. Imports stay on this device until a production backend is connected.</p>
        </div>
        <div className="action-row">
          <label className="secondary import-button">
            <Upload size={17} /> Import archive
            <input type="file" accept="application/json,.json" onChange={(event) => importArchive(event.target.files?.[0])} />
          </label>
          <button className="primary" onClick={resetSample}><Sparkles size={17} /> Load polished sample</button>
        </div>
      </div>
    </Panel>
  );
}

function Panel({ title, intro, children }) {
  return (
    <div className="panel">
      <div className="panel-head"><h2>{title}</h2><p>{intro}</p></div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, prefix }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className={prefix ? 'prefix-input' : ''}>{prefix && <small>{prefix}</small>}<input value={value} onChange={(e) => onChange(e.target.value)} /></div>
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function PhotoUploader({ photos, onFiles, onRemove, onUpdate, onCover }) {
  return (
    <div className="photos">
      <label className="upload">
        <Upload size={22} />
        <span>Add family photos</span>
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
      </label>
      {photos.map((photo, index) => (
        <article className={photo.isCover ? 'photo-thumb cover' : 'photo-thumb'} key={`${photoSrc(photo)?.slice(0, 24)}-${index}`}>
          <img src={photoSrc(photo)} alt={photoCaption(photo)} />
          <div className="photo-tools">
            <button className={photo.isCover ? 'selected' : ''} onClick={() => onCover(index)}><Image size={15} /> Cover</button>
            <button className={photo.isPublic === false ? '' : 'selected'} onClick={() => onUpdate(index, { isPublic: photo.isPublic === false })}>{photo.isPublic === false ? <Eye size={15} /> : <Check size={15} />} {photo.isPublic === false ? 'Show' : 'Public'}</button>
            <button onClick={() => onRemove(index)}><Trash2 size={15} /></button>
          </div>
          <input value={photoCaption(photo)} onChange={(event) => onUpdate(index, { caption: event.target.value })} placeholder="Caption or names" />
        </article>
      ))}
    </div>
  );
}

function Prompt({ icon: Icon, text }) {
  return <div className="prompt"><Icon size={18} /> {text}</div>;
}

function Keepsake({ icon: Icon, title, text }) {
  return <article className="keepsake"><Icon size={21} /><strong>{title}</strong><p>{text}</p></article>;
}

function CareNote({ icon: Icon, title, text }) {
  return (
    <article className="care-note">
      <Icon size={20} />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function Stat({ icon: Icon, value, label }) {
  return <article className="stat"><Icon size={20} /><strong>{value}</strong><span>{label}</span></article>;
}

function OpsCard({ icon: Icon, title, meta, text, status }) {
  return (
    <article className="ops-card">
      <Icon size={20} />
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
        <p>{text}</p>
      </div>
      <em>{status}</em>
    </article>
  );
}

function MessageTemplate({ title, text, onCopy }) {
  return (
    <article className="message-card">
      <strong>{title}</strong>
      <p>{text}</p>
      <button className="secondary" onClick={onCopy}><Mail size={16} /> Copy</button>
    </article>
  );
}

function AnnouncementEditor({ title, value, onChange, onCopy }) {
  return (
    <article className="announcement-card">
      <div className="section-line">
        <h3>{title}</h3>
        <button className="secondary" onClick={onCopy}><Mail size={16} /> Copy</button>
      </div>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </article>
  );
}

function LaunchStatus({ icon: Icon, label, value, tone }) {
  return (
    <article className={tone === 'done' ? 'launch-status done' : 'launch-status'}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function IntegrationCard({ icon: Icon, label, detail, ready }) {
  return (
    <article className={ready ? 'integration-card ready' : 'integration-card'}>
      <Icon size={19} />
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <em>{ready ? 'Connected' : 'Needs setup'}</em>
    </article>
  );
}

function PlanPicker({ selected, onSelect }) {
  return (
    <div className="plan-picker" aria-label="Plan selection">
      {planCatalog.map((plan) => (
        <button key={plan.name} className={selected === plan.name ? 'plan-option selected' : 'plan-option'} onClick={() => onSelect(plan.name)}>
          <span>{plan.name}</span>
          <strong>{plan.price}</strong>
          <small>{plan.bestFor}</small>
        </button>
      ))}
    </div>
  );
}

function Choice({ icon: Icon, selected, title, text, onClick }) {
  return (
    <button className={selected ? 'choice selected' : 'choice'} onClick={onClick}>
      <Icon size={21} /><strong>{title}</strong><span>{text}</span>
    </button>
  );
}

function QrImage({ src, label, small = false }) {
  return src ? <img className={small ? 'real-qr small-qr' : 'real-qr'} src={src} alt={label} /> : <div className={small ? 'fake-qr small-qr' : 'fake-qr'} aria-label={label}>QR</div>;
}

function GuestAccessGate({ site, privacyLabel, onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const expected = site.privacy === 'password' ? site.accessCode : site.inviteToken;
  const codeLabel = site.privacy === 'password' ? 'Family passcode' : 'Invitation code';
  const cover = coverPhoto(site);

  const submit = () => {
    const entered = code.trim();
    const normalizedEntered = site.privacy === 'password' ? entered : entered.toLowerCase();
    const normalizedExpected = site.privacy === 'password' ? expected : expected?.toLowerCase();
    if (normalizedEntered && normalizedEntered === normalizedExpected) {
      setError('');
      onUnlock();
      return;
    }
    setError('That code does not match this family page.');
  };

  return (
    <article className="memorial access-gated" style={{ '--accent': templates[site.template].accent }}>
      <header>
        <div className="privacy-note"><Lock size={13} /> {privacyLabel}</div>
        <div className="portrait">
          {cover ? <img src={photoSrc(cover)} alt={photoCaption(cover)} /> : <Flower2 size={44} />}
        </div>
        <h1>{site.name}</h1>
        <p className="life">{site.lifespan}</p>
        <p>{site.relationship}</p>
      </header>
      <section className="access-gate">
        <Lock size={24} />
        <h2>Private memorial</h2>
        <p>This page is shared by the family. Enter the code from the invitation to view service details, RSVP, and leave a memory.</p>
        <label>
          <span>{codeLabel}</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} />
        </label>
        {error && <em>{error}</em>}
        <button className="primary" onClick={submit}><Shield size={16} /> View page</button>
      </section>
    </article>
  );
}

function MemorialPage({ site, shareUrl, qrDataUrl, onGuestMemory, onGuestRsvp, onSupportClaim, onCalendar }) {
  const [guestName, setGuestName] = useState('');
  const [guestRelation, setGuestRelation] = useState('');
  const [guestMemory, setGuestMemory] = useState('');
  const [guestPhoto, setGuestPhoto] = useState('');
  const [guestPhotoCaption, setGuestPhotoCaption] = useState('');
  const [guestAudio, setGuestAudio] = useState('');
  const [guestAudioLabel, setGuestAudioLabel] = useState('');
  const [guestConsent, setGuestConsent] = useState(true);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAttendance, setRsvpAttendance] = useState('In person');
  const [rsvpPartySize, setRsvpPartySize] = useState('1');
  const [rsvpNeeds, setRsvpNeeds] = useState('');
  const [rsvpNote, setRsvpNote] = useState('');
  const [supportClaimNames, setSupportClaimNames] = useState({});
  const [guestNotice, setGuestNotice] = useState('');
  const [rsvpNotice, setRsvpNotice] = useState('');
  const [supportNotice, setSupportNotice] = useState('');
  const [accessUnlocked, setAccessUnlocked] = useState(false);

  const sendMemory = () => {
    if (!guestMemory.trim() || !guestConsent) return;
    const submitter = guestName.trim() || 'Guest';
    onGuestMemory({ from: submitter, relation: guestRelation.trim(), text: guestMemory.trim(), photo: guestPhoto, caption: guestPhotoCaption.trim(), audio: guestAudio, audioLabel: guestAudioLabel.trim(), consent: guestConsent });
    setGuestName('');
    setGuestRelation('');
    setGuestMemory('');
    setGuestPhoto('');
    setGuestPhotoCaption('');
    setGuestAudio('');
    setGuestAudioLabel('');
    setGuestConsent(true);
    setGuestNotice(`Thank you, ${submitter}. Your memory was sent privately to the family for review.`);
  };

  const handleGuestPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setGuestPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGuestAudio = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setGuestAudio(reader.result);
    reader.readAsDataURL(file);
  };

  const sendRsvp = () => {
    if (!rsvpName.trim()) return;
    const submitter = rsvpName.trim();
    onGuestRsvp({ name: submitter, email: rsvpEmail.trim(), phone: rsvpPhone.trim(), group: 'Public RSVP', attending: rsvpAttendance, partySize: rsvpPartySize || '1', needs: rsvpNeeds.trim(), note: rsvpNote.trim() || 'No note' });
    setRsvpName('');
    setRsvpEmail('');
    setRsvpPhone('');
    setRsvpAttendance('In person');
    setRsvpPartySize('1');
    setRsvpNeeds('');
    setRsvpNote('');
    setRsvpNotice(`Thank you, ${submitter}. Your RSVP was sent to the family.`);
  };

  const claimNeed = (index) => {
    const name = supportClaimNames[index] || '';
    if (!name.trim()) return;
    const need = site.supportNeeds?.[index];
    const submitter = name.trim();
    onSupportClaim(index, submitter);
    setSupportClaimNames((current) => ({ ...current, [index]: '' }));
    setSupportNotice(`Thank you, ${submitter}. The family will see that you claimed ${need?.title || 'this support need'}.`);
  };

  const privacyLabel = {
    public: 'Public memorial',
    hidden: 'Hidden from search',
    password: 'Passcode protected',
    invite: 'Private invite page'
  }[site.privacy] || 'Private family page';
  const requiresAccess = site.privacy === 'password' || site.privacy === 'invite';
  const cover = coverPhoto(site);
  const galleryPhotos = publicPhotos(site);
  const urgentUpdates = (site.guestUpdates || []).filter((item) => item.urgent);
  const moveGuestTo = (selector, focusSelector = selector) => {
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const focusTarget = document.querySelector(focusSelector);
      focusTarget?.focus?.();
    }, 120);
  };

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get('invite');
    setAccessUnlocked(Boolean(site.privacy === 'invite' && invite && invite === site.inviteToken));
  }, [site.privacy, site.inviteToken, site.accessCode]);

  if (requiresAccess && !accessUnlocked) {
    return <GuestAccessGate site={site} privacyLabel={privacyLabel} onUnlock={() => setAccessUnlocked(true)} />;
  }

  return (
    <article className="memorial" style={{ '--accent': templates[site.template].accent }}>
      <header>
        <div className="privacy-note"><Lock size={13} /> {privacyLabel}</div>
        <div className="portrait">
          {cover ? <img src={photoSrc(cover)} alt={photoCaption(cover)} /> : <Flower2 size={44} />}
        </div>
        <h1>{site.name}</h1>
        <p className="life">{site.lifespan}</p>
        <p>{site.relationship}</p>
      </header>
      {Boolean(urgentUpdates.length) && (
        <section className="urgent-update-banner" aria-live="polite">
          <Shield size={18} />
          <div>
            <strong>{urgentUpdates[0].title}</strong>
            <p>{urgentUpdates[0].detail}</p>
            <span>{urgentUpdates[0].timing}</span>
          </div>
        </section>
      )}
      <nav className="public-action-bar" aria-label="Guest actions">
        <button onClick={() => moveGuestTo('.rsvp-box', '.rsvp-box input')}><Users size={15} /> RSVP</button>
        {(site.livestream || site.livestreamPlan?.replayUrl) && <button onClick={() => moveGuestTo('.public-stream-card', '.public-stream-card button')}><Video size={15} /> Watch</button>}
        <button onClick={() => moveGuestTo('.contribution-box', '.contribution-box textarea')}><MessageCircle size={15} /> Memory</button>
        {Boolean(site.supportGifts?.length || site.supportNeeds?.length) && <button onClick={() => moveGuestTo('.support-section', '.support-section button')}><HeartHandshake size={15} /> Support</button>}
      </nav>
      <section>
        <h2>Life Story</h2>
        <p>{site.story}</p>
        <div className="access-summary">
          <Shield size={16} />
          <span>{site.searchVisibility}. Guest sharing is {site.allowGuestSharing ? 'allowed with the family link' : 'limited to family admins'}.</span>
        </div>
      </section>
      <section className="service-card">
        <h2>{site.serviceTitle}</h2>
        <div><CalendarDays size={16} /> {site.serviceDate} at {site.serviceTime}</div>
        <div><MapPin size={16} /> {site.servicePlace}, {site.serviceAddress}</div>
        <div><Video size={16} /> {site.livestreamPlan?.recordingStatus || 'Livestream available'}</div>
        <p>{site.dressNote}</p>
        <div className="guest-actions">
          <button onClick={() => document.querySelector('.rsvp-box input')?.focus()}><Users size={15} /> RSVP</button>
          <button onClick={onCalendar}><CalendarDays size={15} /> Save</button>
          <button onClick={() => site.donation && window.open(site.donation, '_blank', 'noopener,noreferrer')}><Gift size={15} /> Support</button>
        </div>
      </section>
      {(site.livestream || site.livestreamPlan?.replayUrl) && (
        <section className="public-stream-card">
          <h2>Watch Online</h2>
          <div className="stream-meta">
            <span>{site.livestreamPlan?.platform || 'Livestream'}</span>
            <span>{site.livestreamPlan?.recordingStatus || 'Recording status not added'}</span>
          </div>
          {site.livestream && <button className="primary" onClick={() => window.open(site.livestream, '_blank', 'noopener,noreferrer')}><Video size={16} /> Open livestream</button>}
          {site.livestreamPlan?.replayUrl && <button onClick={() => window.open(site.livestreamPlan.replayUrl, '_blank', 'noopener,noreferrer')}><Download size={16} /> Open replay</button>}
          <p>{site.livestreamPlan?.backup}</p>
          <small>{[site.livestreamPlan?.techContact, site.livestreamPlan?.contactDetail].filter(Boolean).join(' ')}</small>
        </section>
      )}
      {Boolean(site.guestUpdates?.length) && (
        <section className="public-updates">
          <h2>Guest Updates</h2>
          <div className="public-update-list">
            {site.guestUpdates.map((item, index) => (
              <article className={item.urgent ? 'public-update urgent' : 'public-update'} key={`${item.title}-${index}`}>
                <span>{item.timing}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="rsvp-box">
        <h2>RSVP</h2>
        <p>Let the family know how you plan to attend and whether you need anything arranged.</p>
        {rsvpNotice && (
          <div className="guest-confirmation" role="status" aria-live="polite">
            <Check size={16} />
            <span>{rsvpNotice}</span>
          </div>
        )}
        <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Your name" />
        <input value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} placeholder="Email for family updates" />
        <input value={rsvpPhone} onChange={(e) => setRsvpPhone(e.target.value)} placeholder="Phone, optional" />
        <div className="attendance-options" aria-label="Attendance options">
          {['In person', 'Watching online', 'Unable to attend'].map((option) => (
            <button key={option} className={rsvpAttendance === option ? 'selected' : ''} onClick={() => setRsvpAttendance(option)}>
              {option}
            </button>
          ))}
        </div>
        <input value={rsvpPartySize} onChange={(e) => setRsvpPartySize(e.target.value)} placeholder="Number attending" />
        <input value={rsvpNeeds} onChange={(e) => setRsvpNeeds(e.target.value)} placeholder="Accessibility, rides, livestream, meal, or seating needs" />
        <textarea value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)} placeholder="Family note or anything else you would like them to know" />
        <button className="primary" onClick={sendRsvp} disabled={!rsvpName.trim()}><Send size={16} /> Send RSVP</button>
      </section>
      <section className="support-section">
        <h2>Support the Family</h2>
        {supportNotice && (
          <div className="guest-confirmation" role="status" aria-live="polite">
            <Check size={16} />
            <span>{supportNotice}</span>
          </div>
        )}
        <div className="public-support-grid">
          {site.supportGifts.map((gift, index) => (
            <article className="support-card" key={`${gift.name}-${index}`}>
              <Gift size={19} />
              <strong>{gift.name}</strong>
              <span>{gift.type}</span>
              <p>{gift.amount}</p>
              <em>{gift.status}</em>
              {gift.url && <small className="external-note">Opens outside Kindred Pages</small>}
              {gift.url && <button onClick={() => window.open(gift.url, '_blank', 'noopener,noreferrer')}>Open third-party link <ExternalLink size={14} /></button>}
            </article>
          ))}
        </div>
        {Boolean(site.supportNeeds?.length) && (
          <div className="public-need-list">
            {site.supportNeeds.map((need, index) => (
              <article className={need.status === 'Open' ? 'public-need open' : 'public-need'} key={`${need.title}-${index}`}>
                <div>
                  <span>{need.category}</span>
                  <strong>{need.title}</strong>
                  <p>{need.detail}</p>
                  <small>{need.date}</small>
                </div>
                {need.status === 'Open' ? (
                  <div className="claim-box">
                    <input value={supportClaimNames[index] || ''} onChange={(e) => setSupportClaimNames((current) => ({ ...current, [index]: e.target.value }))} placeholder="Your name" />
                    <button onClick={() => claimNeed(index)} disabled={!supportClaimNames[index]?.trim()}><HeartHandshake size={15} /> Claim</button>
                  </div>
                ) : (
                  <em>{need.status}{need.claimedBy ? ` by ${need.claimedBy}` : ''}</em>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2>Guest Care</h2>
        <div className="public-care-grid">
          <CareNote icon={UserCheck} title="Access" text={site.accessibility} />
          <CareNote icon={MapPin} title="Arrival" text={site.parking} />
          <CareNote icon={HeartHandshake} title="Reception" text={site.reception} />
        </div>
        <div className="public-schedule">
          {site.eventSchedule.map((item, i) => (
            <div key={`${item.time}-${i}`}>
              <strong>{item.time}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <p>{site.ritualNote} {site.honorsNote}</p>
      </section>
      {Boolean(site.guestFaq?.length) && (
        <section className="public-faq">
          <h2>Guest FAQ</h2>
          <div className="public-faq-list">
            {site.guestFaq.map((item, index) => (
              <article className="public-faq-item" key={`${item.question}-${index}`}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {Boolean(site.customCare?.filter((item) => item.visibility !== 'Family only').length) && (
        <section className="public-custom-care">
          <h2>Custom & Ritual Care</h2>
          <div className="public-custom-care-list">
            {site.customCare.filter((item) => item.visibility !== 'Family only').map((item, index) => (
              <article className="public-custom-care-item" key={`${item.title}-${index}`}>
                <span>{item.audience}</span>
                <strong>{item.title}</strong>
                <p>{item.guidance}</p>
                {item.contact && <small>{item.contact}</small>}
              </article>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2>Chapters</h2>
        <div className="timeline">
          {site.milestones.map((m, i) => <div key={`${m.year}-${i}`}><strong>{m.year}</strong><span>{m.label}</span></div>)}
        </div>
      </section>
      <section>
        <h2>Memories</h2>
        <div className="memories">
          {site.memories.map((memory, i) => (
            <blockquote key={`${memory.from}-${i}`}>
              {memory.photo && <img className="memory-photo" src={memory.photo} alt="" />}
              {memory.text}
              {memory.caption && <small>{memory.caption}</small>}
              {memory.audio && <audio className="memory-audio" src={memory.audio} controls />}
              {memory.audioLabel && <small>{memory.audioLabel}</small>}
              <cite>{memory.from}{memory.relation ? ` · ${memory.relation}` : ''}</cite>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="contribution-box">
        <h2>Share a Memory</h2>
        <p>Notes are sent privately to the family for review before anything appears here.</p>
        {guestNotice && (
          <div className="guest-confirmation" role="status" aria-live="polite">
            <Check size={16} />
            <span>{guestNotice}</span>
          </div>
        )}
        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" />
        <input value={guestRelation} onChange={(e) => setGuestRelation(e.target.value)} placeholder="How you knew them, if you would like" />
        <textarea value={guestMemory} onChange={(e) => setGuestMemory(e.target.value)} placeholder="A story, phrase, photo caption, or small moment" />
        <label className="memory-photo-upload">
          <Image size={17} />
          <span>{guestPhoto ? 'Photo attached' : 'Attach a photo'}</span>
          <input type="file" accept="image/*" onChange={(event) => handleGuestPhoto(event.target.files?.[0])} />
        </label>
        {guestPhoto && (
          <div className="memory-attachment">
            <img src={guestPhoto} alt="" />
            <input value={guestPhotoCaption} onChange={(e) => setGuestPhotoCaption(e.target.value)} placeholder="Photo caption or names" />
            <button onClick={() => { setGuestPhoto(''); setGuestPhotoCaption(''); }}><Trash2 size={15} /> Remove</button>
          </div>
        )}
        <label className="memory-audio-upload">
          <Mic size={17} />
          <span>{guestAudio ? 'Voice note attached' : 'Attach a voice note'}</span>
          <input type="file" accept="audio/*" onChange={(event) => handleGuestAudio(event.target.files?.[0])} />
        </label>
        {guestAudio && (
          <div className="audio-attachment">
            <audio src={guestAudio} controls />
            <input value={guestAudioLabel} onChange={(e) => setGuestAudioLabel(e.target.value)} placeholder="Voice note label" />
            <button onClick={() => { setGuestAudio(''); setGuestAudioLabel(''); }}><Trash2 size={15} /> Remove</button>
          </div>
        )}
        <label className="consent-check">
          <input type="checkbox" checked={guestConsent} onChange={(event) => setGuestConsent(event.target.checked)} />
          <span>I understand this is sent to the family for review, and they may choose whether to include it on the memorial page.</span>
        </label>
        <button className="primary" onClick={sendMemory} disabled={!guestMemory.trim() || !guestConsent}><MessageCircle size={16} /> Send memory</button>
      </section>
      <section className="preview-gallery">
        {(galleryPhotos.length ? galleryPhotos : [{ src: heroImage, caption: 'Memorial table' }]).slice(0, 5).map((photo, i) => (
          <figure key={`${photoSrc(photo)}-${i}`}>
            <img src={photoSrc(photo)} alt={photoCaption(photo)} />
            {photoCaption(photo) && <figcaption>{photoCaption(photo)}</figcaption>}
          </figure>
        ))}
      </section>
      <footer>
        <QrImage src={qrDataUrl} label={`QR code for ${shareUrl}`} small />
        <div><strong>Share a memory</strong><span>{shareUrl}</span></div>
      </footer>
    </article>
  );
}

function Pricing() {
  return (
    <div className="pricing">
      {planCatalog.map((plan) => (
        <article key={plan.name}>
          <h3>{plan.name}</h3>
          <strong>{plan.price}</strong>
          <p>{plan.bestFor}. Includes {plan.includes.slice(0, 3).join(', ')}.</p>
        </article>
      ))}
    </div>
  );
}

function Onboarding() {
  const familySteps = [
    ['Create', 'A family admin starts from a guided memorial draft instead of a blank page.'],
    ['Invite', 'Relatives, friends, and guests receive a private link for memories, photos, and service details.'],
    ['Review', 'The family approves guest memories before anything appears publicly.'],
    ['Preserve', 'After the gathering, the archive, guest list, and keepsakes can be downloaded.']
  ];
  const partnerSteps = [
    ['Co-brand', 'Funeral homes can start polished drafts with service details already filled in.'],
    ['Handoff', 'Families receive ownership while coordinators remain scoped co-admins.'],
    ['Support', 'QR cards, livestream links, RSVPs, and support links are ready before the service.'],
    ['Renew', 'Partners manage recurring family pages without forcing families into subscriptions.']
  ];

  return (
    <section className="onboarding">
      <div className="onboarding-head">
        <p className="eyebrow"><Users size={16} /> Onboarding</p>
        <h2>A launch flow for families and funeral-home partners.</h2>
      </div>
      <div className="path-grid">
        <Path title="Family path" steps={familySteps} />
        <Path title="Funeral-home path" steps={partnerSteps} />
      </div>
    </section>
  );
}

function Path({ title, steps }) {
  return (
    <article className="path-card">
      <h3>{title}</h3>
      {steps.map(([label, text], index) => (
        <div className="path-step" key={label}>
          <span>{index + 1}</span>
          <div>
            <strong>{label}</strong>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </article>
  );
}

function TrustCenter() {
  const items = [
    ['Privacy', 'Private pages, password modes, hidden-from-search options, and family-controlled sharing.'],
    ['Moderation', 'Guest memories wait for family approval before appearing on the memorial page.'],
    ['Portability', 'Families can download page data, guest lists, and keepsake archives before closing a page.'],
    ['Support', 'Funeral homes can co-admin pages without taking ownership away from the family.']
  ];

  return (
    <section className="trust-center">
      <div>
        <p className="eyebrow"><Shield size={16} /> Trust center</p>
        <h2>Made for a sensitive moment, with controls families can understand.</h2>
        <p>
          Kindred Pages avoids social-feed pressure and keeps the workflow calm: share what is needed,
          approve what appears publicly, and preserve the archive when the gathering is over.
        </p>
      </div>
      <div className="trust-matrix">
        {items.map(([title, text]) => (
          <article key={title}>
            <Check size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="legal-strip">
        <a href="/privacy.html">Privacy policy</a>
        <a href="/terms.html">Terms of service</a>
        <span>Funeral-home handoff ready</span>
        <span>Archive export ready</span>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
