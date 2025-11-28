import { RadioOption } from '../app-radio/app-radio';

export const checkboxExamples = {
  basic: {
    label: 'Accept terms and conditions',
    description: 'I agree to the terms and conditions',
  },
  withDescription: {
    label: 'Email notifications',
    description: 'Receive email updates about new features and announcements',
  },
  required: {
    label: 'Required checkbox',
    description: 'This field must be checked to continue',
    required: true,
  },
  disabled: {
    label: 'Disabled checkbox',
    description: 'This checkbox is disabled',
    disabled: true,
  },
};

export const radioExamples = {
  paymentMethods: [
    { value: 'credit', label: 'Credit Card', description: 'Pay with credit or debit card' },
    { value: 'paypal', label: 'PayPal', description: 'Pay securely with PayPal' },
    { value: 'bank', label: 'Bank Transfer', description: 'Direct bank transfer' },
  ] as RadioOption[],
  subscriptionPlans: [
    { value: 'free', label: 'Free Plan', description: 'Basic features for individuals' },
    { value: 'pro', label: 'Pro Plan', description: 'Advanced features for professionals - $9.99/month' },
    { value: 'team', label: 'Team Plan', description: 'Collaboration tools for teams - $19.99/month' },
    { value: 'enterprise', label: 'Enterprise Plan', description: 'Custom solutions for large organizations' },
  ] as RadioOption[],
  simpleOptions: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'maybe', label: 'Maybe' },
  ] as RadioOption[],
};

export const switchExamples = {
  basic: {
    label: 'Enable notifications',
    description: 'Receive push notifications on your device',
  },
  simple: {
    label: 'Dark mode',
  },
  required: {
    label: 'Accept privacy policy',
    description: 'You must accept our privacy policy to continue',
    required: true,
  },
  disabled: {
    label: 'Disabled switch',
    description: 'This switch is disabled',
    disabled: true,
  },
};
