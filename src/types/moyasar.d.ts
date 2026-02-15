declare global {
  interface Window {
    Moyasar: {
      init: (config: {
        element: string;
        amount: number;
        currency: string;
        description: string;
        publishable_api_key: string;
        callback_url: string;
        methods: string[];
        on_completed?: (payment: MoyasarPayment) => void;
        on_failed?: (error: any) => void;
        fixed_width?: boolean;
      }) => void;
    };
  }
}

export interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  source: {
    type: string;
    name?: string;
    number?: string;
  };
}

export {};
