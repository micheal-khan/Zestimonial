import type { PublicTestimonial } from '@/lib/widgets';

/** Placeholder testimonials for previewing widgets before any real ones are approved. Never shown publicly. */
export const sampleTestimonials: PublicTestimonial[] = [
  { id: 'sample-1', author_name: 'Maya Chen', author_role: 'Founder at Northstar', rating: 5, tags: ['results', 'quality'], highlight: 'Demo bookings climbed in the first week.', quote: 'Working with you completely changed how we explain our product. The new site feels unmistakably us, and demo bookings climbed in the first week.' },
  { id: 'sample-2', author_name: 'Daniel Okafor', author_role: 'Product Lead at Plane', rating: 5, tags: ['communication', 'speed'], highlight: 'Every decision was explained clearly.', quote: 'Thoughtful, fast, and incredibly sharp. Every decision was explained clearly, and the finished experience was better than we imagined.' },
  { id: 'sample-3', author_name: 'Olivia Martin', author_role: 'Creative Director at Fold', rating: 5, tags: ['creativity', 'expertise'], highlight: 'A rare ability to turn a fuzzy idea into something beautiful.', quote: 'There’s a rare ability to turn a fuzzy idea into something beautiful and useful here. I would work together again in a heartbeat.' },
  { id: 'sample-4', author_name: 'Sam Rivera', author_role: 'COO at Fieldnote', rating: 4, tags: ['reliability', 'process'], highlight: 'Our team picked it up in a day.', quote: 'Delivered on time and the handover docs were excellent. Our team picked it up in a day, and we haven’t had a single issue since.' },
  { id: 'sample-5', author_name: 'Priya Nair', author_role: 'Marketing Manager at Loop', rating: 5, tags: ['value', 'results'], highlight: 'Paid for itself within a month.', quote: 'Honestly the best investment we made this year. The new campaign paid for itself within a month.' },
  { id: 'sample-6', author_name: 'Jonas Weber', author_role: 'Owner, Weber & Co.', rating: 5, tags: ['support', 'communication'], highlight: 'Always a quick, friendly reply.', quote: 'Whenever we had a question there was always a quick, friendly reply. It never felt like we were bothering anyone.' },
];
