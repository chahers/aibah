export interface FaqItem {
  question: string
  answer: string
}

// TODO: replace the answers below with your real policies before launch.
export const faqs: FaqItem[] = [
  {
    question: 'What is the return policy?',
    answer:
      'If something is not right with your order, get in touch through Contact Us and we will work out a return or exchange with you. Items should be unworn and unwashed, with tags attached.',
  },
  {
    question: 'Are any purchases final sale?',
    answer:
      'Limited drops and sale items may be marked as final sale on the product page. Anything marked this way cannot be returned or exchanged.',
  },
  {
    question: 'When will I get my order?',
    answer:
      'Orders are packed and shipped after payment is confirmed. You can follow your parcel any time on the Track Your Order page.',
  },
  {
    question: 'Where are your products manufactured?',
    answer:
      'Every AIBAH piece is made to our spec by a manufacturing partner we work with directly. Fabric and print details are listed on each product page.',
  },
  {
    question: 'How much does shipping cost?',
    answer: 'Delivery across Malaysia is complimentary.',
  },
]

// TODO: replace the placeholder dashes with the real measurements (cm) for the Oversized Box Tee.
export const sizeChart = {
  columns: ['Size', 'Chest width', 'Body length', 'Sleeve length'],
  rows: [
    ['XS', '–', '–', '–'],
    ['S', '–', '–', '–'],
    ['M', '–', '–', '–'],
    ['L', '–', '–', '–'],
    ['XL', '–', '–', '–'],
  ],
}
